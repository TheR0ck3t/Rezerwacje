# Rezerwacje

## Opis projektu
Projekt "Rezerwacje" to aplikacja webowa umożliwiająca użytkownikom rezerwację sal konferencyjnych. Aplikacja pozwala na zarządzanie rezerwacjami, przeglądanie dostępnych sal oraz szczegółów rezerwacji. Projekt został stworzony z wykorzystaniem technologii takich jak Node.js, Express, PostgreSQL oraz Bootstrap.

## Funkcjonalności
- Rejestracja i logowanie użytkowników
- Przeglądanie dostępnych sal konferencyjnych
- Tworzenie, edytowanie i anulowanie rezerwacji
- Przeglądanie szczegółów rezerwacji
- Powiadomienia o statusie rezerwacji
- Responsywny interfejs użytkownika

## Wymagania systemowe
- Node.js (wersja 14.x lub nowsza)
- PostgreSQL (wersja 12.x lub nowsza)
- NPM (Node Package Manager)

## Instalacja
1. Sklonuj repozytorium na swój lokalny komputer:
    ```sh
    git clone https://github.com/TheR0ck3t/Rezerwacje.git
    ```
2. Przejdź do katalogu projektu:
    ```sh
    cd Rezerwacje
    ```
3. Zainstaluj wymagane zależności:
    ```sh
    npm install
    ```

## Konfiguracja
1. Utwórz plik [.env](http://_vscodecontentref_/2) w katalogu głównym projektu i dodaj następujące zmienne środowiskowe:
    ```env
    # App config
    PORT=3000 # Port, na którym będzie działał serwer
    JWT_SECRET=your_jwt_secret # Sekret do uwierzytelniania JWT
    ENCRYPTION_KEY=your_encryption_key # Klucz szyfrowania do szyfrowania wrażliwych danych

    # Database config
    DB_HOST=localhost # Host bazy danych
    DB_PORT=5432 # Port, na którym działa serwer bazy danych
    DB_NAME=rezerwacje # Nazwa bazy danych
    DB_USER=your_db_user # Nazwa użytkownika bazy danych
    DB_PASSWORD=your_db_password # Hasło użytkownika bazy danych

    # Mailing config
    MAIL_HOST=smtp.mailersend.net # Host serwera pocztowego
    MAIL_PORT=587 # 587 dla TLS lub 465 dla SSL
    MAIL_SECURE=false # Bezpieczne połączenie z serwerem pocztowym (domyślnie dla portu 587: false) lub true, jeśli MAIL_PORT=465
    MAIL_USERNAME=your_mail_username # Nazwa użytkownika serwera pocztowego
    MAIL_PASSWORD=your_mail_password # Hasło użytkownika serwera pocztowego
    MAIL_FROM=Rezerwacje <your_mail@example.com> # Adres e-mail, z którego będą wysyłane wiadomości

    # Email templates
    FRONTEND_URL=http://localhost:3000 # URL aplikacji frontendowej
    SUPPORT_EMAIL=support@example.com # Adres e-mail wsparcia
    ```

## Uruchomienie
1. Uruchom serwer aplikacji:
    ```sh
    npm start
    ```
2. Otwórz przeglądarkę i przejdź do adresu `http://localhost:3000`, aby uzyskać dostęp do aplikacji.

## Struktura projektu
- [src](http://_vscodecontentref_/3) - Główny katalog źródłowy projektu
  - `controllers/` - Kontrolery aplikacji
  - `modules/` - Middleware, error handler oraz moduł szyfrowania
  - `routes/` - Definicje tras
  - `views/` - Szablony widoków
  - `.public/` - Pliki statyczne (CSS, JS, obrazy)
- [README.md](http://_vscodecontentref_/4) - Dokumentacja projektu

## Technologie
- Node.js
- Express
- PostgreSQL
- pg-promise
- EJS (Embedded JavaScript)
- Bootstrap
- Font Awesome
- Axios
- bcrypt
- cookie-parser
- crypto-js
- dotenv
- jsonwebtoken
- mailersend
- nodemailer
- nodemon
- otpauth
- qrcode

## Licencja
Projekt jest dostępny na licencji MIT. Zobacz plik `LICENSE` po więcej informacji.
