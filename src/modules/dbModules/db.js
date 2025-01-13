const pgp = require('pg-promise')();
const knex = require('knex');
const readline = require('readline'); // Import do obsługi pytania w terminalu
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

db.connect()
    .then((obj) => {
        obj.done();
        console.log('Connected to the database: ' + db.$cn.database + ' on ' + db.$cn.host + ':' + db.$cn.port);
        checkAndInitializeSchema();
    })
    .catch((error) => {
        console.log('Database connection failed:', error.message || error);
    });


async function createDatabaseIfNotExists() {
    const defaultDb = pgp({
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database, // Domyślna baza danych PostgreSQL
        user: dbConfig.user,
        password: dbConfig.password,
    });

    try {
        const result = await defaultDb.oneOrNone(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbConfig.database]);
        if (!result) {
            await defaultDb.none(`CREATE DATABASE $1:name`, [dbConfig.database]);
            console.log(`Database ${dbConfig.database} created successfully.`);
        } else {
            console.log(`Database ${dbConfig.database} already exists.`);
        }
    } catch (error) {
        console.error('Error checking or creating database:', error);
    } finally {
        defaultDb.$pool.end(); // Zamknięcie połączenia
    }
}


async function checkAndInitializeSchema() {
    await createDatabaseIfNotExists(); // Sprawdzenie i utworzenie bazy danych, jeśli nie istnieje

    const knexInstance = knex(knexConfig.development);

    console.log('Checking database schema...');
    try {
        // Sprawdzenie, czy tabela 'users' istnieje
        const exists = await knexInstance.schema.hasTable('users');
        if (!exists) {
            console.log('Schema not found. Initializing schema...');
            await initSchema.up(knexInstance);
            console.log('Schema initialized successfully.');
            askToSeed(knexInstance); // Pytanie o wgranie danych testowych
        } else {
            console.log('Schema already exists. Skipping initialization.');
            askToSeed(knexInstance); // Pytanie o wgranie danych testowych mimo istniejącej bazy
        }
    } catch (error) {
        console.error('Error checking or initializing schema:', error);
    } finally {
        // Nie niszcz instancji tutaj, bo może być potrzebna do wgrywania seedów
    }
}

function askToSeed(knexInstance) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Do you want to load test data into the database? (Y/N): ', async(answer) => {
        if (answer.toLowerCase() === 'y') {
            try {
                console.log('Loading test data...');
                await seedData.seed(knexInstance); // Wywołanie seeda
                console.log('Test data loaded successfully.');
            } catch (error) {
                console.error('Error loading test data:', error);
            }
        } else {
            console.log('Skipping test data load.');
        }

        rl.close();
        knexInstance.destroy(); // Zamknięcie połączenia Knex
    });
}

module.exports = db;