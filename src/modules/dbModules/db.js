const pgp = require('pg-promise')();

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
    })
    .catch((error) => {
        console.log('Databace connection failed:', error.message || error);
    });

module.exports = db;