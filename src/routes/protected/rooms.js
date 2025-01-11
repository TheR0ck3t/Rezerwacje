const express = require('express');
const router = express.Router();
const db = require('../../modules/dbModules/db');
const authToken = require('../../modules/authModules/authToken');

// Wyświetlanie pokoi pasujących do zakresu danych
router.get('/get', authToken, async(req, res) => {
    try {
        const { start_time, end_time, min_capacity = 1, min_price = 1, max_price = 100000 } = req.query;

        if (!start_time || !end_time) {
            return res.status(400).json({ error: 'Brak wymaganych parametrów: start_time i end_time' });
        }

        const query = `
            SELECT 
                r.id AS room_id,
                r.capacity,
                r.price_per_1h,
                r.details->>'name' AS name,
                r.details->>'location' AS location,
                r.details->>'description' AS description,
                r.details->'images' AS images
            FROM 
                rooms r
            LEFT OUTER JOIN 
                reservations res ON r.id = res.room_id 
                AND (
                    res.start_time < $2::timestamp
                    AND res.end_time > $1::timestamp
                )
            WHERE 
                r.capacity >= $3
                AND r.price_per_1h::numeric >= $4
                AND r.price_per_1h::numeric <= $5
                AND res.id IS NULL
            ORDER BY 
                r.price_per_1h::numeric ASC;
        `;

        const values = [start_time, end_time, min_capacity, min_price, max_price];

        const result = await db.query(query, values);

        const rooms = result.map((room) => ({
            id: room.room_id,
            capacity: room.capacity,
            pricePer1h: room.price_per_1h,
            name: room.name,
            location: room.location,
            description: room.description,
            images: room.images
        }));

        res.status(200).json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});

// Wyświetlanie szczegółów pokoju/sali
router.get('/:id', authToken, async(req, res) => {
    id = req.params.id;
    try {
        // Pobieranie szczegółów pokoju z bazy danych
        const room = await db.oneOrNone('SELECT * FROM rooms WHERE id = $1', [id]);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        const roomDetails = {
            id: room.id,
            capacity: room.capacity,
            pricePer1h: room.price_per_1h,
            ...room.details,
        };

        res.status(200).json(roomDetails);
    } catch (error) {
        console.error('Error fetching room details:', error);
        res.status(500).json({ error: 'Failed to fetch room details' });
    }
});

module.exports = {
    path: '/rooms',
    router,
    routeName: 'rooms'
};