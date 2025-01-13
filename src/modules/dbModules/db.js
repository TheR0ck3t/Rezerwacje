const pgp = require('pg-promise')();
const knex = require('knex');
const knexConfig = require('../../../knexfile');
const initSchema = require('../../../migrations/20250113013348_init_schema');

// Ustawienia bazy
const db = pgp({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Test ustawień
db.connect()
    .then((obj) => {
        obj.done();
        console.log('Connected to the database: ' + db.$cn.database + ' on ' + db.$cn.host + ':' + db.$cn.port);
        checkAndInitializeSchema();
    })
    .catch((error) => {
        console.log('Database connection failed:', error.message || error);
    });

async function checkAndInitializeSchema() {
    const knexInstance = knex(knexConfig.development);
    console.log('Checking db schema...');
    try {
        // Sprawdzenie, czy tabela 'users' istnieje
        const exists = await knexInstance.schema.hasTable('users');
        if (!exists) {
            console.log('Schema not found. Initializing schema...');
            await initSchema.up(knexInstance);
            console.log('Schema initialized successfully.');
        } else {
            console.log('Schema already exists. Skipping initialization.');
        }
    } catch (error) {
        console.error('Error checking or initializing schema:', error);
    } finally {
        knexInstance.destroy();
    }
}

module.exports = db;