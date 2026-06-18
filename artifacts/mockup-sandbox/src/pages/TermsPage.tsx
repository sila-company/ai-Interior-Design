import { Link } from "wouter";

import { LegalPageLayout } from "@/components/LegalPageLayout";

const SUPPORT_EMAIL = "support@ateliertech.vercel.app";

export function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Use">
      <p>
        These Terms of Use (&quot;Terms&quot;) govern your access to and use of
        Atelier, including our iOS app and website. By using Atelier, you agree
        to these Terms and our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Eligibility</h2>
      <p>
        You must be at least 13 years old (or the minimum age in your country)
        to use Atelier. You are responsible for maintaining the security of your
        account credentials.
      </p>

      <h2>Service description</h2>
      <p>
        Atelier provides AI-assisted interior design visualizations. You may
        upload room photos, select styles, and receive generated redesign
        images. Product suggestions may include affiliate links to third-party
        retailers such as Amazon.
      </p>

      <h2>Atelier Membership subscription</h2>
      <ul>
        <li>
          <strong>Plan:</strong> Atelier Membership — $19.99 USD per month,
          auto-renewing.
        </li>
        <li>
          <strong>Billing:</strong> Payment is charged to your Apple ID account
          at confirmation of purchase. Subscriptions automatically renew each
          month unless cancelled at least 24 hours before the end of the current
          period.
        </li>
        <li>
          <strong>Free tier:</strong> New accounts receive a limited number of
          free redesigns. Additional redesigns require an active membership.
        </li>
        <li>
          <strong>Manage or cancel:</strong> Open Settings → Apple ID →
          Subscriptions on your device. We cannot cancel Apple subscriptions on
          your behalf.
        </li>
        <li>
          <strong>Restore purchases:</strong> Use &quot;Restore purchases&quot;
          in the app if you reinstall or switch devices.
        </li>
        <li>
          <strong>Refunds:</strong> Refund requests are handled by Apple per
          their policies.
        </li>
      </ul>

      <h2>AI-generated content and limitations</h2>
      <p>
        Redesigns are produced by artificial intelligence and are provided for
        inspiration and visualization only. Results may not reflect real-world
        dimensions, materials, lighting, building codes, or structural
        constraints. You should not rely on Atelier for construction,
        renovation, or purchasing decisions without independent verification.
      </p>
      <p>
        We do not guarantee accuracy, availability, or a particular aesthetic
        outcome. Generated images may occasionally include errors or unexpected
        elements.
      </p>

      <h2>Your content</h2>
      <p>
        You retain ownership of photos you upload. You grant us a limited
        license to host, process, and display your content solely to provide
        the service, including sending images to our AI processing providers.
      </p>
      <p>
        You agree not to upload content you do not have rights to use, or
        content that is illegal, harmful, or violates others&apos; rights.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Abuse, reverse engineer, or disrupt the service</li>
        <li>Circumvent subscription or usage limits</li>
        <li>Use Atelier for unlawful purposes</li>
        <li>Attempt to access other users&apos; accounts or data</li>
      </ul>

      <h2>Third-party services</h2>
      <p>
        Atelier integrates with third parties including Apple (payments),
        OpenAI (AI generation), Vercel (hosting), and Amazon (affiliate
        product links). Your use of those services may be subject to their
        separate terms and policies.
      </p>

      <h2>Account deletion</h2>
      <p>
        You may delete your account from the Account screen in the app or by
        contacting <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        Account deletion removes your Atelier data but does not cancel an active
        Apple subscription.
      </p>

      <h2>Disclaimer of warranties</h2>
      <p>
        Atelier is provided &quot;as is&quot; and &quot;as available&quot;
        without warranties of any kind, express or implied, including fitness for
        a particular purpose or non-infringement.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Atelier and its operators will
        not be liable for indirect, incidental, special, consequential, or
        punitive damages, or any loss of profits, data, or goodwill arising from
        your use of the service.
      </p>

      <h2>Changes</h2>
      <p>
        We may modify these Terms or the service at any time. Continued use
        after changes constitutes acceptance of the updated Terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or visit{" "}
        <Link href="/support">Support</Link>.
      </p>
    </LegalPageLayout>
  );
}
