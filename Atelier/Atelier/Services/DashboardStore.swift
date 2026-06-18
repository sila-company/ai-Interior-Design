import Foundation

@Observable
@MainActor
final class DashboardStore {
    var rooms: [SavedRoom] = []
    var redesigns: [SavedRedesign] = []
    var isLoading = false
    var errorMessage: String?

    private let service = AtelierAPIService()

    func refresh() async {
        isLoading = rooms.isEmpty && redesigns.isEmpty
        errorMessage = nil

        do {
            async let roomsTask = service.fetchRooms()
            async let redesignsTask = service.fetchRedesigns()
            rooms = try await roomsTask
            redesigns = try await redesignsTask
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}
