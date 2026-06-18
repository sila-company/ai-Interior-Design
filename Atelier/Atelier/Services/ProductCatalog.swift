import Foundation

struct ProductCatalog {
    static func bundle(for roomName: String?, style: DesignStyle, limit: Int = 12) -> [ShoppableProduct] {
        let roomType = inferRoomType(from: roomName)
        let styleAliases = aliases(for: style.id)

        let roomMatches = products.filter { product in
            product.roomType == roomType || product.notes.localizedCaseInsensitiveContains(roomType.displayName)
        }

        let ranked = roomMatches.sorted { lhs, rhs in
            score(lhs, styleAliases: styleAliases) > score(rhs, styleAliases: styleAliases)
        }

        return Array(ranked.prefix(limit))
    }

    static func promptBrief(for products: [ShoppableProduct]) -> [[String: Any]] {
        products.map { product in
            [
                "category": product.displayCategory,
                "title": product.shortTitle,
                "price": product.price.map { "\($0)" } ?? "",
                "retailer": product.retailer,
                "imageUrl": product.imageURL.absoluteString,
                "color": product.color,
                "material": product.material,
                "dimensions": dimensionsText(for: product),
                "visualDescription": product.visualDescription,
            ]
        }
    }

    private static func inferRoomType(from roomName: String?) -> RoomType {
        let name = roomName?.lowercased() ?? ""
        if name.contains("bed") || name.contains("master") || name.contains("guest") {
            return .bedroom
        }
        return .livingRoom
    }

    private static func aliases(for styleId: String) -> Set<String> {
        switch styleId {
        case "minimal":
            return ["minimal", "minimalist", "modern", "neutral"]
        case "scandinavian":
            return ["scandinavian", "modern", "minimalist", "cozy", "neutral"]
        case "cozy":
            return ["cozy", "boho", "farmhouse", "neutral"]
        case "luxe":
            return ["luxe", "luxury", "modern"]
        case "industrial":
            return ["industrial", "modern"]
        default:
            return ["modern", "minimalist", "cozy"]
        }
    }

    private static func score(_ product: ShoppableProduct, styleAliases: Set<String>) -> Int {
        product.styleTags.reduce(0) { total, tag in
            total + (styleAliases.contains(tag) ? 1 : 0)
        }
    }

    private static func dimensionsText(for product: ShoppableProduct) -> String {
        let parts = [
            product.width.map { formatNumber($0) },
            product.depth.map { formatNumber($0) },
            product.height.map { formatNumber($0) },
        ].compactMap { $0 }

        guard !parts.isEmpty else { return "" }
        return "\(parts.joined(separator: " x ")) \(product.dimensionUnit)"
    }

    private static func formatNumber(_ value: Double) -> String {
        if value.rounded() == value {
            return String(Int(value))
        }
        return String(format: "%.1f", value)
    }

    static let products: [ShoppableProduct] = []
}
