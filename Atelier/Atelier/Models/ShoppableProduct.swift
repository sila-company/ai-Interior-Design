import Foundation

struct ShoppableProduct: Identifiable, Equatable, Hashable {
    let id: String
    let roomType: RoomType
    let category: String
    let title: String
    let price: Decimal?
    let currency: String
    let retailer: String
    let affiliateURL: URL
    let productURL: URL
    let imageURL: URL
    let width: Double?
    let depth: Double?
    let height: Double?
    let dimensionUnit: String
    let color: String
    let material: String
    let styleTags: [String]
    let visualDescription: String
    let notes: String

    var displayCategory: String {
        category
            .replacingOccurrences(of: "_", with: " ")
            .capitalized
    }

    var priceText: String {
        guard let price else { return "Verify price" }

        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = currency
        formatter.maximumFractionDigits = 2
        return formatter.string(from: price as NSDecimalNumber) ?? "$\(price)"
    }

    var shortTitle: String {
        let pieces = title.components(separatedBy: ",")
        return pieces.first?.trimmingCharacters(in: .whitespacesAndNewlines) ?? title
    }
}

enum RoomType: String, Equatable, Hashable {
    case livingRoom = "living_room"
    case bedroom

    var displayName: String {
        switch self {
        case .livingRoom:
            return "Living room"
        case .bedroom:
            return "Bedroom"
        }
    }
}
