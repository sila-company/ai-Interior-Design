import SwiftUI

struct LegalDocumentLayout<Content: View>: View {
    let title: String
    let lastUpdated: String
    @ViewBuilder let content: () -> Content

    private let primaryText = Color(red: 0.114, green: 0.114, blue: 0.122)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)

    init(
        title: String,
        lastUpdated: String = "June 18, 2026",
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.title = title
        self.lastUpdated = lastUpdated
        self.content = content
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("ATELIER")
                        .font(.system(size: 13, weight: .medium))
                        .tracking(1.2)
                        .foregroundStyle(secondaryText)

                    Text(title)
                        .font(.system(size: 28, weight: .semibold))
                        .foregroundStyle(primaryText)

                    Text("Last updated \(lastUpdated)")
                        .font(.system(size: 14))
                        .foregroundStyle(secondaryText)
                }

                VStack(alignment: .leading, spacing: 18) {
                    content()
                }
                .font(.system(size: 16))
                .foregroundStyle(Color(red: 0.26, green: 0.26, blue: 0.28))
                .tint(Color(red: 0, green: 0.443, blue: 0.890))
            }
            .padding(24)
            .padding(.bottom, 16)
        }
        .background(AppBackground())
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct LegalSection: View {
    let title: String
    let bodyText: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 20, weight: .semibold))
                .foregroundStyle(Color(red: 0.114, green: 0.114, blue: 0.122))

            Text(bodyText)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}

struct LegalBulletList: View {
    let items: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ForEach(items, id: \.self) { item in
                HStack(alignment: .top, spacing: 8) {
                    Text("•")
                    Text(item)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
    }
}

struct LegalNavigationLink: View {
    let title: String
    let route: AppRoute

    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)

    var body: some View {
        NavigationLink(value: route) {
            Text(title)
                .font(.system(size: 16, weight: .medium))
                .foregroundStyle(appleBlue)
        }
    }
}

struct LegalEmailLink: View {
    let email: String

    var body: some View {
        Link(email, destination: URL(string: "mailto:\(email)")!)
            .font(.system(size: 16, weight: .medium))
    }
}

extension View {
    func legalPageDestinations() -> some View {
        navigationDestination(for: AppRoute.self) { route in
            switch route {
            case .privacy:
                PrivacyPolicyView()
            case .terms:
                TermsOfUseView()
            case .support:
                SupportView()
            default:
                EmptyView()
            }
        }
    }
}
