document.addEventListener('DOMContentLoaded', async() => {
    const roomDetailsContainer = document.getElementById('roomDetails');
    const reservationSummary = document.querySelector('.reservation-summary-container');
    const startDateSummary = document.getElementById('startDateSummary');
    const endDateSummary = document.getElementById('endDateSummary');
    const totalPriceElement = document.getElementById('totalPrice');
    const reserveButton = document.getElementById('reserveButton');
    const roomDescription = document.getElementById('roomDescription');
    const roomName = document.getElementById('roomName');
    const roomLocation = document.getElementById('roomLocation');
    const roomCapacity = document.getElementById('roomCapacity');
    const roomPrice = document.getElementById('roomPrice');
    const carouselImages = document.getElementById('carouselImages');

    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    const startDate = urlParams.get('start');
    const endDate = urlParams.get('end');

    if (!roomId) {
        roomDetailsContainer.innerHTML = `<p class="text-danger">Nie podano ID pokoju.</p>`;
        return;
    }

    try {
        // Pobieranie szczegółów pokoju
        const response = await axios.get(`/rooms/${roomId}`, { withCredentials: true });
        const room = response.data;

        if (!room) {
            roomDetailsContainer.innerHTML = `<p class="text-danger">Pokój o podanym ID nie istnieje.</p>`;
            return;
        }

        // Ustawianie tytułu strony
        document.title = `${room.name} - Szczegóły pokoju`;

        // Renderowanie szczegółów pokoju
        roomName.textContent = room.name;
        roomLocation.textContent = room.location;
        roomCapacity.textContent = room.capacity;
        roomPrice.textContent = room.pricePer1h;

        // Renderowanie obrazów w karuzeli
        carouselImages.innerHTML = room.images.map((image, index) => `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                <img src="${image}" class="d-block w-100 img-thumbnail" alt="${room.name}" style="max-height: 300px; object-fit: cover;">
            </div>
        `).join('');

        // Wyświetlanie opisu pokoju
        roomDescription.textContent = room.description || 'Brak opisu.';

        // Wyświetlanie podsumowania rezerwacji
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Kalkulacja ceny
            const hours = Math.ceil((end - start) / (1000 * 60 * 60));
            const totalPrice = hours * parseFloat(room.pricePer1h.replace(',', '.'));

            startDateSummary.textContent = start.toLocaleString();
            endDateSummary.textContent = end.toLocaleString();
            totalPriceElement.textContent = `${totalPrice.toFixed(2)} zł`;

            reservationSummary.style.display = 'block';

            // Obsługa przycisku "Zarezerwuj"
            reserveButton.addEventListener('click', async() => {
                const formData = {
                    roomId,
                    start: startDate,
                    end: endDate,
                    notes: null, // Opcjonalne pole notatek
                };

                try {
                    const response = await axios.post('/reservations/create', formData, { withCredentials: true });
                    console.log(response);
                    if (response.data.redirect) {
                        window.location.href = response.data.redirect;
                        return;
                    }
                } catch (error) {
                    console.error('Error creating reservation:', error.response ? error.response.data : error.message);
                    alert('Nie udało się utworzyć rezerwacji. Spróbuj ponownie później.');
                }
            });
        }
    } catch (error) {
        roomDetailsContainer.innerHTML = `<p class="text-danger">Nie udało się załadować szczegółów pokoju.</p>`;
        console.error('Error loading room details:', error);
    }
});