/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Tworzenie tabeli users
    await knex.schema.createTable('users', (table) => {
        table.increments('id').primary(); // Klucz główny
        table.string('email', 255).notNullable().unique(); // E-mail
        table.string('password', 255).notNullable(); // Hasło
        table.string('two_factor_secret', 255); // Sekret 2FA
        table.string('first_name', 50); // Imię
        table.string('last_name', 50); // Nazwisko
        table.timestamp('created_at').defaultTo(knex.fn.now()); // Czas utworzenia
        table.timestamp('last_login'); // Ostatnie logowanie
        table.string('phone_number', 15); // Numer telefonu
        table.boolean('is_active').defaultTo(false); // Status aktywności
    });

    // Tworzenie tabeli rooms
    await knex.schema.createTable('rooms', (table) => {
        table.increments('id').primary(); // Klucz główny
        table.integer('capacity').notNullable(); // Pojemność
        table.jsonb('details').notNullable(); // Szczegóły (JSONB)
        table.specificType('price_per_1h', 'money').notNullable(); // Cena za godzinę
    });

    // Tworzenie tabeli reservations
    await knex.schema.createTable('reservations', (table) => {
        table.increments('id').primary(); // Klucz główny
        table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE'); // Klucz obcy: users
        table.integer('room_id').unsigned().references('id').inTable('rooms').onDelete('CASCADE'); // Klucz obcy: rooms
        table.timestamp('start_time').notNullable(); // Czas rozpoczęcia
        table.timestamp('end_time').notNullable(); // Czas zakończenia
        table.timestamp('created_at').defaultTo(knex.fn.now()); // Czas utworzenia
        table.string('status', 20).defaultTo('pending'); // Status rezerwacji
        table.text('notes'); // Notatki
        table.specificType('total_price', 'money').notNullable(); // Całkowita cena
    });
};

exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('reservations');
    await knex.schema.dropTableIfExists('rooms');
    await knex.schema.dropTableIfExists('users');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {

};