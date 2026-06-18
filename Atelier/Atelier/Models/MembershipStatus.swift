import Foundation

struct MembershipStatus: Equatable {
    var isActive: Bool
    var freeRemaining: Int
    var expiresAt: Date?
    var redesignCount: Int
    var productId: String?

    static let empty = MembershipStatus(
        isActive: false,
        freeRemaining: 2,
        expiresAt: nil,
        redesignCount: 0,
        productId: nil
    )

    var canGenerate: Bool {
        isActive || freeRemaining > 0
    }

    var accountSummary: String {
        if isActive {
            if let expiresAt {
                let formatted = expiresAt.formatted(date: .abbreviated, time: .omitted)
                return "Member · renews \(formatted)"
            }
            return "Atelier Member"
        }

        if freeRemaining > 0 {
            let total = max(redesignCount + freeRemaining, 2)
            return "\(freeRemaining) of \(total) free redesigns remaining"
        }

        return "Subscribe for unlimited redesigns"
    }
}
