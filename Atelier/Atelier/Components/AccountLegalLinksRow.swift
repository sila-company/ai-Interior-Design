import SwiftUI

struct AccountLegalLinksRow: View {
    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)

    var body: some View {
        HStack(spacing: 0) {
            legalLink("Privacy", route: .privacy)
            divider
            legalLink("Terms", route: .terms)
            divider
            legalLink("Support", route: .support)
        }
        .font(.system(size: 15, weight: .medium))
        .foregroundStyle(appleBlue)
        .frame(maxWidth: .infinity)
    }

    private var divider: some View {
        Text("·")
            .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))
            .padding(.horizontal, 10)
    }

    private func legalLink(_ title: String, route: AppRoute) -> some View {
        NavigationLink(value: route) {
            Text(title)
        }
    }
}
