import { Link } from "wouter";

import { LegalPageLayout } from "@/components/LegalPageLayout";

const SUPPORT_EMAIL = "support@ateliertech.vercel.app";

export function SupportPage() {
  return (
    <LegalPageLayout title="Support">
      <p>
        Need help with Atelier? We&apos;re here for account, subscription, and
        technical questions.
      </p>

      <h2>Contact us</h2>
      <p>
        Email: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
      <p>
        We typically respond within 2 business days. Include your account email
        and a description of the issue.
      </p>

      <h2>Common topics</h2>

      <h3>Subscriptions and billing</h3>
      <p>
        Atelier Membership is <strong>$19.99/month</strong> and renews
        automatically through your Apple ID. To view, change, or cancel your
        subscription, open{" "}
        <strong>Settings &gt; Apple ID &gt; Subscriptions</strong> on your
        iPhone or iPad.
      </p>
      <p>
        If you reinstall the app, tap <strong>Restore purchases</strong> on the
        membership screen to sync your subscription.
      </p>
      <p>
        See our <Link href="/terms">Terms of Use</Link> for full subscription
        details.
      </p>

      <h3>Free redesigns</h3>
      <p>
        New accounts include a limited number of free AI redesigns. After that,
        an active Atelier Membership is required for additional generations.
      </p>

      <h3>Account deletion</h3>
      <p>
        You can delete your account from the Account tab in the app. This
        removes your rooms, photos, and redesign history from our servers.
      </p>
      <p>
        <strong>Important:</strong> Deleting your Atelier account does not
        cancel your Apple subscription. Cancel separately in Apple ID settings.
      </p>

      <h3>AI redesign issues</h3>
      <p>
        AI results are visual suggestions and may not match real-world
        dimensions or materials. If a generation fails or looks wrong, try
        another style or a clearer, well-lit room photo.
      </p>

      <h3>Privacy and data</h3>
      <p>
        Read our <Link href="/privacy">Privacy Policy</Link> for details on data
        we collect (email, name, photos), OpenAI processing, Vercel hosting, and
        Amazon affiliate links.
      </p>

      <h2>Legal</h2>
      <ul>
        <li>
          <Link href="/privacy">Privacy Policy</Link>
        </li>
        <li>
          <Link href="/terms">Terms of Use</Link>
        </li>
      </ul>
    </LegalPageLayout>
  );
}
