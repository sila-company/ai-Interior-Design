import SwiftUI

struct PrivacyPolicyView: View {
    var body: some View {
        LegalDocumentLayout(title: "Privacy Policy") {
            Text("We at Atelier respect your privacy. This policy explains what information we collect, how we use it, and the choices you have when you use the Atelier app and website.")

            Text("Information we collect")
                .font(.system(size: 20, weight: .semibold))
                .foregroundStyle(Color(red: 0.114, green: 0.114, blue: 0.122))

            LegalBulletList(items: [
                "Account information: email address and name when you create an account.",
                "Room photos: images you upload or capture for rooms and redesigns.",
                "Design data: style choices, redesign results, and related metadata.",
                "Purchase information: subscription status verified through Apple. We do not store your payment card details.",
                "Usage data: basic logs needed to operate the service. We do not use third-party advertising trackers.",
            ])

            LegalSection(
                title: "How we use your information",
                bodyText: "We use your information to provide AI room redesigns, authenticate your account, manage membership status, respond to support requests, and improve reliability and security."
            )

            LegalSection(
                title: "AI processing (OpenAI)",
                bodyText: "Room photos and design instructions are sent to OpenAI to generate redesign images. OpenAI processes this content on our behalf. We do not use your photos to train our own models."
            )

            VStack(alignment: .leading, spacing: 8) {
                Text("AI-generated results are suggestions only. They may be inaccurate or unsuitable for real-world use.")
                LegalNavigationLink(title: "Read Terms of Use", route: .terms)
            }

            LegalSection(
                title: "Hosting and storage (Vercel)",
                bodyText: "The Atelier API and web app are hosted on Vercel. Account data and uploaded images are stored using our database and blob storage providers."
            )

            LegalSection(
                title: "Amazon affiliate links",
                bodyText: "Atelier may show shoppable product suggestions with links to Amazon. If you make a purchase, we may earn an affiliate commission. Amazon's privacy practices apply when you visit Amazon."
            )

            LegalSection(
                title: "Subscriptions",
                bodyText: "Atelier Membership is billed through Apple at $19.99 per month (auto-renewing). We receive subscription status from Apple to unlock features. Payment and cancellation are managed in your Apple ID settings."
            )

            LegalSection(
                title: "Data sharing",
                bodyText: "We do not sell your personal information. We share data only with service providers that help us run Atelier, when required by law, or to protect our rights and users' safety."
            )

            VStack(alignment: .leading, spacing: 8) {
                LegalSection(
                    title: "Data retention and account deletion",
                    bodyText: "We keep your data while your account is active. You may delete your account from the Account screen in the app or by emailing us."
                )
                LegalEmailLink(email: LegalURLs.supportEmail)
                Text("Deleting your Atelier account does not cancel an Apple subscription. Cancel in Settings → Apple ID → Subscriptions.")
            }

            LegalSection(
                title: "Security",
                bodyText: "We use encrypted connections (HTTPS) and secure token storage on device. No method of transmission or storage is 100% secure."
            )

            LegalSection(
                title: "Children",
                bodyText: "Atelier is not directed to children under 13. We do not knowingly collect personal information from children."
            )

            LegalSection(
                title: "Changes",
                bodyText: "We may update this policy from time to time. We will post the revised version with an updated date."
            )

            VStack(alignment: .leading, spacing: 8) {
                Text("Questions about privacy?")
                    .font(.system(size: 20, weight: .semibold))
                LegalEmailLink(email: LegalURLs.supportEmail)
                LegalNavigationLink(title: "Visit Support", route: .support)
            }
        }
        .navigationTitle("Privacy")
    }
}
