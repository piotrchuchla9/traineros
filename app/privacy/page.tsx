import { cookies } from 'next/headers'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  alternates: { canonical: '/privacy' },
}

const UPDATED = '2026-07-10'

export default async function PrivacyPage() {
  const jar = await cookies()
  const locale = jar.get('lang')?.value === 'pl' ? 'pl' : 'en'

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← {locale === 'pl' ? 'Strona główna' : 'Home'}
        </Link>

        {locale === 'pl' ? <ContentPl /> : <ContentEn />}
      </div>

      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        <p><a href="mailto:contact@traineros.live" className="hover:text-foreground transition-colors">contact@traineros.live</a></p>
      </footer>
    </div>
  )
}

function ContentPl() {
  return (
    <article className="mt-8 space-y-8 text-foreground">
      <header>
        <h1 className="text-3xl font-bold">Polityka prywatności TrainerOS</h1>
        <p className="text-sm text-muted-foreground mt-2">Ostatnia aktualizacja: {UPDATED}</p>
      </header>

      <Section title="1. Administrator danych">
        <p>Administratorem danych osobowych zbieranych za pośrednictwem TrainerOS (traineros.live) jest PC Software Piotr Chuchla, 38-400 Krosno, ul. Decowskiego 102A, NIP: 5243028202, e-mail: contact@traineros.live.</p>
      </Section>

      <Section title="2. Jakie dane zbieramy">
        <ul className="list-disc pl-5 space-y-1">
          <li>Dane konta trenera: imię i nazwisko, adres e-mail, hasło (zaszyfrowane).</li>
          <li>Dane klientów wprowadzone przez trenera: dane kontaktowe, plany treningowe, pomiary, zdjęcia postępów.</li>
          <li>Dane rozliczeniowe: obsługiwane przez Stripe — nie przechowujemy numerów kart płatniczych.</li>
          <li>Dane techniczne: pliki cookie (motyw, język, sesja logowania), adres IP w logach serwera.</li>
          <li>Opcjonalnie, po połączeniu konta: dane z Google Calendar (w zakresie niezbędnym do synchronizacji sesji treningowych).</li>
        </ul>
      </Section>

      <Section title="3. Cele i podstawy prawne przetwarzania">
        <ul className="list-disc pl-5 space-y-1">
          <li>Świadczenie usługi i realizacja umowy — art. 6 ust. 1 lit. b RODO.</li>
          <li>Obsługa płatności i obowiązki księgowe — art. 6 ust. 1 lit. c RODO.</li>
          <li>Kontakt e-mailowy, wsparcie techniczne — art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes).</li>
          <li>Synchronizacja z Google Calendar — art. 6 ust. 1 lit. a RODO (zgoda udzielana przy łączeniu konta Google).</li>
        </ul>
      </Section>

      <Section title="4. Odbiorcy danych">
        <p>Dane mogą być powierzane zaufanym podmiotom przetwarzającym, wyłącznie w zakresie niezbędnym do świadczenia usługi:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Supabase</strong> — baza danych i przechowywanie plików (zdjęcia postępów).</li>
          <li><strong>Stripe</strong> — obsługa płatności i subskrypcji.</li>
          <li><strong>Resend</strong> — wysyłka wiadomości e-mail.</li>
          <li><strong>Vercel</strong> — hosting aplikacji.</li>
          <li><strong>Google</strong> — wyłącznie jeśli trener samodzielnie połączy konto Google Calendar.</li>
        </ul>
        <p>Część z tych podmiotów może przetwarzać dane poza Europejskim Obszarem Gospodarczym, w oparciu o standardowe klauzule umowne lub inny mechanizm zgodny z RODO.</p>
      </Section>

      <Section title="5. Okres przechowywania danych">
        <p>Dane przechowywane są przez czas trwania konta oraz do momentu jego usunięcia na żądanie Użytkownika, chyba że dłuższy okres przechowywania wynika z przepisów prawa (np. podatkowych).</p>
      </Section>

      <Section title="6. Prawa użytkownika">
        <p>Każdej osobie, której dane dotyczą, przysługuje prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych, sprzeciwu wobec przetwarzania oraz wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.</p>
      </Section>

      <Section title="7. Pliki cookies">
        <p>Serwis wykorzystuje niezbędne pliki cookies do utrzymania sesji logowania oraz zapamiętania preferencji motywu i języka. Nie wykorzystujemy cookies reklamowych ani śledzących stron trzecich.</p>
      </Section>

      <Section title="8. Bezpieczeństwo danych">
        <p>Stosujemy techniczne i organizacyjne środki bezpieczeństwa (m.in. szyfrowanie połączenia, kontrola dostępu) adekwatne do charakteru przetwarzanych danych.</p>
      </Section>

      <Section title="9. Zmiany polityki">
        <p>Niniejsza polityka może być aktualizowana. O istotnych zmianach poinformujemy drogą mailową lub komunikatem w aplikacji.</p>
      </Section>

      <Section title="10. Kontakt">
        <p>W sprawach związanych z ochroną danych osobowych: contact@traineros.live</p>
      </Section>
    </article>
  )
}

function ContentEn() {
  return (
    <article className="mt-8 space-y-8 text-foreground">
      <header>
        <h1 className="text-3xl font-bold">TrainerOS Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mt-2">Last updated: {UPDATED}</p>
      </header>

      <Section title="1. Data controller">
        <p>The data controller for personal data collected via TrainerOS (traineros.live) is PC Software Piotr Chuchla, ul. Decowskiego 102A, 38-400 Krosno, Poland, VAT/Tax ID (NIP): 5243028202, email: contact@traineros.live.</p>
      </Section>

      <Section title="2. Data we collect">
        <ul className="list-disc pl-5 space-y-1">
          <li>Trainer account data: name, email address, password (encrypted).</li>
          <li>Client data entered by the trainer: contact details, workout plans, measurements, progress photos.</li>
          <li>Billing data: handled by Stripe — we do not store card numbers.</li>
          <li>Technical data: cookies (theme, language, login session), IP address in server logs.</li>
          <li>Optionally, once connected: Google Calendar data, limited to what&apos;s needed to sync training sessions.</li>
        </ul>
      </Section>

      <Section title="3. Purposes and legal basis">
        <ul className="list-disc pl-5 space-y-1">
          <li>Providing the Service and performing the contract — GDPR Art. 6(1)(b).</li>
          <li>Billing and accounting obligations — GDPR Art. 6(1)(c).</li>
          <li>Email support and communication — GDPR Art. 6(1)(f) (legitimate interest).</li>
          <li>Google Calendar sync — GDPR Art. 6(1)(a) (consent given when connecting the Google account).</li>
        </ul>
      </Section>

      <Section title="4. Data recipients">
        <p>Data may be shared with trusted processors, only to the extent necessary to provide the Service:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Supabase</strong> — database and file storage (progress photos).</li>
          <li><strong>Stripe</strong> — payment and subscription processing.</li>
          <li><strong>Resend</strong> — transactional email delivery.</li>
          <li><strong>Vercel</strong> — application hosting.</li>
          <li><strong>Google</strong> — only if the trainer connects their Google Calendar account.</li>
        </ul>
        <p>Some of these providers may process data outside the European Economic Area, relying on standard contractual clauses or another GDPR-compliant transfer mechanism.</p>
      </Section>

      <Section title="5. Data retention">
        <p>Data is retained for the lifetime of the account and until deletion is requested, unless a longer retention period is required by law (e.g. tax regulations).</p>
      </Section>

      <Section title="6. Your rights">
        <p>You have the right to access, rectify, erase, restrict processing of, and port your data, to object to processing, and to lodge a complaint with your national data protection authority (in Poland: the President of the Personal Data Protection Office, UODO).</p>
      </Section>

      <Section title="7. Cookies">
        <p>The Service uses essential cookies to maintain your login session and remember your theme and language preferences. We do not use third-party advertising or tracking cookies.</p>
      </Section>

      <Section title="8. Data security">
        <p>We apply technical and organizational security measures (including encrypted connections and access control) appropriate to the nature of the data processed.</p>
      </Section>

      <Section title="9. Changes to this policy">
        <p>This policy may be updated. Material changes will be communicated by email or an in-app notice.</p>
      </Section>

      <Section title="10. Contact">
        <p>For questions about data protection: contact@traineros.live</p>
      </Section>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </section>
  )
}
