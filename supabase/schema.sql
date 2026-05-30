-- ============================================================
-- TrainerOS — Schemat bazy danych (Supabase / PostgreSQL)
-- Wykonaj w Supabase SQL Editor
-- ============================================================

-- Tabela trenerów
CREATE TABLE IF NOT EXISTS public.trainers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL UNIQUE,
  name            text NOT NULL,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  plan            text NOT NULL DEFAULT 'trial',
  trial_ends_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Tabela klientów
CREATE TABLE IF NOT EXISTS public.clients (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id  uuid NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  name        text NOT NULL,
  email       text,
  phone       text,
  goal        text,
  notes       text,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Tabela ćwiczeń (globalne + prywatne trenera)
CREATE TABLE IF NOT EXISTS public.exercises (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id    uuid REFERENCES public.trainers(id) ON DELETE CASCADE,
  name          text NOT NULL,
  name_en       text,
  muscle_group  text NOT NULL,
  youtube_url   text,
  description   text,
  description_en text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Plany treningowe
CREATE TABLE IF NOT EXISTS public.plans (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  trainer_id  uuid NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  name        text NOT NULL,
  share_token text NOT NULL UNIQUE,
  active      boolean NOT NULL DEFAULT true,
  weeks       integer NOT NULL DEFAULT 4,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Dni treningowe w planie
CREATE TABLE IF NOT EXISTS public.plan_days (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id   uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  name      text NOT NULL,
  day_order integer NOT NULL
);

-- Ćwiczenia w dniu planu
CREATE TABLE IF NOT EXISTS public.plan_exercises (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id          uuid NOT NULL REFERENCES public.plan_days(id) ON DELETE CASCADE,
  exercise_id     uuid NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  sets            integer NOT NULL,
  reps            text NOT NULL,
  rest_seconds    integer,
  notes           text,
  exercise_order  integer NOT NULL
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.trainers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_days    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_exercises ENABLE ROW LEVEL SECURITY;

-- trainers
CREATE POLICY trainer_self ON public.trainers
  USING (id = auth.uid());

-- clients
CREATE POLICY client_owner ON public.clients
  USING (trainer_id = auth.uid());

-- exercises: globalne + własne
CREATE POLICY exercise_access ON public.exercises
  USING (trainer_id IS NULL OR trainer_id = auth.uid());

CREATE POLICY exercise_insert ON public.exercises FOR INSERT
  WITH CHECK (trainer_id = auth.uid());

CREATE POLICY exercise_update ON public.exercises FOR UPDATE
  USING (trainer_id = auth.uid());

CREATE POLICY exercise_delete ON public.exercises FOR DELETE
  USING (trainer_id = auth.uid());

-- plans: właściciel + publiczny odczyt przez share_token
CREATE POLICY plan_owner ON public.plans
  USING (trainer_id = auth.uid());

CREATE POLICY plan_public ON public.plans FOR SELECT
  USING (share_token IS NOT NULL);

-- plan_days: właściciel przez plan
CREATE POLICY plan_days_owner ON public.plan_days
  USING (
    plan_id IN (SELECT id FROM public.plans WHERE trainer_id = auth.uid())
  );

CREATE POLICY plan_days_public ON public.plan_days FOR SELECT
  USING (
    plan_id IN (SELECT id FROM public.plans WHERE share_token IS NOT NULL)
  );

-- plan_exercises: właściciel przez plan_days→plans
CREATE POLICY plan_exercises_owner ON public.plan_exercises
  USING (
    day_id IN (
      SELECT pd.id FROM public.plan_days pd
      JOIN public.plans p ON pd.plan_id = p.id
      WHERE p.trainer_id = auth.uid()
    )
  );

CREATE POLICY plan_exercises_public ON public.plan_exercises FOR SELECT
  USING (
    day_id IN (
      SELECT pd.id FROM public.plan_days pd
      JOIN public.plans p ON pd.plan_id = p.id
      WHERE p.share_token IS NOT NULL
    )
  );

-- ============================================================
-- Trigger: nowy trener po rejestracji
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_trainer()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.trainers (id, email, name, plan, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    'trial',
    NOW() + INTERVAL '14 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_trainer();

-- ============================================================
-- Seed: globalne ćwiczenia (trainer_id = NULL)
-- ============================================================

INSERT INTO public.exercises (trainer_id, name, name_en, muscle_group, youtube_url, description) VALUES
-- Klatka
(NULL, 'Wyciskanie sztangi na ławce płaskiej', 'Barbell Bench Press', 'chest', 'https://www.youtube.com/watch?v=rT7DgCr-3pg', 'Klasyczne ćwiczenie na klatkę. Trzymaj łopatki ściągnięte do siebie.'),
(NULL, 'Wyciskanie hantli na ławce płaskiej', 'Dumbbell Bench Press', 'chest', 'https://www.youtube.com/watch?v=QsYre__-aro', 'Większy zakres ruchu niż ze sztangą.'),
(NULL, 'Wyciskanie sztangi na ławce skośnej', 'Incline Barbell Bench Press', 'chest', 'https://www.youtube.com/watch?v=DbFgADa2PL8', 'Skupia się na górnej części klatki.'),
(NULL, 'Rozpiętki z hantlami', 'Dumbbell Flyes', 'chest', 'https://www.youtube.com/watch?v=eozdVDA78K0', 'Kontroluj ruch, nie opuszczaj zbyt nisko.'),
(NULL, 'Pompki', 'Push-ups', 'chest', NULL, 'Klasyczne ćwiczenie z masą ciała. Dłonie nieco szerzej niż ramiona.'),
(NULL, 'Dipsy na poręczach', 'Chest Dips', 'chest', 'https://www.youtube.com/watch?v=2z8JmcrW-As', 'Lekkie pochylenie do przodu angażuje klatkę.'),
(NULL, 'Krzyżowanie linek (cable crossover)', 'Cable Crossover', 'chest', 'https://www.youtube.com/watch?v=taI4XduLpTk', 'Izolacja klatki piersiowej.'),
(NULL, 'Wyciskanie na maszynie', 'Machine Chest Press', 'chest', NULL, 'Bezpieczna alternatywa dla ławki.'),
-- Plecy
(NULL, 'Martwy ciąg', 'Deadlift', 'back', 'https://www.youtube.com/watch?v=op9kVnSso6Q', 'Trzymaj plecy proste, biodra popychaj do przodu.'),
(NULL, 'Podciąganie na drążku (nachwytem)', 'Pull-ups (Overhand)', 'back', 'https://www.youtube.com/watch?v=eGo4IYlbE5g', 'Pełny zakres ruchu — od zwisu do brody ponad drążkiem.'),
(NULL, 'Podciąganie na drążku (podchwytem)', 'Chin-ups (Underhand)', 'back', NULL, 'Większe zaangażowanie bicepsa.'),
(NULL, 'Wiosłowanie sztangą w opadzie', 'Barbell Row', 'back', 'https://www.youtube.com/watch?v=9efgcAjQe7E', 'Plecy równoległe do podłoża, ciągnij do brzucha.'),
(NULL, 'Wiosłowanie hantlem', 'Dumbbell Row', 'back', 'https://www.youtube.com/watch?v=roCP6wCXPqo', 'Opieraj kolano o ławkę dla stabilności.'),
(NULL, 'Ściąganie drążka do klatki (lat pulldown)', 'Lat Pulldown', 'back', 'https://www.youtube.com/watch?v=CAwf7n6Luuc', 'Ściągaj łopatki, nie wychylaj się za bardzo.'),
(NULL, 'Wiosłowanie na maszynie (seated row)', 'Seated Cable Row', 'back', NULL, 'Dobre ćwiczenie dla środkowej części pleców.'),
(NULL, 'Hyperextension', 'Hyperextension', 'back', NULL, 'Ćwiczenie prostowników grzbietu i pośladków.'),
-- Nogi
(NULL, 'Przysiad ze sztangą', 'Barbell Squat', 'legs', 'https://www.youtube.com/watch?v=ultWZbUMPL8', 'Kolana nie wychodzą poza linię palców, plecy proste.'),
(NULL, 'Leg press', 'Leg Press', 'legs', 'https://www.youtube.com/watch?v=IZxyjW7MPJQ', 'Ustaw stopy dla różnego zaangażowania mięśni.'),
(NULL, 'Wykroki ze sztangą', 'Barbell Lunges', 'legs', 'https://www.youtube.com/watch?v=QOVaHwm-Q6U', 'Kolano tylnej nogi prawie dotyka podłogi.'),
(NULL, 'Martwy ciąg na prostych nogach (RDL)', 'Romanian Deadlift (RDL)', 'legs', 'https://www.youtube.com/watch?v=2SHsk9AzdjA', 'Skupia się na udach dwugłowych i pośladkach.'),
(NULL, 'Uginanie nóg w leżeniu', 'Lying Leg Curl', 'legs', NULL, 'Izolacja udostępnienia dwugłowych uda.'),
(NULL, 'Prostowanie nóg na maszynie', 'Leg Extension', 'legs', NULL, 'Izolacja czworogłowego uda.'),
(NULL, 'Wspięcia na palce ze sztangą', 'Standing Calf Raise', 'legs', NULL, 'Ćwiczenie łydek ze sztangą na plecach.'),
(NULL, 'Przysiad bułgarski (split squat)', 'Bulgarian Split Squat', 'legs', 'https://www.youtube.com/watch?v=2C-uNgKwPLE', 'Tylna noga oparta na ławce.'),
-- Barki
(NULL, 'Wyciskanie sztangi sprzed głowy', 'Overhead Press (Military Press)', 'shoulders', 'https://www.youtube.com/watch?v=CnBmiBqp-AI', 'Military press. Rdzeń napięty, plecy proste.'),
(NULL, 'Wyciskanie hantli nad głowę', 'Dumbbell Shoulder Press', 'shoulders', NULL, 'Większa swoboda ruchu niż ze sztangą.'),
(NULL, 'Unoszenie hantli bokiem (lateral raise)', 'Lateral Raise', 'shoulders', 'https://www.youtube.com/watch?v=3VcKaXpzqRo', 'Lekko ugnięte łokcie, kontrolowany ruch.'),
(NULL, 'Unoszenie hantli przodem (front raise)', 'Front Raise', 'shoulders', NULL, 'Angażuje przedni akton barku.'),
(NULL, 'Wzruszanie ramionami ze sztangą (shrugs)', 'Barbell Shrugs', 'shoulders', NULL, 'Ćwiczenie czworobocznego.'),
(NULL, 'Arnold press', 'Arnold Press', 'shoulders', 'https://www.youtube.com/watch?v=6Z15_WdXmVw', 'Rotacja dłoni angażuje wszystkie aktony barku.'),
-- Ramiona
(NULL, 'Uginanie ramion ze sztangą', 'Barbell Curl', 'arms', 'https://www.youtube.com/watch?v=kwG2ipFRgfo', 'Klasyczny curl na biceps. Łokcie przy ciele.'),
(NULL, 'Uginanie ramion z hantlami (naprzemiennie)', 'Alternating Dumbbell Curl', 'arms', NULL, 'Rotacja nadgarstka w górnej fazie.'),
(NULL, 'Uginanie ramion na modlitewniku (preacher curl)', 'Preacher Curl', 'arms', NULL, 'Izolacja bicepsa.'),
(NULL, 'Młotkowe uginanie ramion (hammer curl)', 'Hammer Curl', 'arms', NULL, 'Angażuje brachialis i brachioradialis.'),
(NULL, 'Prostowanie ramion nad głową (tricep overhead)', 'Overhead Tricep Extension', 'arms', NULL, 'Długa głowa tricepsa.'),
(NULL, 'Wyciskanie francuskie (skullcrusher)', 'Skullcrusher', 'arms', 'https://www.youtube.com/watch?v=d_KZxkY_0cM', 'Leżąc na ławce, opuszczaj sztangę za głowę.'),
(NULL, 'Dipsy na ławce (bench dips)', 'Bench Dips', 'arms', NULL, 'Ćwiczenie tricepsa z masą ciała.'),
(NULL, 'Prostowanie ramion na lince', 'Cable Tricep Pushdown', 'arms', NULL, 'Izolacja tricepsa przy wyciągu.'),
-- Core
(NULL, 'Plank', 'Plank', 'core', NULL, 'Utrzymaj ciało w linii prostej, napnij rdzeń.'),
(NULL, 'Brzuszki (crunch)', 'Crunch', 'core', NULL, 'Tylko górna część tułowia odrywa się od podłogi.'),
(NULL, 'Skłony tułowia z ciężarem (woodchop)', 'Wood Chop', 'core', NULL, 'Ćwiczenie rotacyjne angażujące skośne.'),
(NULL, 'Russian twist', 'Russian Twist', 'core', NULL, 'Rotacja tułowia z hantlem lub piłką.'),
(NULL, 'Unoszenie nóg w leżeniu', 'Lying Leg Raise', 'core', NULL, 'Dolna partia brzucha.'),
(NULL, 'Boczny plank', 'Side Plank', 'core', NULL, 'Mięśnie skośne i stabilizatory.'),
(NULL, 'Dead bug', 'Dead Bug', 'core', NULL, 'Ćwiczenie stabilizacji rdzenia z przeciwnymi ruchami ramion i nóg.'),
-- Cardio
(NULL, 'Bieżnia (bieg ciągły)', 'Treadmill Run', 'cardio', NULL, 'Utrzymaj stałe tętno w strefie tlenowej.'),
(NULL, 'Rowing (wioślarz)', 'Rowing Machine', 'cardio', NULL, 'Pełnociałowe cardio angażujące plecy i nogi.'),
(NULL, 'Rower stacjonarny', 'Stationary Bike', 'cardio', NULL, 'Dobre dla kolan — mało obciążające stawy.'),
(NULL, 'Skakanka', 'Jump Rope', 'cardio', NULL, 'Efektywne cardio wszędzie. Różnicuj tempo.'),
(NULL, 'Burpees', 'Burpees', 'cardio', NULL, 'Pełnociałowe ćwiczenie interwałowe.'),
(NULL, 'Battle ropes', 'Battle Ropes', 'cardio', NULL, 'Intensywny trening cardio angażujący ramiona.'),
(NULL, 'Eliptyczny', 'Elliptical', 'cardio', NULL, 'Niskoudarowe cardio dla stawów.'),
(NULL, 'High knees', 'High Knees', 'cardio', NULL, 'Bieg w miejscu z unoszeniem kolan wysoko.');
