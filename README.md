# [Rezerwacje](https://github.com/TheR0ck3t/Rezerwacje/tree/poprawa) 

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
- Docker
  
## Instalacja za pomocą Docker Compose
1. Utwórz plik `docker-compose.yml` w katalogu głównym projektu i dodaj następującą konfigurację:
    ```yaml
    services:
      database:
        image: postgres:17
        environment:
          POSTGRES_USER: 
          POSTGRES_PASSWORD: 
        ports:
          - "5432:5432"
        volumes:
          - postgres_data:/var/lib/postgresql/data
        healthcheck:
          test: ["CMD-SHELL", "pg_isready -U postgres"]
          interval: 30s
          timeout: 10s
          retries: 5

      rezerwacje:
        image: krokuduwu/rezerwacje-popr:latest
        ports:
          - "3000:3000"
        environment:
          - PORT=3000
          - JWT_SECRET=
          - ENCRYPTION_KEY=
          - DB_HOST=database
          - DB_PORT=5432
          - DB_NAME=rezerwacje
          - DB_USER=
          - DB_PASSWORD=
          - MAIL_ENABLE=false # True, jeżeli posiadamy jakiś serwer pocztowy
          - LOAD_TEST_DATA=true
    
          # Opcjonalna konfiguracja
          - MAIL_HOST=
          - MAIL_PORT=
          - MAIL_SECURE=
          - MAIL_USERNAME=
          - MAIL_PASSWORD=
          - MAIL_FROM=
          - FRONTEND_URL=
          - SUPPORT_EMAIL=
          
        depends_on:
          database:
            condition: service_healthy

      # Opcjonalnie można również dodać pgadmina aby ułatwić sobie dostęp do bazy danych poprzez webowe GUI
      pgadmin:
        image: dpage/pgadmin4:latest
        environment:
          PGADMIN_DEFAULT_EMAIL: admin@admin.com
          PGADMIN_DEFAULT_PASSWORD: admin
        ports:
          - "5050:80"
        depends_on:
          - database


    ```
    Aby wygenerować secrety można użyć np. Generatora tokenów dostępnego na stronie [it-tools.tech](https://it-tools.tech/token-generator)
   
3. Uruchom Docker Compose:
    ```sh
    docker-compose up
    ```
4. Otwórz przeglądarkę i przejdź do adresu `http://localhost:3000`, aby uzyskać dostęp do aplikacji.

## Dodawanie własnych danych dotyczących pokojów
1. Aby dodać własne dane dotyczące pokojów do bazy danych, możesz użyć poniższego przykładowego zapytania SQL. Struktura JSON dla danych dotyczących pokojów powinna wyglądać następująco:
    ```sql
    INSERT INTO rooms (capacity, details, price_per_1h) VALUES (
        50,
    '{
        "name": "Sala Konferencyjna 1",
        "images": [
            "/res/rooms/1/image1.jpg", 
            "/res/rooms/1/image2.jpg"
        ],
        "location": "Warszawa, ul. Przykładowa 10",
        "description": "Elegancka sala konferencyjna wyposażona w sprzęt multimedialny." 
    }',
    150
    );
    ```
       
- `capacity`: Pojemność sali, czyli maksymalna liczba osób, które mogą przebywać w sali.
- `details`: Szczegóły dotyczące sali, zapisane w formacie JSON. Zawiera takie informacje jak:
  - `name`: Nazwa sali.
  - `images`: Lista URL-i do zdjęć przedstawiających dane miejsce.
  - `location`: Lokalizacja sali.
  - `description`: Opis sali, zawierający informacje o wyposażeniu i innych cechach.
- `price_per_1h`: Cena za godzinę wynajmu sali.

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
- [src](https://github.com/TheR0ck3t/Rezerwacje/tree/poprawa/src) - Główny katalog źródłowy projektu
  - `.public/` - Pliki statyczne (CSS, JS, obrazy)
  - `modules/` - Middleware, error handler oraz moduł szyfrowania
  - `routes/` - Definicje tras
  - `services/` - Mailing
  - `views/` - Szablony widoków (pliki .ejs)
- [migrations](https://github.com/TheR0ck3t/Rezerwacje/tree/poprawa/migrations) - Pliki migracji bazy danych
- [seeds](https://github.com/TheR0ck3t/Rezerwacje/tree/poprawa/seeds) - Pliki seeda do wprowadzania danych testowych
- [README.md](https://github.com/TheR0ck3t/Rezerwacje/blob/poprawa/README.md) - Dokumentacja projektu

## Technologie
- Docker
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
