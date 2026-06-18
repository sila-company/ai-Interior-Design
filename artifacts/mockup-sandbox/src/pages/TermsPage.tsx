import { Link } from "wouter";

import { LegalPageLayout } from "@/components/LegalPageLayout";
import { SUPPORT_EMAIL } from "@/lib/legal";

export function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Use">
      <p>
        These Terms of Use govern your access to and use of Atelier, including our
        iOS app and website. By using Atelier, you agree to these Terms and our
        Privacy Policy.
      </p>
      <p>
        <Link href="/privacy">Read Privacy Policy</Link>
      </p>

      <h2>Eligibility</h2>
      <p>
        You must be at least 13 years old (or the minimum age in your country) to
        use Atelier. You are responsible for maintaining the security of your
        account credentials.
      </p>

      <h2>Service description</h2>
      <p>
        Atelier provides AI-assisted interior design visualizations. You may upload
        room photos, select styles, and receive generated redesign images. Product
        suggestions may include affiliate links to third-party retailers such as
        Amazon.
      </p>

      <h2>Atelier Membership subscription</h2>
      <ul>
        <li>Plan: Atelier Membership — $19.99 USD per month, auto-renewing.</li>
        <li>
          Billing: Payment is charged to your Apple ID at confirmation of purchase.
          Subscriptions renew monthly unless cancelled at least 24 hours before the
          end of the current period.
        </li>
        <li>
          Free tier: New accounts receive a limited number of free redesigns.
          Additional redesigns require an active membership.
        </li>
        <li>
          Manage or cancel: Open Settings → Apple ID → Subscriptions on your device.
        </li>
        <li>
          Restore purchases: Use Restore purchases in the app if you reinstall or
          switch devices.
        </li>
        <li>Refunds: Refund requests are handled by Apple per their policies.</li>
      </ul>

      <h2>AI-generated content and limitations</h2>
      <p>
        Redesigns are produced by artificial intelligence and are provided for
        inspiration and visualization only. Results may not reflect real-world
        dimensions, materials, lighting, building codes, or structural constraints.
        Do not rely on Atelier for construction, renovation, or purchasing decisions
        without independent verification.
      </p>

      <h2>Your content</h2>
      <p>
        You retain ownership of photos you upload. You grant us a limited license to
        host, process, and display your content solely to provide the service. You
        agree not to upload content you do not have rights to use, or content that is
        illegal, harmful, or violates others&apos; rights.
      </p>

      <h2>Acceptable use</h2>
      <p>
        You agree not to abuse or disrupt the service, circumvent subscription
        limits, use Atelier for unlawful purposes, or attempt to access other
        users&apos; accounts or data.
      </p>

      <h2>Third-party services</h2>
      <p>
        Atelier integrates with third parties including Apple (payments), OpenAI (AI
        generation), Vercel (hosting), and Amazon (affiliate product links). Your use
        of those services may be subject to their separate terms and policies.
      </p>

      <h2>Account deletion</h2>
      <p>
        You may delete your account from the Account screen in the app or by
        contacting us. Account deletion removes your Atelier data but does not cancel
        an active Apple subscription.
      </p>
      <p>
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>

      <h2>Disclaimer of warranties</h2>
      <p>
        Atelier is provided as is and as available, without warranties of any kind,
        express or implied.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Atelier and its operators will not
        be liable for indirect, incidental, special, consequential, or punitive damages
        arising from your use of the service.
      </p>

      <h2>Changes</h2>
      <p>
        We may modify these Terms or the service at any time. Continued use after
        changes constitutes acceptance of the updated Terms.
      </p>

      <h2>Questions?</h2>
      <p>
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
      <p>
        <Link href="/support">Visit Support</Link>
      </p>
    </LegalPageLayout>
  );
}
