import { Link } from "wouter";

import { LegalPageLayout } from "@/components/LegalPageLayout";

const SUPPORT_EMAIL = "support@ateliertech.vercel.app";

export function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <p>
        Atelier (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects
        your privacy. This policy explains what information we collect, how we
        use it, and the choices you have when you use the Atelier iOS app and
        website.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account information:</strong> When you create an account, we
          collect your email address and name (if provided).
        </li>
        <li>
          <strong>Room photos:</strong> Photos you upload or capture are stored
          so you can save rooms, generate redesigns, and view your history.
        </li>
        <li>
          <strong>Design data:</strong> Style choices, redesign results, and
          related metadata tied to your account.
        </li>
        <li>
          <strong>Purchase information:</strong> Subscription status is verified
          through Apple. We do not receive or store your full payment card
          details.
        </li>
        <li>
          <strong>Usage data:</strong> Basic logs needed to operate the service
          (for example, API requests and error diagnostics). We do not use
          third-party advertising trackers.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Provide AI room redesigns and save your rooms and results</li>
        <li>Authenticate your account and sync data across devices</li>
        <li>Manage your Atelier Membership subscription status</li>
        <li>Respond to support requests</li>
        <li>Improve reliability and security of the service</li>
      </ul>

      <h2>AI processing (OpenAI)</h2>
      <p>
        Room photos and design instructions are sent to <strong>OpenAI</strong>{" "}
        to generate redesign images. OpenAI processes this content on our behalf
        to deliver the feature. We do not use your photos to train our own
        models. OpenAI&apos;s use of data is governed by their policies and our
        API configuration.
      </p>
      <p>
        AI-generated results are suggestions only. They may be inaccurate,
        incomplete, or unsuitable for real-world use. See our{" "}
        <Link href="/terms">Terms of Use</Link> for limitations.
      </p>

      <h2>Hosting and storage (Vercel)</h2>
      <p>
        The Atelier API and web app are hosted on <strong>Vercel</strong>.
        Account data and uploaded images are stored using our database and blob
        storage providers connected to that infrastructure. Data may be
        processed in the United States or other regions where these providers
        operate.
      </p>

      <h2>Amazon affiliate links</h2>
      <p>
        Atelier may show shoppable product suggestions with links to{" "}
        <strong>Amazon</strong>. If you tap a product link and make a purchase,
        we may earn an affiliate commission. Amazon&apos;s privacy practices
        apply when you leave Atelier and visit Amazon.
      </p>

      <h2>Subscriptions</h2>
      <p>
        Atelier Membership is billed through Apple at{" "}
        <strong>$19.99 per month</strong> (auto-renewing). We receive
        subscription status from Apple to unlock features. Payment and
        cancellation are managed in your Apple ID settings. See our{" "}
        <Link href="/terms">Terms of Use</Link> for full subscription terms.
      </p>

      <h2>Data sharing</h2>
      <p>
        We do not sell your personal information. We share data only with
        service providers that help us run Atelier (such as OpenAI, Vercel, and
        our database host), when required by law, or to protect our rights and
        users&apos; safety.
      </p>

      <h2>Data retention and account deletion</h2>
      <p>
        We keep your data while your account is active. You may request account
        deletion from the Account screen in the app or by emailing{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. When you delete
        your account, we remove your profile, rooms, photos, and redesigns from
        our systems, subject to reasonable backup retention.
      </p>
      <p>
        Deleting your Atelier account does <strong>not</strong> cancel an Apple
        subscription. Cancel in Settings &gt; Apple ID &gt; Subscriptions.
      </p>

      <h2>Security</h2>
      <p>
        We use industry-standard measures such as encrypted connections (HTTPS)
        and secure token storage on device. No method of transmission or storage
        is 100% secure.
      </p>

      <h2>Children</h2>
      <p>
        Atelier is not directed to children under 13. We do not knowingly
        collect personal information from children.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy from time to time. We will post the revised
        version on this page with an updated date.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or visit our{" "}
        <Link href="/support">Support</Link> page.
      </p>
    </LegalPageLayout>
  );
}
