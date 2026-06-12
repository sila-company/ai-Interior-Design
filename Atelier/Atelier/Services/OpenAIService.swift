import Foundation
import UIKit

enum OpenAIServiceError: LocalizedError {
    case missingAPIKey
    case invalidImage
    case invalidResponse
    case apiError(String)

    var errorDescription: String? {
        switch self {
        case .missingAPIKey:
            return "Add your OpenAI API key to Config/Secrets.plist."
        case .invalidImage:
            return "Could not prepare the room photo for upload."
        case .invalidResponse:
            return "Received an unexpected response from OpenAI."
        case .apiError(let message):
            return message
        }
    }
}

struct OpenAIService {
    /// OpenAI's latest image model for high-fidelity edits (Image API).
    private static let imageModel = "gpt-image-2"

    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    func generateRedesign(roomImage: UIImage, style: DesignStyle) async throws -> UIImage {
        guard let apiKey = APIConfiguration.openAIAPIKey else {
            throw OpenAIServiceError.missingAPIKey
        }

        guard let imageData = ImageProcessor.pngDataForUpload(from: roomImage) else {
            throw OpenAIServiceError.invalidImage
        }

        let boundary = "Boundary-\(UUID().uuidString)"
        var request = URLRequest(url: URL(string: "https://api.openai.com/v1/images/edits")!)
        request.httpMethod = "POST"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 180
        request.httpBody = buildMultipartBody(
            boundary: boundary,
            imageData: imageData,
            prompt: style.redesignPrompt
        )

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw OpenAIServiceError.invalidResponse
        }

        if httpResponse.statusCode != 200 {
            if let apiError = try? JSONDecoder().decode(OpenAIErrorResponse.self, from: data) {
                throw OpenAIServiceError.apiError(apiError.error.message)
            }
            let body = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw OpenAIServiceError.apiError("Request failed (\(httpResponse.statusCode)): \(body)")
        }

        let decoded = try JSONDecoder().decode(OpenAIImageResponse.self, from: data)

        guard let imagePayload = decoded.data.first else {
            throw OpenAIServiceError.invalidResponse
        }

        if let base64 = imagePayload.b64_json,
           let imageData = Data(base64Encoded: base64),
           let image = UIImage(data: imageData) {
            return image
        }

        if let urlString = imagePayload.url,
           let url = URL(string: urlString) {
            let (imageData, _) = try await session.data(from: url)
            guard let image = UIImage(data: imageData) else {
                throw OpenAIServiceError.invalidResponse
            }
            return image
        }

        throw OpenAIServiceError.invalidResponse
    }

    private func buildMultipartBody(boundary: String, imageData: Data, prompt: String) -> Data {
        var body = Data()
        let lineBreak = "\r\n"

        func appendField(name: String, value: String) {
            body.append("--\(boundary)\(lineBreak)")
            body.append("Content-Disposition: form-data; name=\"\(name)\"\(lineBreak)\(lineBreak)")
            body.append("\(value)\(lineBreak)")
        }

        appendField(name: "model", value: Self.imageModel)
        appendField(name: "prompt", value: prompt)
        appendField(name: "quality", value: "high")
        appendField(name: "size", value: "auto")
        appendField(name: "output_format", value: "jpeg")

        body.append("--\(boundary)\(lineBreak)")
        body.append("Content-Disposition: form-data; name=\"image\"; filename=\"room.png\"\(lineBreak)")
        body.append("Content-Type: image/png\(lineBreak)\(lineBreak)")
        body.append(imageData)
        body.append(lineBreak)
        body.append("--\(boundary)--\(lineBreak)")

        return body
    }
}

private struct OpenAIImageResponse: Decodable {
    let data: [ImagePayload]
}

private struct ImagePayload: Decodable {
    let b64_json: String?
    let url: String?
}

private struct OpenAIErrorResponse: Decodable {
    let error: APIErrorDetail
}

private struct APIErrorDetail: Decodable {
    let message: String
}

private extension Data {
    mutating func append(_ string: String) {
        if let data = string.data(using: .utf8) {
            append(data)
        }
    }
}
