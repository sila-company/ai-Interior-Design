import SwiftUI

struct DesignStyle: Identifiable, Equatable, Hashable {
    let id: String
    let name: String
    let description: String
    let icon: String
    let gradient: [Color]

    static func == (lhs: DesignStyle, rhs: DesignStyle) -> Bool {
        lhs.id == rhs.id
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    var redesignPrompt: String {
        """
        Transform this interior room into a \(name.lowercased()) design. \(description) \
        Preserve the room layout, walls, windows, doors, ceiling, floor plan, and camera perspective. \
        Update furniture, materials, colors, lighting, textiles, and decor to match the style. \
        Photorealistic interior design photograph with natural lighting.
        """
    }

    static let catalog: [DesignStyle] = [
        DesignStyle(
            id: "modern",
            name: "Modern",
            description: "Clean lines, open space, and a calm neutral palette.",
            icon: "square.grid.2x2",
            gradient: [
                Color(red: 0.92, green: 0.93, blue: 0.95),
                Color(red: 0.78, green: 0.80, blue: 0.84),
            ]
        ),
        DesignStyle(
            id: "cozy",
            name: "Cozy",
            description: "Warm layers, soft textures, and inviting comfort.",
            icon: "sofa.fill",
            gradient: [
                Color(red: 0.96, green: 0.90, blue: 0.84),
                Color(red: 0.86, green: 0.74, blue: 0.64),
            ]
        ),
        DesignStyle(
            id: "minimal",
            name: "Minimal",
            description: "Quiet surfaces, intentional pieces, nothing extra.",
            icon: "minus.square",
            gradient: [
                Color(red: 0.97, green: 0.97, blue: 0.98),
                Color(red: 0.88, green: 0.88, blue: 0.90),
            ]
        ),
        DesignStyle(
            id: "scandinavian",
            name: "Scandinavian",
            description: "Light woods, soft whites, and natural brightness.",
            icon: "leaf.fill",
            gradient: [
                Color(red: 0.94, green: 0.96, blue: 0.93),
                Color(red: 0.82, green: 0.88, blue: 0.80),
            ]
        ),
        DesignStyle(
            id: "industrial",
            name: "Industrial",
            description: "Raw materials, metal accents, and urban character.",
            icon: "building.columns.fill",
            gradient: [
                Color(red: 0.86, green: 0.86, blue: 0.85),
                Color(red: 0.62, green: 0.62, blue: 0.60),
            ]
        ),
        DesignStyle(
            id: "luxe",
            name: "Luxe",
            description: "Rich finishes, depth, and quietly elevated detail.",
            icon: "sparkles",
            gradient: [
                Color(red: 0.93, green: 0.90, blue: 0.84),
                Color(red: 0.76, green: 0.68, blue: 0.56),
            ]
        ),
    ]
}
