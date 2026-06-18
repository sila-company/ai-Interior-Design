import SwiftUI

struct RoomBriefCard: View {
    let preferences: RoomPreferences

    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)

    var body: some View {
        if hasContent {
            VStack(alignment: .leading, spacing: 12) {
                Text("Your brief")
                    .font(.system(size: 17, weight: .semibold))

                if let description = preferences.description, !description.isEmpty {
                    briefRow(icon: "text.quote", title: "Vision", value: description)
                }

                if let dimensions = preferences.dimensionsSummary {
                    briefRow(icon: "ruler", title: "Size", value: dimensions)
                }

                if let budget = preferences.budgetSummary {
                    briefRow(icon: "dollarsign.circle", title: "Budget", value: budget)
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        }
    }

    private var hasContent: Bool {
        preferences.description?.isEmpty == false
            || preferences.dimensionsSummary != nil
            || preferences.budgetSummary != nil
    }

    private func briefRow(icon: String, title: String, value: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 15))
                .foregroundStyle(Color(red: 0, green: 0.443, blue: 0.890))
                .frame(width: 22)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(secondaryText)
                Text(value)
                    .font(.system(size: 15))
                    .foregroundStyle(Color(red: 0.114, green: 0.114, blue: 0.122))
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}
