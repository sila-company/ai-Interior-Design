import { Link } from "wouter";

import { LegalPageLayout } from "@/components/LegalPageLayout";
import { SUPPORT_EMAIL } from "@/lib/legal";

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
        We typically respond within 2 business days. Include your account email and
        a description of the issue.
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
        <Link href="/terms">Read Terms of Use</Link>
      </p>

      <h2>Free redesigns</h2>
      <p>
        New accounts include a limited number of free AI redesigns. After that, an
        active Atelier Membership is required for additional generations.
      </p>

      <h2>Account deletion</h2>
      <p>
        You can delete your account from the Account tab in the app. This removes
        your rooms, photos, and redesign history from our servers. Deleting your
        Atelier account does not cancel your Apple subscription.
      </p>

      <h2>AI redesign issues</h2>
      <p>
        AI results are visual suggestions and may not match real-world dimensions or
        materials. If a generation fails or looks wrong, try another style or a
        clearer, well-lit room photo.
      </p>

      <h2>Privacy and data</h2>
      <p>
        Read our <Link href="/privacy">Privacy Policy</Link> for details on data
        we collect (email, name, photos), OpenAI processing, Vercel hosting, and
        Amazon affiliate links.
      </p>

      <h2>Legal</h2>
      <p>
        <Link href="/privacy">Privacy Policy</Link>
      </p>
      <p>
        <Link href="/terms">Terms of Use</Link>
      </p>
    </LegalPageLayout>
  );
}
