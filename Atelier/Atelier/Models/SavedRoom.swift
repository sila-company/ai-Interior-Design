import Foundation

struct SavedRoom: Identifiable, Equatable, Hashable {
    let id: String
    let name: String
    let originalImageURL: URL
    let redesignCount: Int
}

struct AuthUser: Identifiable, Equatable {
    let id: String
    let email: String
    let name: String
}

struct SavedRedesign: Identifiable, Equatable {
    let id: String
    let roomId: String
    let styleId: String
    let mimeType: String
    let resultImageURL: URL
    let originalImageURL: URL
}
