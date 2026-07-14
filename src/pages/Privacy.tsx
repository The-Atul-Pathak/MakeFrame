import LegalPage, { LegalSection } from '@/components/marketing/LegalPage'
import { usePageMeta } from '@/hooks/usePageMeta'
import { CONTACT_EMAIL } from '@/lib/siteMeta'

export default function Privacy() {
  usePageMeta({
    title: 'Privacy Policy — MakeFrame',
    description:
      'How MakeFrame handles your account data and creative work: private by default, no ad tracking, never used to train AI models.',
    path: '/privacy',
  })

  return (
    <LegalPage title="Privacy Policy" updated="July 14, 2026">
      <LegalSection heading="The short version">
        <p>
          MakeFrame stores your account details and the creative work you make in the app, and
          nothing more than it needs to run the service. Your projects are private to your account,
          we run no advertising trackers, we do not sell data, and we never use your writing to
          train AI models.
        </p>
      </LegalSection>

      <LegalSection heading="What we collect">
        <p>
          <strong className="text-text-primary">Account data.</strong> Your email address and a
          securely hashed password, managed by our authentication provider, Supabase. If you sign
          in with Google, we receive your name, email address, and profile picture from Google —
          nothing else from your Google account.
        </p>
        <p>
          <strong className="text-text-primary">Your creative work.</strong> Projects, beat sheets,
          screenplays, storyboard panels and sketches, shot lists, and character profiles you
          create are stored so the product can function. They are visible only to your account,
          enforced with row-level security at the database layer.
        </p>
        <p>
          <strong className="text-text-primary">Analytics.</strong> We use Cloudflare Web
          Analytics, which is cookieless and aggregate — it tells us how many people visited, not
          who they are.
        </p>
        <p>
          <strong className="text-text-primary">Error reports.</strong> When something breaks, an
          error report may be sent to Sentry with technical details (browser, OS, what failed) so
          we can fix it. Error reports are not used for advertising or profiling.
        </p>
      </LegalSection>

      <LegalSection heading="What we don't do">
        <p>
          We do not sell or rent your data. We do not run advertising trackers or third-party ad
          cookies. We do not read your scripts except when strictly required to investigate an
          issue you have reported to us. We do not use your creative work to train AI models, ours
          or anyone else&apos;s.
        </p>
      </LegalSection>

      <LegalSection heading="Who processes your data">
        <p>
          MakeFrame runs on a small set of infrastructure providers, each processing data only to
          provide the service: Supabase (authentication, database, and file storage), Cloudflare
          (hosting and cookieless analytics), Sentry (error reporting), and Google (only if you
          choose Google sign-in).
        </p>
      </LegalSection>

      <LegalSection heading="Cookies and local storage">
        <p>
          The only browser storage MakeFrame uses is what keeps you signed in (your Supabase
          session) and local working state for the editor. There are no advertising or
          cross-site tracking cookies.
        </p>
      </LegalSection>

      <LegalSection heading="Retention and deletion">
        <p>
          We keep your data for as long as your account is active. To delete your account and all
          associated data, email us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent">
            {CONTACT_EMAIL}
          </a>{' '}
          from your account email and we will remove it.
        </p>
      </LegalSection>

      <LegalSection heading="Security">
        <p>
          All traffic is encrypted in transit (TLS). Passwords are hashed, never stored in plain
          text. Access to your projects is restricted to your authenticated account with row-level
          security enforced by the database.
        </p>
      </LegalSection>

      <LegalSection heading="Changes and contact">
        <p>
          If this policy changes in a way that matters, we will note it here with a new date.
          Questions about your data can go to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
