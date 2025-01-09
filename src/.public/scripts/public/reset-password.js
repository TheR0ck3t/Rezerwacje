document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    resetPasswordForm.addEventListener('submit', async(event) => {
        event.preventDefault();

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token'); // Pobieranie tokena z URL
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!token) {
            alert('Brak tokena resetowania hasła!');
            return;
        }

        if (password !== confirmPassword) {
            alert('Hasła nie są zgodne!');
            return;
        }

        try {
            await axios.post('/auth/reset-password', {
                token,
                password
            });

            alert('Hasło zostało zresetowane pomyślnie!');
            window.location.href = '/auth?view=login';
        } catch (error) {
            console.error('Error resetting password:', error.response ? error.response.data : error.message);
            alert('Nie udało się zresetować hasła. Spróbuj ponownie później.');
        }
    });
});