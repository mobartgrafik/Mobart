# Mobart (Vite + React)

Aplikacja frontendowa oparta o Vite.

## Uruchomienie lokalne

1. Sklonuj repozytorium.
2. Zainstaluj zależności:
   ```bash
   npm install
   ```
3. Utwórz plik `.env.local` i ustaw zmienne środowiskowe:
   ```bash
   VITE_BASE44_APP_ID=your_app_id
   VITE_BASE44_APP_BASE_URL=your_backend_url
   VITE_GOOGLE_DRIVE_CLIENT_ID=your_google_oauth_client_id
   VITE_GOOGLE_DRIVE_ORDER_FILES_FOLDER_ID=optional_drive_folder_id
   VITE_GOOGLE_DRIVE_AVATARS_FOLDER_ID=optional_drive_folder_id
   ```
4. Uruchom aplikację:
   ```bash
   npm run dev
   ```

## Zapis plików w Google Drive

- Upload plików zleceń i avatarów działa tylko przez Google Drive bezpośrednio z frontendu.
- Aplikacja używa OAuth klienta Google (`VITE_GOOGLE_DRIVE_CLIENT_ID`) i przy pierwszym uploadzie poprosi użytkownika o zgodę.
- Zlecenia, klienci i pozostałe dane aplikacyjne dalej zapisują się do Supabase.
- Jeśli nie ustawisz konfiguracji Google Drive, upload plików będzie zablokowany i aplikacja pokaże błąd konfiguracyjny.
- Foldery `VITE_GOOGLE_DRIVE_ORDER_FILES_FOLDER_ID` i `VITE_GOOGLE_DRIVE_AVATARS_FOLDER_ID` są opcjonalne. Bez nich pliki trafią do głównego katalogu Drive zalogowanego użytkownika.

## Automatyczne wdrażanie na Render.com

Repo zawiera `render.yaml` (Blueprint), dzięki czemu Render może sam utworzyć i utrzymywać usługę.

### Co jest skonfigurowane

- typ usługi: **Static Site**,
- branch wdrożeniowy: `main`,
- build command: `npm ci && npm run build`,
- publish directory: `dist`,
- nazwa usługi: **mobart**,
- fallback dla SPA: rewrite `/* -> /index.html`,
- podglądy dla PR: włączone (`pullRequestPreviewsEnabled: true`).

### Jak to podpiąć raz (jednorazowo)

1. Wejdź na Render → **New +** → **Blueprint**.
2. Połącz repozytorium GitHub z tym projektem.
3. Wybierz branch `main` i potwierdź utworzenie usługi.

Po tej jednorazowej konfiguracji każdy `git push` na `main` uruchomi automatyczny build i deploy.

## Uwaga o sekretach

Jeśli aplikacja wymaga dodatkowych zmiennych środowiskowych, ustaw je w Render:
**Service → Environment**.

## Tryb serwisowy wspólny dla wszystkich

Konfiguracja kategorii i materiałów może działać wspólnie dla wszystkich użytkowników przez Supabase.

1. Otwórz SQL Editor w Supabase.
2. Wklej zawartość pliku [supabase/setup_print_type_settings.sql](/C:/Users/pc/Mobart/supabase/setup_print_type_settings.sql).
3. Uruchom skrypt.

Po utworzeniu tabeli `app_settings` ekran `Tryb serwisowy` zapisuje zmiany centralnie i nowe ustawienia są widoczne dla wszystkich na `https://mobart.onrender.com`.

Jeżeli tabela nie istnieje jeszcze po deployu, aplikacja nie przestanie działać:
- formularze dalej będą działały,
- tryb serwisowy przełączy się awaryjnie na zapis lokalny w przeglądarce,
- po wykonaniu SQL automatycznie zacznie używać Supabase.
