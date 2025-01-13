/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
    // Wprowadzenie testowych danych do tabeli rooms
    await knex('rooms').insert([{
            capacity: 50,
            details: JSON.stringify({
                name: "Sala Konferencyjna 1",
                images: ["/res/rooms/1/image1.jpg", "/res/rooms/1/image2.jpg"],
                location: "Warszawa, ul. Przykładowa 10",
                description: "Elegancka sala konferencyjna wyposażona w sprzęt multimedialny."
            }),
            price_per_1h: 150
        },
        {
            capacity: 20,
            details: JSON.stringify({
                name: "Sala Konferencyjna 2",
                images: ["/res/rooms/2/image1.jpg", "/res/rooms/2/image2.jpg"],
                location: "Kraków, ul. Przykładowa 20",
                description: "Nowoczesna sala konferencyjna z dostępem do internetu."
            }),
            price_per_1h: 100
        }
    ]);
};