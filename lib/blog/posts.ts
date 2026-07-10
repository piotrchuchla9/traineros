export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] }

export type BlogLocaleContent = {
  title: string
  description: string
  blocks: BlogBlock[]
}

export type BlogPost = {
  slug: string
  date: string
  pl: BlogLocaleContent
  en: BlogLocaleContent
}

export const posts: BlogPost[] = [
  {
    slug: 'zarzadzanie-klientami-trener-personalny',
    date: '2026-07-10',
    pl: {
      title: 'Jak zarządzać klientami jako trener personalny bez chaosu w Excelu i wiadomościach',
      description: 'Excel i PDF-y wysyłane mailem to najczęstszy sposób pracy trenerów personalnych — i najczęstsza przyczyna chaosu. Oto jak to ogarnąć, nie rezygnując z szybkiego kontaktu przez WhatsApp.',
      blocks: [
        { type: 'p', text: 'Większość trenerów personalnych zaczyna od tego samego zestawu narzędzi: arkusz Excela z planem treningowym, WhatsApp do kontaktu z klientem i mail, żeby wysłać PDF-a. Działa to dopóki masz trzech, czterech klientów. Przy dziesięciu zaczyna się chaos — nie wiadomo, komu wysłałeś aktualną wersję planu, klient pyta o coś, czego nie pamiętasz, a szukanie starej wiadomości zajmuje więcej czasu niż sam trening.' },
        { type: 'h2', text: 'Problemem nie jest WhatsApp — jest brak jednego miejsca na dane' },
        { type: 'p', text: 'WhatsApp świetnie sprawdza się do szybkiego kontaktu — potwierdzenia sesji, krótkiego pytania, przypomnienia. Problem zaczyna się, gdy staje się też magazynem planów treningowych i historii postępów klienta. Każda zmiana w planie to nowy plik, nowa wersja, nowa wiadomość. Nie ma jednego miejsca, gdzie widzisz historię postępów klienta, jego pomiary i to, czy w ogóle otworzył plan, który mu wysłałeś.' },
        { type: 'ul', items: [
          'Brak wersjonowania — nie wiesz, którą wersję planu ma klient',
          'Zero wglądu w postępy — pomiary i zdjęcia lecą osobno, w wiadomościach',
          'Klient musi mieć konto/appkę, żeby cokolwiek zobaczyć',
          'Każda zmiana planu to ręczne wysyłanie od nowa',
        ] },
        { type: 'h2', text: 'Co powinno zastąpić ten układ' },
        { type: 'p', text: 'Dobre narzędzie do zarządzania klientami trenera personalnego powinno robić trzy rzeczy: trzymać wszystkie plany i klientów w jednym miejscu, dawać klientowi dostęp bez zakładania konta czy instalowania appki, i pokazywać Ci postępy (zdjęcia, pomiary, historię treningów) bez przeszukiwania wiadomości. WhatsApp zostaje tam, gdzie jest w tym najlepszy — do szybkiego kontaktu, nie do przechowywania danych.' },
        { type: 'p', text: 'W TrainerOS każdy plan treningowy dostaje unikalny link — klient otwiera go na telefonie, bez logowania i bez appki. Ty widzisz wszystkich klientów, ich plany i postępy w jednym dashboardzie, a zmiana planu aktualizuje się automatycznie pod tym samym linkiem, więc nie musisz niczego wysyłać ponownie. A jeśli chcesz szybko potwierdzić klientowi termin sesji, jedno kliknięcie wysyła gotową wiadomość na WhatsApp — bez przepisywania niczego ręcznie.' },
        { type: 'p', text: 'Jeśli pracujesz z więcej niż kilkoma klientami i czujesz, że tracisz czas na ogarnianie plików zamiast na trenowanie ludzi — warto to zmienić, zanim skala zrobi się nie do ogarnięcia. Możesz przetestować TrainerOS przez 14 dni za darmo, bez podawania karty.' },
      ],
    },
    en: {
      title: 'How to manage personal training clients without Excel-and-inbox chaos',
      description: 'Excel and PDFs sent by email are the default toolkit for personal trainers — and the most common source of chaos. Here\'s how to fix it without giving up quick WhatsApp contact.',
      blocks: [
        { type: 'p', text: 'Most personal trainers start with the same toolkit: an Excel sheet for the workout plan, WhatsApp to talk to the client, and email to send the PDF. It works fine with three or four clients. At ten, things start falling apart — you don\'t know which version of the plan the client has, they ask about something you don\'t remember, and finding an old message takes longer than the workout itself.' },
        { type: 'h2', text: 'The problem isn\'t WhatsApp — it\'s having no single place for your data' },
        { type: 'p', text: 'WhatsApp is great for quick contact — a session confirmation, a quick question, a reminder. The problem starts when it also becomes the storage for workout plans and progress history. Every change to a plan means a new file, a new version, a new message. There\'s no single place to see a client\'s progress history, their measurements, or whether they even opened the plan you sent.' },
        { type: 'ul', items: [
          'No versioning — you don\'t know which plan version the client actually has',
          'No visibility into progress — measurements and photos live scattered across messages',
          'Clients need an account or app just to see anything',
          'Every plan change means manually resending it',
        ] },
        { type: 'h2', text: 'What should replace this setup' },
        { type: 'p', text: 'A proper client management tool for personal trainers should do three things: keep every plan and client in one place, let clients access their plan without creating an account or installing an app, and show you progress (photos, measurements, workout history) without digging through messages. WhatsApp stays exactly where it\'s best — quick contact, not data storage.' },
        { type: 'p', text: 'In TrainerOS, every workout plan gets a unique shareable link — the client opens it on their phone, no login, no app. You see all your clients, their plans, and their progress in one dashboard, and editing a plan updates it live under the same link, so you never resend anything. And when you just need to confirm a session time, one click sends a ready-made WhatsApp message — no retyping anything by hand.' },
        { type: 'p', text: 'If you work with more than a handful of clients and feel like you\'re losing time managing files instead of coaching people, it\'s worth fixing before it gets out of hand. You can try TrainerOS free for 14 days, no card required.' },
      ],
    },
  },
  {
    slug: 'jak-stworzyc-plan-treningowy-dla-klienta',
    date: '2026-07-10',
    pl: {
      title: 'Jak stworzyć skuteczny plan treningowy dla klienta — przewodnik krok po kroku',
      description: 'Struktura, dobór ćwiczeń, progresja i komunikacja — konkretny proces budowania planu treningowego, który klient faktycznie zrozumie i będzie realizował.',
      blocks: [
        { type: 'p', text: 'Dobry plan treningowy to nie tylko lista ćwiczeń z seriami i powtórzeniami. To narzędzie komunikacji między Tobą a klientem — musi być zrozumiałe bez Twojej obecności, bo klient trenuje sam, w domu albo na siłowni, bez Ciebie obok.' },
        { type: 'h2', text: '1. Zacznij od celu i punktu startowego' },
        { type: 'p', text: 'Zanim dobierzesz pierwsze ćwiczenie, ustal jasno: jaki jest cel klienta (siła, redukcja, masa, zdrowie), ile ma czasu tygodniowo, jaki jest jego poziom doświadczenia i czy ma jakieś ograniczenia zdrowotne. Plan bez tego kontekstu jest generyczny — a generyczne plany klienci porzucają najszybciej.' },
        { type: 'h2', text: '2. Struktura ważniejsza niż dobór ćwiczeń' },
        { type: 'p', text: 'Liczba dni treningowych, podział na partie mięśniowe i kolejność ćwiczeń w sesji mają większy wpływ na efekty niż to, czy wybierzesz przysiad ze sztangą czy suwnicę. Ustal strukturę tygodnia najpierw, dobór konkretnych ćwiczeń dopiero potem.' },
        { type: 'h2', text: '3. Zaplanuj progresję z góry' },
        { type: 'p', text: 'Plan na jeden tydzień to za mało — klient robi postępy, a plan musi za nimi nadążać. Zaplanuj z góry, jak będzie rosło obciążenie albo liczba powtórzeń przez kolejne 4-6 tygodni, żeby nie improwizować co tydzień od zera.' },
        { type: 'h2', text: '4. Dodaj notatki, nie tylko liczby' },
        { type: 'p', text: 'Krótka notatka przy ćwiczeniu ("łokcie blisko tułowia", "tempo 3-1-1") często robi więcej niż sam dobór ćwiczenia. Klient nie ma Cię obok, żeby poprawić technikę na żywo — notatka to najbliższy substytut.' },
        { type: 'ul', items: [
          'Cel i poziom klienta przed doborem ćwiczeń',
          'Struktura tygodnia przed konkretnymi ćwiczeniami',
          'Progresja zaplanowana na kilka tygodni do przodu',
          'Notatki techniczne przy ćwiczeniach, nie tylko serie i powtórzenia',
        ] },
        { type: 'h2', text: '5. Wysyłka i śledzenie realizacji' },
        { type: 'p', text: 'Najlepszy plan nic nie da, jeśli klient go nie otworzy albo zgubi w wiadomościach. W TrainerOS plan trafia pod jeden stały link, z opcją przeciągania i zmiany kolejności ćwiczeń, a Ty widzisz w dashboardzie, czy klient faktycznie z niego korzysta.' },
      ],
    },
    en: {
      title: 'How to build an effective workout plan for a client — a step-by-step guide',
      description: 'Structure, exercise selection, progression, and communication — a concrete process for building a workout plan clients actually understand and follow.',
      blocks: [
        { type: 'p', text: 'A good workout plan isn\'t just a list of exercises with sets and reps. It\'s a communication tool between you and your client — it has to make sense without you standing there, because the client trains alone, at home or at the gym, without you next to them.' },
        { type: 'h2', text: '1. Start with the goal and the starting point' },
        { type: 'p', text: 'Before picking the first exercise, nail down: the client\'s goal (strength, fat loss, muscle, general health), how much time they have per week, their experience level, and any health limitations. A plan without this context is generic — and generic plans get abandoned fastest.' },
        { type: 'h2', text: '2. Structure matters more than exercise choice' },
        { type: 'p', text: 'The number of training days, muscle group split, and exercise order within a session affect results more than whether you pick a barbell squat or a hack squat machine. Nail down the weekly structure first, exercise selection second.' },
        { type: 'h2', text: '3. Plan the progression upfront' },
        { type: 'p', text: 'A single week\'s plan isn\'t enough — the client will improve, and the plan needs to keep up. Decide in advance how load or reps will increase over the next 4-6 weeks, instead of improvising from scratch every week.' },
        { type: 'h2', text: '4. Add notes, not just numbers' },
        { type: 'p', text: 'A short cue next to an exercise ("elbows tucked in", "3-1-1 tempo") often matters more than the exercise choice itself. The client doesn\'t have you there to correct form live — a note is the closest substitute.' },
        { type: 'ul', items: [
          'Goal and experience level before exercise selection',
          'Weekly structure before specific exercises',
          'Progression planned several weeks ahead',
          'Technique notes on exercises, not just sets and reps',
        ] },
        { type: 'h2', text: '5. Delivery and tracking adherence' },
        { type: 'p', text: 'The best plan is worthless if the client never opens it or loses it in a chat thread. In TrainerOS, a plan lives at one stable link, with drag-and-drop reordering of exercises, and you can see in your dashboard whether the client is actually using it.' },
      ],
    },
  },
]

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug)
}
