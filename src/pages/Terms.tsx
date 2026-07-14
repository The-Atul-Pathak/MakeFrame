import LegalPage, { LegalSection } from '@/components/marketing/LegalPage'
import { usePageMeta } from '@/hooks/usePageMeta'
import { CONTACT_EMAIL } from '@/lib/siteMeta'

export default function Terms() {
  usePageMeta({
    title: 'Terms of Service — MakeFrame',
    description:
      'The terms for using MakeFrame: your work stays yours, the service is free during early access, and plain-language rules for both sides.',
    path: '/terms',
  })

  return (
    <LegalPage title="Terms of Service" updated="July 14, 2026">
      <LegalSection heading="The agreement">
        <p>
          These terms govern your use of MakeFrame, a film pre-production suite. By creating an
          account or using the service you agree to them. If you do not agree, do not use
          MakeFrame.
        </p>
      </LegalSection>

      <LegalSection heading="Early access">
        <p>
          MakeFrame is currently in early access and free to use. Features may change, be added,
          or be removed as the product develops. If paid plans are introduced, we will give clear
          advance notice, and you will keep access to the work you have already created.
        </p>
      </LegalSection>

      <LegalSection heading="Your account">
        <p>
          You are responsible for your account credentials and for the activity that happens under
          your account. Keep your password safe and tell us promptly if you believe your account
          has been compromised.
        </p>
      </LegalSection>

      <LegalSection heading="Your work stays yours">
        <p>
          You retain all rights, including copyright, to everything you create or upload in
          MakeFrame — beat sheets, screenplays, storyboards, shot lists, characters, and sketches.
          You grant us only the limited license required to operate the service: storing your
          work, displaying it back to you, and backing it up. We claim no ownership, we do not
          publish or share your work, and we do not use it to train AI models.
        </p>
      </LegalSection>

      <LegalSection heading="Acceptable use">
        <p>
          Don&apos;t use MakeFrame to break the law, infringe others&apos; intellectual property,
          attempt to breach or probe the security of the service, or interfere with other
          users&apos; access. We may suspend or terminate accounts that do.
        </p>
      </LegalSection>

      <LegalSection heading="Availability and warranty">
        <p>
          We work to keep MakeFrame reliable and your data safe, but the service is provided
          &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without warranties of any kind,
          express or implied. Keep your own copies of work that is critical to you.
        </p>
      </LegalSection>

      <LegalSection heading="Limitation of liability">
        <p>
          To the maximum extent permitted by law, MakeFrame and its operator are not liable for
          indirect, incidental, special, or consequential damages, or for loss of data, profits,
          or opportunities, arising from your use of the service.
        </p>
      </LegalSection>

      <LegalSection heading="Ending things">
        <p>
          You can stop using MakeFrame and request deletion of your account and data at any time.
          We may suspend or terminate accounts that violate these terms, and will otherwise give
          reasonable notice if we ever need to wind down the service — with time to retrieve your
          work.
        </p>
      </LegalSection>

      <LegalSection heading="Changes and contact">
        <p>
          If these terms change materially, we will update this page and its date. Questions go
          to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
