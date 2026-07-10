import { cookies } from 'next/headers'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  alternates: { canonical: '/terms' },
}

const UPDATED = '2026-07-10'

export default async function TermsPage() {
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
        <h1 className="text-3xl font-bold">Regulamin świadczenia usług TrainerOS</h1>
        <p className="text-sm text-muted-foreground mt-2">Ostatnia aktualizacja: {UPDATED}</p>
      </header>

      <Section title="1. Postanowienia ogólne">
        <p>Niniejszy regulamin określa zasady korzystania z platformy TrainerOS (dalej: „Usługa”), dostępnej pod adresem traineros.live, świadczonej przez PC Software Piotr Chuchla, 38-400 Krosno, ul. Decowskiego 102A, NIP: 5243028202 (dalej: „Usługodawca”).</p>
        <p>TrainerOS to platforma SaaS umożliwiająca trenerom personalnym tworzenie planów treningowych, zarządzanie klientami oraz śledzenie postępów.</p>
      </Section>

      <Section title="2. Konto i rejestracja">
        <p>Korzystanie z pełnej funkcjonalności Usługi wymaga założenia konta. Użytkownik zobowiązuje się podać prawdziwe dane oraz nie udostępniać danych logowania osobom trzecim. Za działania wykonane na koncie odpowiada jego właściciel.</p>
      </Section>

      <Section title="3. Plany, płatności i subskrypcja">
        <p>Usługa oferowana jest w modelu subskrypcyjnym (plany Basic i Pro), z okresem rozliczeniowym miesięcznym. Płatności obsługuje zewnętrzny operator płatności — Stripe. Usługodawca nie przechowuje danych kart płatniczych.</p>
        <p>Subskrypcja odnawia się automatycznie na kolejny okres rozliczeniowy, chyba że zostanie anulowana przed jego zakończeniem. Ceny podane są w złotówkach (PLN) lub dolarach (USD) i mogą ulec zmianie z odpowiednim wyprzedzeniem.</p>
      </Section>

      <Section title="4. Rezygnacja i zwroty">
        <p>Użytkownik może w dowolnym momencie anulować subskrypcję z poziomu ustawień konta lub panelu klienta Stripe — dostęp do płatnych funkcji zostaje zachowany do końca opłaconego okresu rozliczeniowego. Wpłacone środki za bieżący okres rozliczeniowy nie podlegają zwrotowi, chyba że przepisy prawa stanowią inaczej.</p>
      </Section>

      <Section title="5. Dane wprowadzane do systemu">
        <p>Trener, wprowadzając do Usługi dane swoich klientów (np. dane kontaktowe, plany treningowe, zdjęcia i pomiary postępów), pełni rolę administratora tych danych, a Usługodawca przetwarza je w jego imieniu jako podmiot przetwarzający. Trener odpowiada za posiadanie odpowiedniej podstawy prawnej do przetwarzania danych swoich klientów.</p>
      </Section>

      <Section title="6. Własność intelektualna">
        <p>Kod, design i znak „TrainerOS” stanowią własność Usługodawcy. Treści wprowadzane przez Użytkownika (plany treningowe, dane klientów) pozostają jego własnością.</p>
      </Section>

      <Section title="7. Ograniczenie odpowiedzialności">
        <p>Usługa świadczona jest w modelu „tak jak jest” (as-is). Usługodawca dokłada starań, by zapewnić ciągłość działania, ale nie gwarantuje nieprzerwanej dostępności i nie ponosi odpowiedzialności za szkody wynikające z przerw w działaniu, utraty danych spowodowanej działaniem dostawców zewnętrznych (m.in. Supabase, Stripe) lub nieprawidłowego korzystania z Usługi.</p>
      </Section>

      <Section title="8. Zawieszenie i rozwiązanie">
        <p>Usługodawca może zawiesić lub usunąć konto naruszające regulamin lub przepisy prawa. Użytkownik może usunąć konto w dowolnym momencie, kontaktując się z Usługodawcą.</p>
      </Section>

      <Section title="9. Zmiany regulaminu">
        <p>Usługodawca zastrzega sobie prawo do zmiany regulaminu. O istotnych zmianach Użytkownicy zostaną poinformowani drogą mailową lub poprzez komunikat w Usłudze.</p>
      </Section>

      <Section title="10. Prawo właściwe">
        <p>Niniejszy regulamin podlega prawu polskiemu. Spory rozstrzygane będą przez sąd właściwy dla siedziby Usługodawcy, z zastrzeżeniem bezwzględnie obowiązujących przepisów o ochronie konsumentów.</p>
      </Section>

      <Section title="11. Kontakt">
        <p>W sprawach związanych z Usługą prosimy o kontakt: contact@traineros.live</p>
      </Section>
    </article>
  )
}

function ContentEn() {
  return (
    <article className="mt-8 space-y-8 text-foreground">
      <header>
        <h1 className="text-3xl font-bold">TrainerOS Terms of Service</h1>
        <p className="text-sm text-muted-foreground mt-2">Last updated: {UPDATED}</p>
      </header>

      <Section title="1. General provisions">
        <p>These Terms govern the use of the TrainerOS platform (the &quot;Service&quot;), available at traineros.live, provided by PC Software Piotr Chuchla, ul. Decowskiego 102A, 38-400 Krosno, Poland, VAT/Tax ID (NIP): 5243028202 (the &quot;Provider&quot;).</p>
        <p>TrainerOS is a SaaS platform enabling personal trainers to create workout plans, manage clients, and track progress.</p>
      </Section>

      <Section title="2. Account and registration">
        <p>Using the full functionality of the Service requires creating an account. You must provide accurate information and keep your login credentials confidential. You are responsible for all activity under your account.</p>
      </Section>

      <Section title="3. Plans, billing and subscription">
        <p>The Service is offered on a subscription basis (Basic and Pro plans), billed monthly. Payments are processed by a third-party payment processor, Stripe. The Provider does not store card details.</p>
        <p>Subscriptions renew automatically for the next billing period unless cancelled before it ends. Prices are listed in PLN or USD and may change with reasonable prior notice.</p>
      </Section>

      <Section title="4. Cancellation and refunds">
        <p>You may cancel your subscription at any time from account settings or the Stripe customer portal — access to paid features continues until the end of the paid billing period. Amounts paid for the current billing period are non-refundable, except where required by law.</p>
      </Section>

      <Section title="5. Data you enter into the Service">
        <p>When a trainer enters client data into the Service (e.g. contact details, workout plans, progress photos and measurements), the trainer acts as the data controller for that data, and the Provider processes it on the trainer&apos;s behalf as a data processor. The trainer is responsible for having a valid legal basis to process their clients&apos; data.</p>
      </Section>

      <Section title="6. Intellectual property">
        <p>The code, design, and &quot;TrainerOS&quot; name are the Provider&apos;s property. Content you enter (workout plans, client data) remains your property.</p>
      </Section>

      <Section title="7. Limitation of liability">
        <p>The Service is provided &quot;as is&quot;. The Provider aims for continuous availability but does not guarantee uninterrupted operation and is not liable for damages arising from downtime, data loss caused by third-party providers (including Supabase, Stripe), or misuse of the Service.</p>
      </Section>

      <Section title="8. Suspension and termination">
        <p>The Provider may suspend or delete accounts that violate these Terms or applicable law. You may delete your account at any time by contacting the Provider.</p>
      </Section>

      <Section title="9. Changes to these Terms">
        <p>The Provider may update these Terms. Material changes will be communicated by email or via an in-app notice.</p>
      </Section>

      <Section title="10. Governing law">
        <p>These Terms are governed by Polish law. Disputes will be resolved by the court with jurisdiction over the Provider&apos;s registered address, subject to mandatory consumer-protection law.</p>
      </Section>

      <Section title="11. Contact">
        <p>For any questions about the Service, contact: contact@traineros.live</p>
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
