import SwiftUI

struct LegalLinksFooter: View {
    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("By creating an account, you agree to our Terms of Use and Privacy Policy.")
                .font(.system(size: 12))
                .foregroundStyle(secondaryText)

            HStack(spacing: 16) {
                NavigationLink(value: AppRoute.terms) {
                    Text("Terms of Use")
                }
                NavigationLink(value: AppRoute.privacy) {
                    Text("Privacy Policy")
                }
            }
            .font(.system(size: 13, weight: .medium))
            .foregroundStyle(appleBlue)
        }
    }
}
