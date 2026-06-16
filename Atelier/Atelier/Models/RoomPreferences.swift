import Foundation

enum DimensionUnit: String, CaseIterable, Identifiable, Codable, Hashable {
    case meters
    case feet

    var id: String { rawValue }

    var label: String {
        switch self {
        case .meters: return "Meters"
        case .feet: return "Feet"
        }
    }

    var abbreviation: String {
        switch self {
        case .meters: return "m"
        case .feet: return "ft"
        }
    }
}

struct RoomPreferences: Equatable, Hashable {
    let description: String?
    let length: Double?
    let width: Double?
    let height: Double?
    let dimensionUnit: DimensionUnit?
    let budgetAmount: Int?
    let budgetCurrency: String

    var hasDimensions: Bool {
        length != nil || width != nil || height != nil
    }

    var dimensionsSummary: String? {
        guard hasDimensions, let unit = dimensionUnit else { return nil }

        if let length, let width, let height {
            return "\(format(length)) × \(format(width)) × \(format(height)) \(unit.abbreviation)"
        }

        let parts = [
            length.map { "L \(format($0)) \(unit.abbreviation)" },
            width.map { "W \(format($0)) \(unit.abbreviation)" },
            height.map { "H \(format($0)) \(unit.abbreviation)" },
        ].compactMap { $0 }

        return parts.isEmpty ? nil : parts.joined(separator: " · ")
    }

    var budgetSummary: String? {
        guard let budgetAmount else { return nil }
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = budgetCurrency
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: budgetAmount))
    }

    private func format(_ value: Double) -> String {
        value.truncatingRemainder(dividingBy: 1) == 0
            ? String(Int(value))
            : String(format: "%.1f", value)
    }
}

struct CreateRoomInput: Equatable {
    var name: String = ""
    var description: String = ""
    var includesDimensions: Bool = false
    var dimensionUnit: DimensionUnit = .meters
    var length: String = ""
    var width: String = ""
    var height: String = ""
    var includesBudget: Bool = false
    var budget: String = ""
}
