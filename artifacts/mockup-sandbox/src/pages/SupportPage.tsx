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
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
      <p>
        We typically respond within 2 business days. Include your account email and
        a description of the issue.
      </p>

      <h2>Common topics</h2>

      <h2>Subscriptions and billing</h2>
      <p>
        Atelier Membership is $19.99/month and renews automatically through your
        Apple ID. To view, change, or cancel your subscription, open Settings → Apple
        ID → Subscriptions on your iPhone or iPad. If you reinstall the app, tap
        Restore purchases on the membership screen.
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
        Read our Privacy Policy for details on data we collect, OpenAI processing,
        hosting, and Amazon affiliate links.
      </p>
      <p>
        <Link href="/privacy">Read Privacy Policy</Link>
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
