import Foundation
import UIKit

enum AtelierAPIServiceError: LocalizedError {
    case missingBaseURL
    case invalidImage
    case invalidResponse
    case apiError(String)
    case subscriptionRequired(freeRemaining: Int)

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
        case .subscriptionRequired:
            return "Subscribe to Atelier Membership for unlimited redesigns."
        }
    }

    var isSubscriptionRequired: Bool {
        if case .subscriptionRequired = self { return true }
        return false
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

struct MembershipStatusResponse: Decodable {
    let isActive: Bool
    let freeRemaining: Int
    let expiresAt: String?
    let redesignCount: Int
    let productId: String?
}

struct RoomResponse: Decodable {
    let id: String
    let name: String
    let originalImageUrl: String
    let createdAt: String
    let redesignCount: Int
    let description: String?
    let length: Double?
    let width: Double?
    let height: Double?
    let dimensionUnit: String?
    let budgetAmount: Int?
    let budgetCurrency: String?
}

struct RedesignResponse: Decodable {
    let id: String
    let roomId: String
    let styleId: String
    let mimeType: String
    let resultImageUrl: String
    let originalImageUrl: String?
    let imageBase64: String?
    let products: [ProductResponse]?
    let createdAt: String
}

struct ProductResponse: Decodable {
    let id: String
    let roomType: String
    let category: String
    let title: String
    let price: String?
    let currency: String
    let retailer: String
    let affiliateUrl: String
    let productUrl: String
    let imageUrl: String?
    let width: Double?
    let depth: Double?
    let height: Double?
    let dimensionUnit: String
    let color: String?
    let material: String?
    let styleTags: [String]
    let visualDescription: String?
}

struct GeneratedRedesignResult {
    let image: UIImage
    let products: [ShoppableProduct]
}

struct AtelierAPIService {
    private let session: URLSession
    private let redesignSession: URLSession

    init(
        session: URLSession = APIConfiguration.standardSession,
        redesignSession: URLSession = APIConfiguration.redesignSession
    ) {
        self.session = session
        self.redesignSession = redesignSession
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

    func fetchMembershipStatus() async throws -> MembershipStatus {
        let response: MembershipStatusResponse = try await sendJSON(
            path: "api/subscription/status",
            method: "GET",
            body: nil,
            authorized: true,
            decoder: MembershipStatusResponse.self
        )
        return mapMembershipStatus(response)
    }

    func syncSubscription(signedTransaction: String) async throws -> MembershipStatus {
        let body = try JSONSerialization.data(withJSONObject: [
            "signedTransaction": signedTransaction,
        ])
        let response: MembershipStatusResponse = try await sendJSON(
            path: "api/subscription/sync",
            method: "POST",
            body: body,
            authorized: true,
            decoder: MembershipStatusResponse.self
        )
        return mapMembershipStatus(response)
    }

    func deleteAccount() async throws {
        _ = try await sendJSON(
            path: "api/auth/me",
            method: "DELETE",
            body: nil,
            authorized: true,
            decoder: EmptyResponse.self
        )
    }

    func updateProfile(name: String) async throws -> AuthUser {
        let body = try JSONSerialization.data(withJSONObject: [
            "name": name,
        ])

        struct MeResponse: Decodable {
            let user: AuthUserResponse
        }

        let response: MeResponse = try await sendJSON(
            path: "api/auth/me",
            method: "PATCH",
            body: body,
            authorized: true,
            decoder: MeResponse.self
        )

        return AuthUser(id: response.user.id, email: response.user.email, name: response.user.name)
    }

    func changePassword(currentPassword: String, newPassword: String) async throws {
        let body = try JSONSerialization.data(withJSONObject: [
            "currentPassword": currentPassword,
            "newPassword": newPassword,
        ])

        _ = try await sendJSON(
            path: "api/auth/change-password",
            method: "POST",
            body: body,
            authorized: true,
            decoder: EmptyResponse.self
        )
    }

    func fetchCurrentUser() async throws -> AuthUser {
        struct MeResponse: Decodable {
            let user: AuthUserResponse
            let membership: MembershipStatusResponse?
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

    func createRoom(name: String, image: UIImage, input: CreateRoomInput) async throws -> SavedRoom {
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
        func appendField(_ name: String, _ value: String) {
            body.append("--\(boundary)\(lineBreak)")
            body.append("Content-Disposition: form-data; name=\"\(name)\"\(lineBreak)\(lineBreak)")
            body.append("\(value)\(lineBreak)")
        }

        appendField("name", name)
        appendField("description", input.description.trimmingCharacters(in: .whitespacesAndNewlines))

        if input.includesDimensions {
            appendField("dimensionUnit", input.dimensionUnit.rawValue)
            if let length = parseDimension(input.length) {
                appendField("length", String(length))
            }
            if let width = parseDimension(input.width) {
                appendField("width", String(width))
            }
            if let height = parseDimension(input.height) {
                appendField("height", String(height))
            }
        }

        if input.includesBudget, let budget = parseBudget(input.budget) {
            appendField("budgetAmount", String(budget))
            appendField("budgetCurrency", "USD")
        }

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

    private func parseDimension(_ value: String) -> Double? {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, let number = Double(trimmed), number > 0 else { return nil }
        return number
    }

    private func parseBudget(_ value: String) -> Int? {
        let digits = value.filter(\.isNumber)
        guard let number = Int(digits), number > 0 else { return nil }
        return number
    }

    func generateRedesign(
        roomId: String,
        style: DesignStyle? = nil,
        customStyleDescription: String? = nil,
        revisionInstruction: String? = nil
    ) async throws -> GeneratedRedesignResult {
        var payload: [String: Any] = [
            "roomId": roomId,
        ]

        if let style {
            payload["styleId"] = style.id
        }

        if let customStyleDescription {
            let trimmed = customStyleDescription.trimmingCharacters(in: .whitespacesAndNewlines)
            if !trimmed.isEmpty {
                payload["customStyleDescription"] = trimmed
            }
        }

        if style == nil && payload["customStyleDescription"] == nil {
            throw AtelierAPIServiceError.invalidResponse
        }

        if let revisionInstruction,
           !revisionInstruction.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            payload["revisionInstruction"] = revisionInstruction
        }

        let body = try JSONSerialization.data(withJSONObject: payload)

        let response: RedesignResponse = try await sendJSON(
            path: "api/redesigns",
            method: "POST",
            body: body,
            authorized: true,
            decoder: RedesignResponse.self,
            timeout: APIConfiguration.redesignTimeout,
            session: redesignSession
        )

        if let url = absoluteURL(from: response.resultImageUrl) {
            let request = authorizedRequest(
                url: url,
                method: "GET",
                timeout: APIConfiguration.redesignTimeout
            )
            let (data, httpResponse) = try await redesignSession.data(for: request)
            if let http = httpResponse as? HTTPURLResponse, http.statusCode == 200,
               let image = UIImage(data: data) {
                return GeneratedRedesignResult(
                    image: image,
                    products: uniqueProductsByCategory(response.products?.compactMap(mapProduct) ?? [])
                )
            }
        }

        if let imageBase64 = response.imageBase64,
           let imageData = Data(base64Encoded: imageBase64),
           let image = UIImage(data: imageData) {
            return GeneratedRedesignResult(
                image: image,
                products: uniqueProductsByCategory(response.products?.compactMap(mapProduct) ?? [])
            )
        }

        guard let url = absoluteURL(from: response.resultImageUrl) else {
            throw AtelierAPIServiceError.invalidResponse
        }

        let request = authorizedRequest(
            url: url,
            method: "GET",
            timeout: APIConfiguration.redesignTimeout
        )
        let (data, httpResponse) = try await redesignSession.data(for: request)
        guard let http = httpResponse as? HTTPURLResponse, http.statusCode == 200,
              let image = UIImage(data: data) else {
            throw AtelierAPIServiceError.invalidResponse
        }
        return GeneratedRedesignResult(
            image: image,
            products: uniqueProductsByCategory(response.products?.compactMap(mapProduct) ?? [])
        )
    }

    private func uniqueProductsByCategory(_ products: [ShoppableProduct]) -> [ShoppableProduct] {
        var seenCategories = Set<String>()
        return products.filter { product in
            let category = product.category.lowercased()
            guard !seenCategories.contains(category) else { return false }
            seenCategories.insert(category)
            return true
        }
    }

    private func mapMembershipStatus(_ response: MembershipStatusResponse) -> MembershipStatus {
        let expiresAt = response.expiresAt.flatMap { ISO8601DateFormatter().date(from: $0) }
        return MembershipStatus(
            isActive: response.isActive,
            freeRemaining: response.freeRemaining,
            expiresAt: expiresAt,
            redesignCount: response.redesignCount,
            productId: response.productId
        )
    }

    private func mapProduct(_ product: ProductResponse) -> ShoppableProduct? {
        guard let affiliateURL = URL(string: product.affiliateUrl),
              let productURL = URL(string: product.productUrl),
              let imageURLString = product.imageUrl,
              let imageURL = URL(string: imageURLString) else {
            return nil
        }

        return ShoppableProduct(
            id: product.id,
            roomType: product.roomType == "bedroom" ? .bedroom : .livingRoom,
            category: product.category,
            title: product.title,
            price: product.price.flatMap { Decimal(string: $0) },
            currency: product.currency,
            retailer: product.retailer,
            affiliateURL: affiliateURL,
            productURL: productURL,
            imageURL: imageURL,
            width: product.width,
            depth: product.depth,
            height: product.height,
            dimensionUnit: product.dimensionUnit,
            color: product.color ?? "",
            material: product.material ?? "",
            styleTags: product.styleTags,
            visualDescription: product.visualDescription ?? "",
            notes: "Selected from live inventory."
        )
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
            originalImageURL: originalURL,
            products: redesign.products?.compactMap(mapProduct) ?? []
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
            redesignCount: room.redesignCount,
            preferences: mapPreferences(room)
        )
    }

    private func mapPreferences(_ room: RoomResponse) -> RoomPreferences {
        RoomPreferences(
            description: room.description,
            length: room.length,
            width: room.width,
            height: room.height,
            dimensionUnit: room.dimensionUnit.flatMap(DimensionUnit.init(rawValue:)),
            budgetAmount: room.budgetAmount,
            budgetCurrency: room.budgetCurrency ?? "USD"
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

    private func authorizedRequest(
        url: URL,
        method: String,
        timeout: TimeInterval = APIConfiguration.standardTimeout
    ) -> URLRequest {
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.timeoutInterval = timeout
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
        decoder: T.Type,
        timeout: TimeInterval = APIConfiguration.standardTimeout,
        session: URLSession? = nil
    ) async throws -> T {
        guard let baseURL = APIConfiguration.apiBaseURL else {
            throw AtelierAPIServiceError.missingBaseURL
        }

        var request = URLRequest(url: baseURL.appending(path: path))
        request.httpMethod = method
        request.timeoutInterval = timeout
        if let body {
            request.httpBody = body
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }
        if authorized, let token = KeychainStore.loadToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        return try await perform(request, decoder: decoder, session: session ?? self.session)
    }

    private func perform<T: Decodable>(
        _ request: URLRequest,
        decoder: T.Type,
        session: URLSession? = nil
    ) async throws -> T {
        let activeSession = session ?? self.session

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await activeSession.data(for: request)
        } catch let error as URLError where error.code == .timedOut {
            throw AtelierAPIServiceError.apiError(
                "The request took too long to finish. Check your connection and try again."
            )
        } catch {
            throw error
        }

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

        if httpResponse.statusCode == 402 {
            if let subscriptionError = try? JSONDecoder().decode(SubscriptionErrorResponse.self, from: data),
               subscriptionError.code == "subscription_required" {
                throw AtelierAPIServiceError.subscriptionRequired(
                    freeRemaining: subscriptionError.freeRemaining ?? 0
                )
            }
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            if httpResponse.statusCode == 402,
               let subscriptionError = try? JSONDecoder().decode(SubscriptionErrorResponse.self, from: data),
               subscriptionError.code == "subscription_required" {
                throw AtelierAPIServiceError.subscriptionRequired(
                    freeRemaining: subscriptionError.freeRemaining ?? 0
                )
            }

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

private struct SubscriptionErrorResponse: Decodable {
    let message: String?
    let code: String?
    let freeRemaining: Int?
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
