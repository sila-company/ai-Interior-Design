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

struct AuthResponse: Decodable {
    let token: String
    let user: AuthUserResponse
}

struct AuthUserResponse: Decodable {
    let id: String
    let email: String
    let name: String
}

struct RoomResponse: Decodable {
    let id: String
    let name: String
    let originalImageUrl: String
    let createdAt: String
    let redesignCount: Int
}

struct RedesignResponse: Decodable {
    let id: String
    let roomId: String
    let styleId: String
    let mimeType: String
    let resultImageUrl: String
    let originalImageUrl: String?
    let imageBase64: String?
    let createdAt: String
}

struct AtelierAPIService {
    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    func register(name: String, email: String, password: String) async throws -> AuthResponse {
        let body = try JSONSerialization.data(withJSONObject: [
            "name": name,
            "email": email,
            "password": password,
        ])
        return try await sendJSON(
            path: "api/auth/register",
            method: "POST",
            body: body,
            authorized: false,
            decoder: AuthResponse.self
        )
    }

    func login(email: String, password: String) async throws -> AuthResponse {
        let body = try JSONSerialization.data(withJSONObject: [
            "email": email,
            "password": password,
        ])
        return try await sendJSON(
            path: "api/auth/login",
            method: "POST",
            body: body,
            authorized: false,
            decoder: AuthResponse.self
        )
    }

    func logout() async throws {
        _ = try await sendJSON(
            path: "api/auth/logout",
            method: "POST",
            body: nil,
            authorized: true,
            decoder: EmptyResponse.self
        )
    }

    func fetchCurrentUser() async throws -> AuthUser {
        struct MeResponse: Decodable {
            let user: AuthUserResponse
        }

        let response: MeResponse = try await sendJSON(
            path: "api/auth/me",
            method: "GET",
            body: nil,
            authorized: true,
            decoder: MeResponse.self
        )

        return AuthUser(id: response.user.id, email: response.user.email, name: response.user.name)
    }

    func fetchRooms() async throws -> [SavedRoom] {
        let rooms: [RoomResponse] = try await sendJSON(
            path: "api/rooms",
            method: "GET",
            body: nil,
            authorized: true,
            decoder: [RoomResponse].self
        )

        return try rooms.map(mapRoom)
    }

    func fetchRedesigns() async throws -> [SavedRedesign] {
        let redesigns: [RedesignResponse] = try await sendJSON(
            path: "api/redesigns",
            method: "GET",
            body: nil,
            authorized: true,
            decoder: [RedesignResponse].self
        )

        return try redesigns.map(mapRedesign)
    }

    func fetchRoomDetail(roomId: String) async throws -> (SavedRoom, [SavedRedesign]) {
        struct RoomDetailResponse: Decodable {
            let room: RoomResponse
            let redesigns: [RedesignResponse]
        }

        let response: RoomDetailResponse = try await sendJSON(
            path: "api/rooms/\(roomId)",
            method: "GET",
            body: nil,
            authorized: true,
            decoder: RoomDetailResponse.self
        )

        return (try mapRoom(response.room), try response.redesigns.map(mapRedesign))
    }

    func createRoom(name: String, image: UIImage) async throws -> SavedRoom {
        guard let baseURL = APIConfiguration.apiBaseURL else {
            throw AtelierAPIServiceError.missingBaseURL
        }
        guard let imageData = ImageProcessor.jpegDataForUpload(from: image) else {
            throw AtelierAPIServiceError.invalidImage
        }

        let boundary = "Boundary-\(UUID().uuidString)"
        var request = authorizedRequest(url: baseURL.appending(path: "api/rooms"), method: "POST")
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()
        let lineBreak = "\r\n"
        body.append("--\(boundary)\(lineBreak)")
        body.append("Content-Disposition: form-data; name=\"name\"\(lineBreak)\(lineBreak)")
        body.append("\(name)\(lineBreak)")
        body.append("--\(boundary)\(lineBreak)")
        body.append("Content-Disposition: form-data; name=\"image\"; filename=\"room.jpg\"\(lineBreak)")
        body.append("Content-Type: image/jpeg\(lineBreak)\(lineBreak)")
        body.append(imageData)
        body.append(lineBreak)
        body.append("--\(boundary)--\(lineBreak)")
        request.httpBody = body

        let response: RoomResponse = try await perform(request, decoder: RoomResponse.self)
        return try mapRoom(response)
    }

    func generateRedesign(roomId: String, style: DesignStyle) async throws -> UIImage {
        let body = try JSONSerialization.data(withJSONObject: [
            "roomId": roomId,
            "styleId": style.id,
        ])

        let response: RedesignResponse = try await sendJSON(
            path: "api/redesigns",
            method: "POST",
            body: body,
            authorized: true,
            decoder: RedesignResponse.self
        )

        if let imageBase64 = response.imageBase64,
           let imageData = Data(base64Encoded: imageBase64),
           let image = UIImage(data: imageData) {
            return image
        }

        guard let url = absoluteURL(from: response.resultImageUrl) else {
            throw AtelierAPIServiceError.invalidResponse
        }

        let request = authorizedRequest(url: url, method: "GET")
        let (data, httpResponse) = try await session.data(for: request)
        guard let http = httpResponse as? HTTPURLResponse, http.statusCode == 200,
              let image = UIImage(data: data) else {
            throw AtelierAPIServiceError.invalidResponse
        }
        return image
    }

    private func mapRedesign(_ redesign: RedesignResponse) throws -> SavedRedesign {
        guard let resultURL = absoluteURL(from: redesign.resultImageUrl) else {
            throw AtelierAPIServiceError.invalidResponse
        }

        let originalURL: URL
        if let originalImageUrl = redesign.originalImageUrl,
           let url = absoluteURL(from: originalImageUrl) {
            originalURL = url
        } else {
            originalURL = resultURL
        }

        return SavedRedesign(
            id: redesign.id,
            roomId: redesign.roomId,
            styleId: redesign.styleId,
            mimeType: redesign.mimeType,
            resultImageURL: resultURL,
            originalImageURL: originalURL
        )
    }

    private func mapRoom(_ room: RoomResponse) throws -> SavedRoom {
        guard let url = absoluteURL(from: room.originalImageUrl) else {
            throw AtelierAPIServiceError.invalidResponse
        }
        return SavedRoom(
            id: room.id,
            name: room.name,
            originalImageURL: url,
            redesignCount: room.redesignCount
        )
    }

    private func absoluteURL(from path: String) -> URL? {
        if path.hasPrefix("http") {
            return URL(string: path)
        }
        guard let baseURL = APIConfiguration.apiBaseURL else {
            return nil
        }
        return URL(string: path, relativeTo: baseURL)?.absoluteURL
    }

    private func authorizedRequest(url: URL, method: String) -> URLRequest {
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.timeoutInterval = 180
        if let token = KeychainStore.loadToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        return request
    }

    private func sendJSON<T: Decodable>(
        path: String,
        method: String,
        body: Data?,
        authorized: Bool,
        decoder: T.Type
    ) async throws -> T {
        guard let baseURL = APIConfiguration.apiBaseURL else {
            throw AtelierAPIServiceError.missingBaseURL
        }

        var request = URLRequest(url: baseURL.appending(path: path))
        request.httpMethod = method
        request.timeoutInterval = 180
        if let body {
            request.httpBody = body
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }
        if authorized, let token = KeychainStore.loadToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        return try await perform(request, decoder: decoder)
    }

    private func perform<T: Decodable>(_ request: URLRequest, decoder: T.Type) async throws -> T {
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw AtelierAPIServiceError.invalidResponse
        }

        if httpResponse.statusCode == 401 {
            KeychainStore.clearToken()
        }

        if httpResponse.statusCode == 204, T.self == EmptyResponse.self {
            return EmptyResponse() as! T
        }

        if httpResponse.statusCode == 413 {
            throw AtelierAPIServiceError.apiError(
                "Photo is too large. Try a different image or take a new photo."
            )
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            if let apiError = try? JSONDecoder().decode(APIErrorResponse.self, from: data) {
                throw AtelierAPIServiceError.apiError(apiError.message)
            }
            let body = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw AtelierAPIServiceError.apiError("Request failed (\(httpResponse.statusCode)): \(body)")
        }

        if T.self == EmptyResponse.self {
            return EmptyResponse() as! T
        }

        if data.isEmpty {
            throw AtelierAPIServiceError.invalidResponse
        }

        return try JSONDecoder().decode(T.self, from: data)
    }
}

private struct APIErrorResponse: Decodable {
    let message: String
}

private struct EmptyResponse: Decodable {
    init() {}
}

private extension Data {
    mutating func append(_ string: String) {
        if let data = string.data(using: .utf8) {
            append(data)
        }
    }
}
