document.addEventListener('DOMContentLoaded', async() => {
    const bookingsTableBody = document.getElementById('bookingsTableBody');
    const bookingsTable = document.getElementById('bookingsTable');
    const noBookingsPlaceholder = document.getElementById('noBookingsPlaceholder');

    try {
        // Pobierz rezerwacje użytkownika
        const response = await axios.get('/reservations', { withCredentials: true });
        const reservations = Array.isArray(response.data) ? response.data : [];
        // Jeśli brak rezerwacji, pokaż placeholder
        if (reservations.length === 0) {
            noBookingsPlaceholder.style.display = 'block';
        } else {
            // Wyświetl tabelę i wypełnij ją danymi
            bookingsTable.style.display = 'table';
            reservations.forEach((reservation, index) => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <th scope="row">${index + 1}</th>
                    <td>${reservation.room_name || 'Nieznany pokój'}</td>
                    <td><div class="date-time">${new Date(reservation.start_time).toLocaleDateString()}<br>${new Date(reservation.start_time).toLocaleTimeString()}</div></td>
                    <td><div class="date-time">${new Date(reservation.end_time).toLocaleDateString()}<br>${new Date(reservation.end_time).toLocaleTimeString()}</div></td>
                    <td>
                        <span class="status-text">${reservation.status}</span>
                        ${getStatusIcon(reservation.status)}
                    </td>
                    <td>
                        <button class="btn btn-primary" onclick="viewReservation(${reservation.id})">Szczegóły</button>
                        <button class="btn btn-danger" onclick="cancelReservation(${reservation.id})">Anuluj</button>
                    </td>
                `;

                bookingsTableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading reservations:', error);

        // W przypadku błędu pokaż placeholder
        noBookingsPlaceholder.style.display = 'block';
        alert('Nie udało się załadować rezerwacji. Spróbuj ponownie później.');
    }
});

// Funkcja szczegółów rezerwacji
function viewReservation(reservationId) {
    alert(`Wyświetl szczegóły rezerwacji: ${reservationId}`);
    // Można przekierować do strony szczegółów jeżeli istnieje
}

// Funkcja anulowania rezerwacji
async function cancelReservation(reservationId) {
    if (confirm('Czy na pewno chcesz anulować tę rezerwację?')) {
        try {
            await axios.delete(`/reservations/${reservationId}`, { withCredentials: true });
            alert('Rezerwacja została anulowana.');
            location.reload();
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            alert('Nie udało się anulować rezerwacji.');
        }
    }
}

// Funkcja zamiany statusu na ikonę
function getStatusIcon(status) {
    switch (status) {
        case 'confirmed':
            return '<i class="fas fa-check-circle status-icon text-success"></i>';
        case 'pending':
            return '<i class="fas fa-hourglass-half status-icon text-warning"></i>';
        case 'cancelled':
            return '<i class="fas fa-times-circle status-icon text-danger"></i>';
        default:
            return '<i class="fas fa-question-circle status-icon text-muted"></i>';
    }
}