import Photos
import SwiftUI

struct ResultsView: View {
    let originalImage: UIImage
    let redesignedImage: UIImage
    let style: DesignStyle

    @State private var showingBefore = false
    @State private var saveMessage: String?

    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)
    private let primaryText = Color(red: 0.114, green: 0.114, blue: 0.122)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 24) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Your redesign")
                        .font(.system(size: 28, weight: .semibold))
                        .tracking(-0.5)
                        .foregroundStyle(primaryText)

                    Text("\(style.name) style applied to your room.")
                        .font(.system(size: 17))
                        .foregroundStyle(secondaryText)
                }

                Picker("View", selection: $showingBefore) {
                    Text("After").tag(false)
                    Text("Before").tag(true)
                }
                .pickerStyle(.segmented)

                Image(uiImage: showingBefore ? originalImage : redesignedImage)
                    .resizable()
                    .scaledToFill()
                    .frame(maxWidth: .infinity)
                    .aspectRatio(4 / 3, contentMode: .fit)
                    .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                    .overlay {
                        RoundedRectangle(cornerRadius: 20, style: .continuous)
                            .stroke(Color.black.opacity(0.06), lineWidth: 1)
                    }
                    .shadow(color: .black.opacity(0.08), radius: 24, y: 12)
                    .animation(.easeInOut(duration: 0.25), value: showingBefore)

                if let saveMessage {
                    Text(saveMessage)
                        .font(.system(size: 14))
                        .foregroundStyle(secondaryText)
                        .frame(maxWidth: .infinity, alignment: .center)
                }

                Button {
                    saveToPhotos()
                } label: {
                    Text("Save to Photos")
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.white)
                .background(appleBlue, in: Capsule())
            }
            .padding(24)
        }
        .background(AppBackground())
        .navigationTitle("Results")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func saveToPhotos() {
        PHPhotoLibrary.requestAuthorization(for: .addOnly) { status in
            guard status == .authorized || status == .limited else {
                DispatchQueue.main.async {
                    saveMessage = "Photo access was denied."
                }
                return
            }

            PHPhotoLibrary.shared().performChanges {
                PHAssetChangeRequest.creationRequestForAsset(from: redesignedImage)
            } completionHandler: { success, error in
                DispatchQueue.main.async {
                    if success {
                        saveMessage = "Saved to your photo library."
                    } else {
                        saveMessage = error?.localizedDescription ?? "Could not save photo."
                    }
                }
            }
        }
    }
}

#Preview {
    NavigationStack {
        ResultsView(
            originalImage: UIImage(systemName: "photo")!,
            redesignedImage: UIImage(systemName: "photo.fill")!,
            style: .catalog[0]
        )
    }
}
