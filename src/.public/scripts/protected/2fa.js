document.addEventListener('DOMContentLoaded', () => {

    // Funkcja pomocnicza do pobierania ciasteczka po nazwie
    function getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                return cookie.substring(name.length + 1);
            }
        }
        return null;
    }

    let is2FAEnabled = false; // Zmienna do przechowywania stanu 2FA

    // Funkcja do sprawdzania statusu 2FA
    async function check2FAStatus() {
        const userId = getCookie('userId'); // Pobierz ID użytkownika z ciasteczek
        if (!userId) {
            console.error('Nie znaleziono ID użytkownika w ciasteczkach');
            return;
        }
        const button = document.getElementById('enable-2fa'); // Przycisk do włączania/wyłączania 2FA

        try {
            const response = await axios.get(`/auth/2fa/status/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getCookie('token')}`, // Pobierz token z ciasteczek
                },
            });
            const { enabled } = response.data;
            is2FAEnabled = enabled; // Ustawienie stanu 2FA
            // Aktualizacja tekstu przycisku na podstawie statusu 2FA
            if (enabled) {
                button.innerText = 'Wyłącz weryfikację dwuetapową';
            } else {
                button.innerText = 'Włącz weryfikację dwuetapową';
            }
        } catch (error) {
            console.error('Błąd podczas pobierania statusu 2FA:', error);
        }
    }

    // Sprawdź status 2FA po załadowaniu strony
    check2FAStatus();

    // Nasłuchiwanie zdarzeń dla włączania/wyłączania 2FA
    document.getElementById('enable-2fa').addEventListener('click', async function() {
        const userId = getCookie('userId'); // Pobierz ID użytkownika z ciasteczek
        if (!userId) {
            console.error('Nie znaleziono ID użytkownika w ciasteczkach');
            return;
        }
        const button = document.getElementById('enable-2fa'); // Przycisk do włączania/wyłączania 2FA

        try {
            if (is2FAEnabled) {
                // Jeśli 2FA jest włączone, wyślij żądanie do wyłączenia
                const response = await axios.post('/auth/2fa/disable', {
                    userId,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getCookie('token')}`, // Pobierz token z ciasteczek
                    },
                });

                // Upewnij się, że odpowiedź jest obsłużona
                if (response.data.message === '2FA disabled') {
                    alert('2FA zostało wyłączone');
                    button.innerText = 'Włącz weryfikację dwuetapową'; // Zmień tekst przycisku na włącz 2FA
                    is2FAEnabled = false; // Aktualizacja stanu 2FA
                } else {
                    alert('Nie udało się wyłączyć 2FA');
                }

            } else {
                // Generowanie sekretu 2FA i kodu QR
                const generateResponse = await axios.post('/auth/2fa/generate', {
                    userId,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getCookie('token')}`, // Pobierz token z ciasteczek
                    },
                });

                if (generateResponse.data.qrCodeUrl) {
                    const { secret, qrCodeUrl } = generateResponse.data;
                    const qrImage = document.getElementById('qrcode');
                    qrImage.src = qrCodeUrl;
                    qrImage.style.display = 'block';

                    // Dodaj opóźnienie przed wyświetleniem okna dialogowego
                    setTimeout(async() => {
                        // Poproś o token 2FA
                        const token = prompt('Wprowadź token 2FA:');
                        if (!token) {
                            alert('Token 2FA jest wymagany');
                            return;
                        }

                        // Weryfikacja tokenu 2FA i włączenie 2FA
                        const enableResponse = await axios.post('/auth/2fa/enable', {
                            userId,
                            token,
                            secret,
                        }, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${getCookie('token')}`, // Pobierz token z ciasteczek
                            },
                        });

                        if (enableResponse.data.message === '2FA enabled') {
                            alert('2FA zostało włączone');
                            button.innerText = 'Wyłącz weryfikację dwuetapową'; // Zmień tekst przycisku na wyłącz 2FA
                            is2FAEnabled = true; // Aktualizacja stanu 2FA
                            qrImage.src = ''; // Wyczyść kod QR
                            qrImage.style.display = 'none'; // Ukryj kod QR
                        } else {
                            alert('Nie udało się włączyć 2FA');
                        }
                    }, 500); // Opóźnienie 500 ms
                } else {
                    alert('Nie udało się wygenerować sekretu 2FA');
                }
            }
        } catch (error) {
            console.error('Błąd podczas konfiguracji 2FA:', error);
            alert('Nie udało się zmienić statusu 2FA');
        }
    });
});