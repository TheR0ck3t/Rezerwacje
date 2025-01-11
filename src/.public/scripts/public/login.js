document.addEventListener('DOMContentLoaded', () => {
    // Podłącz obsługę formularza logowania
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async(e) => {
            e.preventDefault();
            const email = document.getElementById('emailLogin').value;
            const password = document.getElementById('passwordLogin').value;
            const token2fa = document.getElementById('token2fa') && document.getElementById('token2fa').value || null;

            try {
                const response = await axios.post('auth/login', {
                    email,
                    password,
                    token2fa
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true // Ważne dla wysyłania ciasteczek z żądaniem
                });

                const data = response.data;

                if (response.status === 200) {
                    if (data.requires2FA) {
                        show2FAModal(data.userId);
                    } else {
                        window.location.href = '/dashboard'; // Przekierowanie do panelu
                    }
                } else {
                    console.log('Error: ' + data.status);
                    alert(data.error || 'Nie udało się zalogować. Spróbuj ponownie później');
                }
            } catch (error) {
                console.error(error);
                if (error.response && error.response.status === 401) {
                    if (error.response.data.error === 'User is not active') {
                        alert('Konto nieaktywne. Proszę zweryfikować swój email.');
                    } else {
                        alert('Nieprawidłowy email lub hasło.');
                    }
                } else {
                    alert('Nie udało się zalogować. Powód: ' + (error.message || 'Spróbuj ponownie później'));
                }
            }
        });
        loginForm.addEventListener('reset', (e) => {
            window.location.href = '/'; // Przekierowanie na stronę główną
        });
    }

    // Funkcja do wyświetlania okna modalnego 2FA
    function show2FAModal(userId) {
        const twoFaModal = document.getElementById('twoFaModal');
        if (!twoFaModal) {
            console.error('Nie znaleziono okna modalnego 2FA');
            return;
        }

        twoFaModal.style.display = 'block';

        // Obsługa weryfikacji 2FA
        const submit2faButton = document.getElementById('submitTwoFa');
        if (!submit2faButton) {
            console.error('Nie znaleziono przycisku do wysyłania 2FA');
            return;
        }

        submit2faButton.addEventListener('click', async(e) => {
            const token2fa = document.getElementById('twoFaInput').value;
            console.log('Wysyłanie żądania weryfikacji 2FA', { userId, token: token2fa });
            try {
                const response = await axios.post('auth/2fa/verify', {
                    userId,
                    token: token2fa
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true // Ważne dla wysyłania ciasteczek z żądaniem
                });

                const data = response.data;

                if (response.status === 200) {
                    // Przekierowanie do panelu po pomyślnej weryfikacji 2FA
                    window.location.href = '/dashboard';
                } else {
                    alert(data.error || 'Nie udało się zweryfikować 2FA. Spróbuj ponownie później');
                }
            } catch (error) {
                console.error(error);
                alert('Nie udało się zweryfikować 2FA. Spróbuj ponownie później');
            }
        });

        // Zamknięcie okna modalnego
        window.addEventListener('click', (e) => {
            if (e.target === twoFaModal) {
                twoFaModal.style.display = 'none';
            }
        });
    }
});