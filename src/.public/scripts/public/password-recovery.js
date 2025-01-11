document.addEventListener('DOMContentLoaded', () => {
    const passwordRecoveryForm = document.getElementById('passwordRecoveryForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    // Obsługa wysyłania formularza odzyskiwania hasła
    passwordRecoveryForm.addEventListener('submit', async(event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        try {
            // Wysyłanie żądania odzyskiwania hasła
            const response = await axios.post('/auth/password-recovery', { email });
            if (response.status === 200) {
                // Wyświetlanie komunikatu o sukcesie
                successMessage.classList.remove('d-none');
                errorMessage.classList.add('d-none');
            }
        } catch (error) {
            console.error('Błąd podczas wysyłania e-maila do odzyskiwania hasła:', error.response ? error.response.data : error.message);
            // Wyświetlanie komunikatu o błędzie
            successMessage.classList.add('d-none');
            errorMessage.classList.remove('d-none');
        }
    });

    // Obsługa resetowania formularza
    passwordRecoveryForm.addEventListener('reset', (e) => {
        window.location.href = "/auth?view=login";
    });
});