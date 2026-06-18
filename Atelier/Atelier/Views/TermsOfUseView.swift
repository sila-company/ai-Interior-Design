import SwiftUI

struct TermsOfUseView: View {
    var body: some View {
        LegalDocumentLayout(title: "Terms of Use") {
            VStack(alignment: .leading, spacing: 8) {
                Text("These Terms of Use govern your access to and use of Atelier, including our iOS app and website. By using Atelier, you agree to these Terms and our Privacy Policy.")
                LegalNavigationLink(title: "Read Privacy Policy", route: .privacy)
            }

            LegalSection(
                title: "Eligibility",
                bodyText: "You must be at least 13 years old (or the minimum age in your country) to use Atelier. You are responsible for maintaining the security of your account credentials."
            )

            LegalSection(
                title: "Service description",
                bodyText: "Atelier provides AI-assisted interior design visualizations. You may upload room photos, select styles, and receive generated redesign images. Product suggestions may include affiliate links to third-party retailers such as Amazon."
            )

            Text("Atelier Membership subscription")
                .font(.system(size: 20, weight: .semibold))
                .foregroundStyle(Color(red: 0.114, green: 0.114, blue: 0.122))

            LegalBulletList(items: [
                "Plan: Atelier Membership — $19.99 USD per month, auto-renewing.",
                "Billing: Payment is charged to your Apple ID at confirmation of purchase. Subscriptions renew monthly unless cancelled at least 24 hours before the end of the current period.",
                "Free tier: New accounts receive a limited number of free redesigns. Additional redesigns require an active membership.",
                "Manage or cancel: Open Settings → Apple ID → Subscriptions on your device.",
                "Restore purchases: Use Restore purchases in the app if you reinstall or switch devices.",
                "Refunds: Refund requests are handled by Apple per their policies.",
            ])

            LegalSection(
                title: "AI-generated content and limitations",
                bodyText: "Redesigns are produced by artificial intelligence and are provided for inspiration and visualization only. Results may not reflect real-world dimensions, materials, lighting, building codes, or structural constraints. Do not rely on Atelier for construction, renovation, or purchasing decisions without independent verification."
            )

            LegalSection(
                title: "Your content",
                bodyText: "You retain ownership of photos you upload. You grant us a limited license to host, process, and display your content solely to provide the service. You agree not to upload content you do not have rights to use, or content that is illegal, harmful, or violates others' rights."
            )

            LegalSection(
                title: "Acceptable use",
                bodyText: "You agree not to abuse or disrupt the service, circumvent subscription limits, use Atelier for unlawful purposes, or attempt to access other users' accounts or data."
            )

            LegalSection(
                title: "Third-party services",
                bodyText: "Atelier integrates with third parties including Apple (payments), OpenAI (AI generation), Vercel (hosting), and Amazon (affiliate product links). Your use of those services may be subject to their separate terms and policies."
            )

            VStack(alignment: .leading, spacing: 8) {
                LegalSection(
                    title: "Account deletion",
                    bodyText: "You may delete your account from the Account screen in the app or by contacting us. Account deletion removes your Atelier data but does not cancel an active Apple subscription."
                )
                LegalEmailLink(email: LegalURLs.supportEmail)
            }

            LegalSection(
                title: "Disclaimer of warranties",
                bodyText: "Atelier is provided as is and as available, without warranties of any kind, express or implied."
            )

            LegalSection(
                title: "Limitation of liability",
                bodyText: "To the fullest extent permitted by law, Atelier and its operators will not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the service."
            )

            LegalSection(
                title: "Changes",
                bodyText: "We may modify these Terms or the service at any time. Continued use after changes constitutes acceptance of the updated Terms."
            )

            VStack(alignment: .leading, spacing: 8) {
                Text("Questions?")
                    .font(.system(size: 20, weight: .semibold))
                LegalEmailLink(email: LegalURLs.supportEmail)
                LegalNavigationLink(title: "Visit Support", route: .support)
            }
        }
        .navigationTitle("Terms")
    }
}
