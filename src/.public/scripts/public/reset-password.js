document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    // Obsługa wysyłania formularza resetowania hasła
    resetPasswordForm.addEventListener('submit', async(event) => {
        event.preventDefault();

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token'); // Pobieranie tokena z URL
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Sprawdzenie, czy token jest obecny
        if (!token) {
            alert('Brak tokena resetowania hasła!');
            return;
        }

        // Sprawdzenie, czy hasła się zgadzają
        if (password !== confirmPassword) {
            alert('Hasła nie są zgodne!');
            return;
        }

        try {
            // Wysłanie żądania resetowania hasła
            await axios.post('/auth/reset-password', {
                token,
                password
            });

            // Wyświetlenie komunikatu o sukcesie
            alert('Hasło zostało zresetowane pomyślnie!');
            window.location.href = '/auth?view=login'; // Przekierowanie na stronę logowania
        } catch (error) {
            console.error('Błąd podczas resetowania hasła:', error.response ? error.response.data : error.message);
            // Wyświetlenie komunikatu o błędzie
            alert('Nie udało się zresetować hasła. Spróbuj ponownie później.');
        }
    });
});