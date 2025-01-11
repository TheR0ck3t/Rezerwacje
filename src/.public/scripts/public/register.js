document.addEventListener('DOMContentLoaded', () => {
    // Podłącz obsługę formularza rejestracji
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async(e) => {
            e.preventDefault();
            const email = document.getElementById('emailRegister').value;
            const password = document.getElementById('passwordRegister').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Sprawdzenie, czy hasła się zgadzają
            if (password !== confirmPassword) {
                alert('Hasła nie są zgodne');
                return;
            }

            try {
                // Wysłanie żądania rejestracji
                const response = await axios.post('auth/register', {
                    email,
                    password
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = response.data;

                // Sprawdzenie odpowiedzi serwera
                if (response.status === 200) {
                    window.location.href = '/register-success'; // Przekierowanie na stronę sukcesu rejestracji
                } else {
                    alert(data.error || 'Rejestracja nie powiodła się. Spróbuj ponownie później');
                }
            } catch (error) {
                console.error(error);
                alert('Rejestracja nie powiodła się. Spróbuj ponownie później');
            }
        });

        registerForm.addEventListener('reset', (e) => {
            console.log('Formularz rejestracji został anulowany');
            window.location.href = '/'; // Przekierowanie na stronę główną
        });
    }
});