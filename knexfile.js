module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST, // Host bazy danych
            port: process.env.DB_PORT, // Port użytkownika
            user: process.env.DB_USER, // Nazwa użytkownika bazy
            password: process.env.DB_PASSWORD, // Hasło do bazy danych
            database: process.env.DB_NAME, // Nazwa bazy danych
        },
        migrations: {
            directory: './migrations', // Folder dla migracji
        },
        seeds: {
            directory: './seeds', // Folder dla danych testowych (opcjonalnie)
        },
    },
};