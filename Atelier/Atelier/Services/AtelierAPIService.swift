import Foundation
import UIKit

enum AtelierAPIServiceError: LocalizedError {
    case missingBaseURL
    case invalidImage
    case invalidResponse
    case apiError(String)

    var errorDescription: String? {
        switch self {
        case .missingBaseURL:
            return "Add API_BASE_URL to Config/Secrets.plist."
        case .invalidImage:
            return "Could not prepare the room photo for upload."
        case .invalidResponse:
            return "Received an unexpected response from the Atelier API."
        case .apiError(let message):
            return message
        }
    }
}

struct AtelierAPIService {
    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    func generateRedesign(roomImage: UIImage, style: DesignStyle) async throws -> UIImage {
        guard let baseURL = APIConfiguration.apiBaseURL else {
            throw AtelierAPIServiceError.missingBaseURL
        }

        guard let imageData = ImageProcessor.pngDataForUpload(from: roomImage) else {
            throw AtelierAPIServiceError.invalidImage
        }

        let endpoint = baseURL.appending(path: "api/redesigns")
        let boundary = "Boundary-\(UUID().uuidString)"
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 180
        request.httpBody = buildMultipartBody(
            boundary: boundary,
            imageData: imageData,
            styleId: style.id
        )

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw AtelierAPIServiceError.invalidResponse
        }

        if httpResponse.statusCode != 201 {
            if let apiError = try? JSONDecoder().decode(APIErrorResponse.self, from: data) {
                throw AtelierAPIServiceError.apiError(apiError.message)
            }
            let body = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw AtelierAPIServiceError.apiError("Request failed (\(httpResponse.statusCode)): \(body)")
        }

        let decoded = try JSONDecoder().decode(RedesignResultResponse.self, from: data)

        guard let imageData = Data(base64Encoded: decoded.imageBase64),
              let image = UIImage(data: imageData) else {
            throw AtelierAPIServiceError.invalidResponse
        }

        return image
    }

    private func buildMultipartBody(
        boundary: String,
        imageData: Data,
        styleId: String
    ) -> Data {
        var body = Data()
        let lineBreak = "\r\n"

        func appendField(name: String, value: String) {
            body.append("--\(boundary)\(lineBreak)")
            body.append("Content-Disposition: form-data; name=\"\(name)\"\(lineBreak)\(lineBreak)")
            body.append("\(value)\(lineBreak)")
        }

        appendField(name: "styleId", value: styleId)

        body.append("--\(boundary)\(lineBreak)")
        body.append("Content-Disposition: form-data; name=\"image\"; filename=\"room.png\"\(lineBreak)")
        body.append("Content-Type: image/png\(lineBreak)\(lineBreak)")
        body.append(imageData)
        body.append(lineBreak)
        body.append("--\(boundary)--\(lineBreak)")

        return body
    }
}

private struct RedesignResultResponse: Decodable {
    let styleId: String
    let mimeType: String
    let imageBase64: String
}

private struct APIErrorResponse: Decodable {
    let message: String
}

private extension Data {
    mutating func append(_ string: String) {
        if let data = string.data(using: .utf8) {
            append(data)
        }
    }
}
