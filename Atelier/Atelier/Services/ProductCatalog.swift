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

    static let products: [ShoppableProduct] = [
        ShoppableProduct(
            id: "amazon-linsy-accent-chair-ottoman",
            roomType: .livingRoom,
            category: "accent_chair",
            title: "LINSY Accent Chair with Ottoman, Modern Barrel Chair Small Armchair Reading Chair with Footrest, Velvet, Cream",
            price: Decimal(string: "116.99"),
            currency: "USD",
            retailer: "Amazon",
            affiliateURL: URL(string: "https://amzn.to/43tyNvV")!,
            productURL: URL(string: "https://www.amazon.com/LINSY-Ottoman-Armchair-Reading-Footrest/dp/B0H2HLN64B")!,
            imageURL: URL(string: "https://m.media-amazon.com/images/I/81djaLSUNrL._AC_SL1500_.jpg")!,
            width: 27.4,
            depth: 25.6,
            height: 26.8,
            dimensionUnit: "in",
            color: "cream",
            material: "velvet",
            styleTags: ["modern", "cozy", "minimalist"],
            visualDescription: "A compact cream velvet barrel accent chair with rounded arms, a low curved back, soft upholstered seat, slim black metal legs, and a matching cream ottoman.",
            notes: "Small accent chair with ottoman; Amazon page lists velvet material."
        ),
        ShoppableProduct(
            id: "amazon-zttriee-round-coffee-table",
            roomType: .livingRoom,
            category: "coffee_table",
            title: "ZttRiee Coffee Table for Living Room, Modern Round Coffee Table with Cabinets & Sliding Doors, 29.9 Inch Fluted Center Table, Natural",
            price: Decimal(string: "139.99"),
            currency: "USD",
            retailer: "Amazon",
            affiliateURL: URL(string: "https://amzn.to/4vr4oe9")!,
            productURL: URL(string: "https://www.amazon.com/ZttRiee-Coffee-Living-Cabinets-Sliding/dp/B0FGPFBSJ8")!,
            imageURL: URL(string: "https://m.media-amazon.com/images/I/71ckFGe+tqL._AC_SL1500_.jpg")!,
            width: 29.9,
            depth: 29.9,
            height: 16.1,
            dimensionUnit: "in",
            color: "oak",
            material: "wood",
            styleTags: ["modern", "boho", "scandinavian"],
            visualDescription: "A low round natural-oak coffee table with a fluted cylindrical body, smooth circular top, concealed cabinet storage, and sliding curved doors.",
            notes: "Price should be verified."
        ),
        ShoppableProduct(
            id: "amazon-vasagle-maezo-side-table",
            roomType: .livingRoom,
            category: "side_table",
            title: "VASAGLE MAEZO Collection End Table with Charging Station, Narrow Side Table, Nightstand, Honey Brown",
            price: Decimal(string: "44.98"),
            currency: "USD",
            retailer: "Amazon",
            affiliateURL: URL(string: "https://amzn.to/4vaIRWQ")!,
            productURL: URL(string: "https://www.amazon.com/VASAGLE-MAEZO-Collection-Transitions-ULET329K101S/dp/B0H28FZH8L")!,
            imageURL: URL(string: "https://m.media-amazon.com/images/I/81m9BWEmi7L._AC_SL1500_.jpg")!,
            width: 18.9,
            depth: 11.8,
            height: 23.6,
            dimensionUnit: "in",
            color: "honey brown",
            material: "particleboard; mdf",
            styleTags: ["mid-century modern", "modern", "cozy"],
            visualDescription: "A narrow honey-brown side table with a warm wood-grain finish, simple rectangular frame, open lower shelf, small drawer, and built-in charging station.",
            notes: "Can work for living room or bedroom; includes charging station."
        ),
        ShoppableProduct(
            id: "amazon-garvee-beige-rug",
            roomType: .livingRoom,
            category: "rug",
            title: "Garvee Beige 8x10 Area Rug, Boho Vintage Non-Slip Washable Low Pile Rug",
            price: Decimal(string: "59.99"),
            currency: "USD",
            retailer: "Amazon",
            affiliateURL: URL(string: "https://amzn.to/4vbSi8q")!,
            productURL: URL(string: "https://www.amazon.com/Garvee-Beige-Non-Slip-Washable-Resistant/dp/B0GHYC8KVH")!,
            imageURL: URL(string: "https://m.media-amazon.com/images/I/81z00Wf0N3L._AC_SL1500_.jpg")!,
            width: 120,
            depth: 96,
            height: nil,
            dimensionUnit: "in",
            color: "beige",
            material: "faux wool",
            styleTags: ["boho", "cozy", "minimalist"],
            visualDescription: "A large beige low-pile area rug with a soft faux-wool texture, subtle vintage boho patterning, muted cream and tan tones, and a flat rectangular profile.",
            notes: "8 x 10 ft rectangular rug; also suitable for bedroom."
        ),
        ShoppableProduct(
            id: "amazon-minimalist-boho-wall-art",
            roomType: .livingRoom,
            category: "wall_art",
            title: "3 Piece Framed Minimalist Boho Canvas Wall Art, Abstract Sage Green Geometric Artwork, 12x16 Inch",
            price: Decimal(string: "47.99"),
            currency: "USD",
            retailer: "Amazon",
            affiliateURL: URL(string: "https://amzn.to/4e9cPoc")!,
            productURL: URL(string: "https://www.amazon.com/Minimalist-Bedroom-Abstract-Geometric-Paintings/dp/B0G438R3D3")!,
            imageURL: URL(string: "https://m.media-amazon.com/images/I/71ieSd0G8vL._AC_SL1500_.jpg")!,
            width: 12,
            depth: nil,
            height: 16,
            dimensionUnit: "in",
            color: "green white",
            material: "canvas; wood",
            styleTags: ["minimalist", "boho", "scandinavian", "modern"],
            visualDescription: "A set of three framed minimalist canvas prints with sage green and white abstract geometric shapes, thin natural frames, and clean modern boho composition.",
            notes: "Set of 3 framed pieces; also suitable for bedroom."
        ),
        ShoppableProduct(
            id: "amazon-wooden-floral-wall-decor",
            roomType: .livingRoom,
            category: "wall_art",
            title: "3D Wooden Floral Wall Decor Set of 4, Ready-to-Hang Framed Boho Botanical Wall Art, Naturals",
            price: Decimal(string: "39.99"),
            currency: "USD",
            retailer: "Amazon",
            affiliateURL: URL(string: "https://amzn.to/4e8ejit")!,
            productURL: URL(string: "https://www.amazon.com/Wooden-Floral-Bathroom-Lightweight-Bedroom/dp/B0DHW91KK4")!,
            imageURL: URL(string: "https://m.media-amazon.com/images/I/81Zgn5eG-5L._AC_SL1500_.jpg")!,
            width: 7,
            depth: nil,
            height: 16,
            dimensionUnit: "in",
            color: "naturals",
            material: "wood",
            styleTags: ["boho", "farmhouse", "cozy", "neutral"],
            visualDescription: "A set of four slim natural-wood framed wall panels with raised three-dimensional floral and botanical cutout details in a neutral boho style.",
            notes: "Set of 4; also suitable for bedroom, office, kitchen, or bathroom."
        ),
        ShoppableProduct(
            id: "amazon-bestier-queen-bed-frame",
            roomType: .bedroom,
            category: "bed_frame",
            title: "Bestier Queen Bed Frame with Adjustable Headboard & LED Lighting, Corduroy Upholstered Platform Bed Frame with Storage Shelf, Beige",
            price: nil,
            currency: "USD",
            retailer: "Amazon",
            affiliateURL: URL(string: "https://amzn.to/4v1suvA")!,
            productURL: URL(string: "https://www.amazon.com/Bestier-Corduroy-Upholstered-Adjustable-Headboard/dp/B0DKXW9QYK")!,
            imageURL: URL(string: "https://m.media-amazon.com/images/I/91r51mOPk+L._AC_SL1500_.jpg")!,
            width: 60.51,
            depth: 83.46,
            height: 39.37,
            dimensionUnit: "in",
            color: "beige",
            material: "corduroy; engineered plywood; foam; wood; metal",
            styleTags: ["modern", "minimalist", "cozy"],
            visualDescription: "A beige upholstered queen platform bed with soft corduroy texture, a padded adjustable headboard, integrated storage shelf, clean low-profile frame, and subtle built-in LED lighting.",
            notes: "Queen size; price should be verified."
        ),
        ShoppableProduct(
            id: "amazon-cozymine-fluted-nightstand",
            roomType: .bedroom,
            category: "nightstand",
            title: "CozyMine Fluted Nightstand with Charging Station, 2 Drawers Storage Bedside Table, Oak",
            price: Decimal(string: "109.99"),
            currency: "USD",
            retailer: "Amazon",
            affiliateURL: URL(string: "https://amzn.to/4xsHnZv")!,
            productURL: URL(string: "https://www.amazon.com/Nightstand-Charging-Station-Drawers-Storage/dp/B0G4RJR5B6")!,
            imageURL: URL(string: "https://m.media-amazon.com/images/I/81BLj7mPPZL._AC_SL1500_.jpg")!,
            width: 15.7,
            depth: 18,
            height: 23.6,
            dimensionUnit: "in",
            color: "oak",
            material: "engineered wood; metal; wood",
            styleTags: ["modern", "scandinavian", "cozy"],
            visualDescription: "A compact oak fluted nightstand with two drawers, vertical ribbed drawer fronts, rounded modern edges, short legs, and an integrated charging station on top.",
            notes: "Can work as bedroom nightstand or living room end table; includes charging station."
        ),
        ShoppableProduct(
            id: "amazon-tinge-lira-fabric-dresser",
            roomType: .bedroom,
            category: "dresser",
            title: "tinge Lira Premium 4 Drawer Fabric Dresser, Engineered Wood Frame Chest of Drawers, Dark Brown",
            price: nil,
            currency: "USD",
            retailer: "Amazon",
            affiliateURL: URL(string: "https://amzn.to/4uCVokO")!,
            productURL: URL(string: "https://www.amazon.com/Lira-Premium-Fabric-Dresser-Sag-Proof/dp/B0F5Q9WS76")!,
            imageURL: URL(string: "https://m.media-amazon.com/images/I/61ZefH2vlqL._AC_SL1500_.jpg")!,
            width: 23.4,
            depth: 11.8,
            height: 36.5,
            dimensionUnit: "in",
            color: "dark brown",
            material: "engineered wood; fabric; metal",
            styleTags: ["modern", "minimalist", "cozy"],
            visualDescription: "A compact dark-brown four-drawer dresser with a simple rectangular silhouette, warm wood-look frame, dark fabric drawer fronts, and slim black metal supports.",
            notes: "4-drawer compact dresser; price should be verified."
        ),
    ]
}
