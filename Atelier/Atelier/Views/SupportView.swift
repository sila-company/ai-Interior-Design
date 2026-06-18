import SwiftUI

struct SupportView: View {
    var body: some View {
        LegalDocumentLayout(title: "Support") {
            Text("Need help with Atelier? We're here for account, subscription, and technical questions.")

            VStack(alignment: .leading, spacing: 8) {
                Text("Contact us")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(Color(red: 0.114, green: 0.114, blue: 0.122))

                LegalEmailLink(email: LegalURLs.supportEmail)

                Text("We typically respond within 2 business days. Include your account email and a description of the issue.")
            }

            Text("Common topics")
                .font(.system(size: 20, weight: .semibold))
                .foregroundStyle(Color(red: 0.114, green: 0.114, blue: 0.122))

            LegalSection(
                title: "Subscriptions and billing",
                bodyText: "Atelier Membership is $19.99/month and renews automatically through your Apple ID. To view, change, or cancel your subscription, open Settings → Apple ID → Subscriptions on your iPhone or iPad. If you reinstall the app, tap Restore purchases on the membership screen."
            )

            LegalNavigationLink(title: "Read Terms of Use", route: .terms)

            LegalSection(
                title: "Free redesigns",
                bodyText: "New accounts include a limited number of free AI redesigns. After that, an active Atelier Membership is required for additional generations."
            )

            LegalSection(
                title: "Account deletion",
                bodyText: "You can delete your account from the Account tab in the app. This removes your rooms, photos, and redesign history from our servers. Deleting your Atelier account does not cancel your Apple subscription."
            )

            LegalSection(
                title: "AI redesign issues",
                bodyText: "AI results are visual suggestions and may not match real-world dimensions or materials. If a generation fails or looks wrong, try another style or a clearer, well-lit room photo."
            )

            VStack(alignment: .leading, spacing: 8) {
                Text("Privacy and data")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(Color(red: 0.114, green: 0.114, blue: 0.122))

                Text("Read our Privacy Policy for details on data we collect, OpenAI processing, hosting, and Amazon affiliate links.")
                LegalNavigationLink(title: "Read Privacy Policy", route: .privacy)
            }

            VStack(alignment: .leading, spacing: 10) {
                Text("Legal")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(Color(red: 0.114, green: 0.114, blue: 0.122))

                LegalNavigationLink(title: "Privacy Policy", route: .privacy)
                LegalNavigationLink(title: "Terms of Use", route: .terms)
            }
        }
        .navigationTitle("Support")
    }
}
