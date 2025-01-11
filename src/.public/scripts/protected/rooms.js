document.addEventListener('DOMContentLoaded', () => {
    const roomsContainer = document.getElementById('roomsContainer');
    const filterForm = document.getElementById('filterForm');

    // Funkcja walidująca zakres dat
    function validateDateRange(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (startDate > endDate) {
            alert('Data zakończenia musi być późniejsza niż data rozpoczęcia.');
            return false;
        }
        return true;
    }

    // Funkcja pobierająca pokoje na podstawie filtrów
    async function fetchRooms(filters = {}) {
        const params = new URLSearchParams(filters);
        try {
            const response = await axios.get(`/rooms/get?${params.toString()}`, { withCredentials: true });
            const rooms = response.data;

            roomsContainer.innerHTML = '';
            if (rooms.length === 0) {
                // Wyświetlanie komunikatu, gdy brak dostępnych pokoi
                roomsContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <p class="text-muted">Brak dostępnych pokoi spełniających kryteria wyszukiwania.</p>
                    </div>
                `;
            } else {
                // Wyświetlanie dostępnych pokoi
                rooms.forEach((room) => {
                    const roomCard = document.createElement('div');
                    roomCard.className = 'col-md-4 mb-4';

                    const imagesHTML = room.images.map((image, index) => `
                        <div class="carousel-item ${index === 0 ? 'active' : ''}">
                            <img src="${image}" class="d-block w-100" alt="${room.name}">
                        </div>
                    `).join('');

                    roomCard.innerHTML = `
    <div class="card room-card">
        <div id="carousel-${room.id}" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
                ${imagesHTML}
            </div>
        </div>
        <div class="card-body">
            <h5 class="card-title">${room.name}</h5>
            <p class="card-text">${room.description || 'Brak opisu.'}</p>
            <p><strong>Lokalizacja:</strong> ${room.location || 'Brak danych'}</p>
            <p><strong>Pojemność:</strong> ${room.capacity} osób</p>
            <p><strong>Cena za godzinę:</strong> ${room.pricePer1h} PLN</p>
            <a href="/room-details?id=${room.id}&start=${filters.start_time}&end=${filters.end_time}" class="btn btn-outline-primary w-100">Zobacz szczegóły</a>
        </div>
    </div>
`;

                    roomsContainer.appendChild(roomCard);
                });
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
            // Wyświetlanie komunikatu o błędzie
            roomsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-danger">Nie udało się załadować listy pokoi. Spróbuj ponownie później.</p>
                </div>
            `;
        }
    }

    // Obsługa wysyłania formularza filtrów
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const startTime = document.getElementById('start_time').value;
        const endTime = document.getElementById('end_time').value;
        const minCapacity = document.getElementById('min_capacity').value;
        const minPrice = document.getElementById('min_price').value;
        const maxPrice = document.getElementById('max_price').value;

        // Walidacja dat
        if (!validateDateRange(startTime, endTime)) return;

        const filters = {
            start_time: startTime,
            end_time: endTime,
            min_capacity: minCapacity,
            min_price: minPrice,
            max_price: maxPrice,
        };

        // Pobieranie pokoi na podstawie filtrów
        fetchRooms(filters);
    });
});