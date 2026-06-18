import SwiftUI

struct LegalLinksFooter: View {
    @Environment(\.openURL) private var openURL

    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("By creating an account, you agree to our Terms of Use and Privacy Policy.")
                .font(.system(size: 12))
                .foregroundStyle(secondaryText)

            HStack(spacing: 16) {
                if let termsURL = LegalURLs.termsOfUse {
                    Button("Terms of Use") { openURL(termsURL) }
                }
                if let privacyURL = LegalURLs.privacyPolicy {
                    Button("Privacy Policy") { openURL(privacyURL) }
                }
            }
            .font(.system(size: 13, weight: .medium))
            .foregroundStyle(appleBlue)
        }
    }
}
