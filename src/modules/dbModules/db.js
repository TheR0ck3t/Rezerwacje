const pgp = require('pg-promise')();
const knex = require('knex');
const knexConfig = require('../../../knexfile');
const initSchema = require('../../../migrations/20250113013348_init_schema');
const seedData = require('../../../seeds/demo_data'); // Import seeda (jeśli jest)

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};

const db = pgp(dbConfig);

// Tworzenie instancji połączenia do serwera bazy danych
const serverDb = pgp({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password
});

// Funkcja sprawdzająca połączenie z serwerem
async function checkServerConnection() {
    try {
        await serverDb.connect();
        console.log('Connected to the database server: ' + dbConfig.host + ':' + dbConfig.port);
    } catch (error) {
        console.log('Database server connection failed:', error.message || error);
        process.exit(1); // Zakończenie procesu w przypadku błędu połączenia z serwerem
    }
}

// Funkcja sprawdzająca, czy istnieje baza danych
async function checkDatabaseExists() {
    try {
        const result = await serverDb.oneOrNone('SELECT 1 FROM pg_database WHERE datname = $1', [dbConfig.database]);
        if (!result) {
            console.log('Database does not exist:', dbConfig.database);
            await createDatabase(); // Utworzenie bazy danych, jeśli nie istnieje
            await checkAndInitializeSchema(true); // Inicjalizacja schematu i wgranie danych testowych
        } else {
            console.log('Database exists:', dbConfig.database);
            await checkAndInitializeSchema(process.env.LOAD_TEST_DATA === 'true'); // Inicjalizacja schematu i wgranie danych testowych, jeśli zmienna środowiskowa jest ustawiona
        }
    } catch (error) {
        console.log('Error checking database existence:', error.message || error);
        process.exit(1); // Zakończenie procesu w przypadku błędu sprawdzania bazy danych
    }
}

// Funkcja tworząca bazę danych
async function createDatabase() {
    try {
        await serverDb.none(`CREATE DATABASE ${dbConfig.database}`);
        console.log('Database created:', dbConfig.database);
    } catch (error) {
        console.log('Error creating database:', error.message || error);
        process.exit(1); // Zakończenie procesu w przypadku błędu tworzenia bazy danych
    }
}

// Funkcja inicjalizująca schemat bazy danych
async function checkAndInitializeSchema(loadTestData) {
    const knexInstance = knex(knexConfig.development);

    console.log('Checking database schema...');
    try {
        // Sprawdzenie, czy tabela 'users' istnieje
        const exists = await knexInstance.schema.hasTable('users');
        if (!exists) {
            console.log('Schema not found. Initializing schema...');
            await initSchema.up(knexInstance);
            console.log('Schema initialized successfully.');
            if (loadTestData) {
                await loadTestData(knexInstance); // Wgranie danych testowych
            }
        } else {
            console.log('Schema already exists. Skipping initialization.');
            if (loadTestData) {
                await loadTestData(knexInstance); // Wgranie danych testowych, jeśli schemat już istnieje
            }
        }
    } catch (error) {
        console.error('Error checking or initializing schema:', error);
    } finally {
        knexInstance.destroy(); // Zamknięcie połączenia Knex
    }
}

// Funkcja wgrywająca dane testowe
async function loadTestData(knexInstance) {
    try {
        console.log('Loading test data...');
        await seedData.seed(knexInstance); // Wywołanie seeda
        console.log('Test data loaded successfully.');
    } catch (error) {
        console.error('Error loading test data:', error);
    }
}

// Sprawdzanie połączenia z serwerem i istnienia bazy danych
(async() => {
    await checkServerConnection();
    await checkDatabaseExists();
    db.connect()
        .then((obj) => {
            obj.done();
            console.log('Connected to the database: ' + db.$cn.database + ' on ' + db.$cn.host + ':' + db.$cn.port);
        })
        .catch((error) => {
            console.log('Database connection failed:', error.message || error);
        });
})();

module.exports = db;