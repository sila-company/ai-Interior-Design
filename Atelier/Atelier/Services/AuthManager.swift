import Foundation

@Observable
@MainActor
final class AuthManager {
    var user: AuthUser?
    var isLoading = true

    private let api = AtelierAPIService()

    init() {
        Task {
            await restoreSession()
        }
    }

    var isAuthenticated: Bool {
        user != nil
    }

    func restoreSession() async {
        defer { isLoading = false }

        guard KeychainStore.loadToken() != nil else {
            user = nil
            return
        }

        do {
            user = try await api.fetchCurrentUser()
        } catch {
            KeychainStore.clearToken()
            user = nil
        }
    }

    func register(name: String, email: String, password: String) async throws {
        let response = try await api.register(name: name, email: email, password: password)
        KeychainStore.saveToken(response.token)
        user = AuthUser(id: response.user.id, email: response.user.email, name: response.user.name)
    }

    func login(email: String, password: String) async throws {
        let response = try await api.login(email: email, password: password)
        KeychainStore.saveToken(response.token)
        user = AuthUser(id: response.user.id, email: response.user.email, name: response.user.name)
    }

    func logout() async {
        try? await api.logout()
        KeychainStore.clearToken()
        user = nil
    }
}
