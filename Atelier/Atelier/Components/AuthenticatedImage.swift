import SwiftUI
import UIKit

enum AuthenticatedImageLoader {
    static func load(from url: URL) async throws -> UIImage {
        var request = URLRequest(url: url)
        if let token = KeychainStore.loadToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200,
              let image = UIImage(data: data) else {
            throw URLError(.badServerResponse)
        }
        return image
    }
}

struct AuthenticatedImage<Placeholder: View>: View {
    let url: URL
  @ViewBuilder let placeholder: () -> Placeholder

    @State private var image: UIImage?

    var body: some View {
        Group {
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
            } else {
                placeholder()
            }
        }
        .task(id: url) {
            image = try? await AuthenticatedImageLoader.load(from: url)
        }
    }
}
