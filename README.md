# Rezerwacje

## Opis projektu
Projekt "Rezerwacje" to aplikacja webowa umożliwiająca użytkownikom rezerwację sal konferencyjnych. Aplikacja pozwala na zarządzanie rezerwacjami, przeglądanie dostępnych sal oraz szczegółów rezerwacji. Projekt został stworzony z wykorzystaniem technologii takich jak Node.js, Express, PostgreSQL oraz Bootstrap.

## Funkcjonalności
- Rejestracja i logowanie użytkowników
- Przeglądanie dostępnych sal konferencyjnych
- Tworzenie, edytowanie i anulowanie rezerwacji
- Przeglądanie szczegółów rezerwacji [WIP]
- Powiadomienia o statusie rezerwacji [WIP 25%]
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
1. Utwórz plik [.env](https://www.npmjs.com/package/dotenv) w katalogu głównym projektu i dodaj następujące zmienne środowiskowe:
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
    ### Konfiguracja maila może różnić się w zależności od dostawycy usługi, system testowany był za pomocą [MailerSend](https://www.mailersend.com/)

## Uruchomienie i wgrywanie testowych danych
1. Uruchom serwer aplikacji:
    ```sh
    npm start
    ```
2. Podczas uruchamiania serwera aplikacji, zostaniesz zapytany, czy chcesz wgrać testowe dane do bazy danych. Odpowiedz `Y`, aby wgrać testowe dane, lub `N`, aby pominąć ten krok.

Aplikacja najpierw sprawdzi swoje połączenie z serwerem bazy danych, a następnie sprawdzi, czy baza danych istnieje. Jeśli baza danych nie istnieje, aplikacja utworzy nową bazę danych o nazwie określonej w konfiguracji (`dbConfig.database`).
3. Otwórz przeglądarkę i przejdź do adresu `http://localhost:3000`, aby uzyskać dostęp do aplikacji.
   ```

## Dodawanie własnych danych dotyczących pokojów
1. Aby dodać własne dane dotyczące pokojów do bazy danych, możesz użyć poniższego przykładowego zapytania SQL. Struktura JSON dla danych dotyczących pokojów powinna wyglądać następująco:
    ```sql
    INSERT INTO rooms (capacity, details, price_per_1h) VALUES (
        50 -- Pojemność sali, 
    '{
        "name": "Sala Konferencyjna 1",         -- Nazwa sali
        "images": [                             -- Zdjęcia przedstawiające dane miejsce
            "/res/rooms/1/image1.jpg", 
            "/res/rooms/1/image2.jpg"
        ],
        "location": "Warszawa, ul. Przykładowa 10", -- Lokalizacja
        "description": "Elegancka sala konferencyjna wyposażona w sprzęt multimedialny." -- Opis
    }',
    150 -- Cena za godzinę
    );
    ```
2. Struktura folderów ze zdjęciami pokoi powinna wyglądać następująco:
    ```
    /res/rooms/
    ├── 1/
    │   ├── image1.jpg
    │   └── image2.jpg
    ├── 2/
    │   ├── image1.jpg
    │   └── image2.jpg
    └── ...
    ```
    Upewnij się, że zdjęcia pokoi są umieszczone w odpowiednich folderach zgodnie z powyższą strukturą.

## Struktura projektu
- [src](https://github.com/TheR0ck3t/Rezerwacje/tree/main/src) - Główny katalog źródłowy projektu
  - `.public/` - Pliki statyczne (CSS, JS, obrazy)
  - `modules/` - Middleware, error handler oraz moduł szyfrowania
  - `routes/` - Definicje tras
  - `services/` - Mailing
  - `views/` - Szablony widoków (pliki .ejs)
- `migrations/` - Pliki migracji bazy danych
- `seeds/` - Pliki seeda do wprowadzania danych testowych
- [README.md](https://github.com/TheR0ck3t/Rezerwacje/blob/main/README.md) - Dokumentacja projektu

## Technologie
- Node.js
- Express
- PostgreSQL
- pg-promise
- Knex.js
- EJS (Embedded JavaScript)
- Bootstrap
- Font Awesome
- Axios
- bcrypt
- cookie-parser
- crypto-js
- dotenv
- jsonwebtoken
- nodemailer
- nodemon
- otpauth
- qrcode
