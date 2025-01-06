document.addEventListener('DOMContentLoaded', () => {

    // Helper function to get cookie by name
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

    // Function to check 2FA status
    async function check2FAStatus() {
        const userId = getCookie('userId'); // Get user ID from cookies
        if (!userId) {
            console.error('User ID not found in cookies');
            return;
        }
        const button = document.getElementById('enable-2fa'); // Button to toggle 2FA enable/disable

        try {
            const response = await axios.get(`/auth/2fa/status/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getCookie('token')}`, // Get token from cookies
                },
            });
            const { enabled } = response.data;
            // Update the button text based on the 2FA status
            if (enabled) {
                button.innerText = 'Wyłącz weryfikację dwuetapową';
            } else {
                button.innerText = 'Włącz weryfikację dwuetapową';
            }
        } catch (error) {
            console.error('Error fetching 2FA status:', error);
        }
    }

    // Check 2FA status on page load
    check2FAStatus();

    // Event listener for enabling/disabling 2FA
    document.getElementById('enable-2fa').addEventListener('click', async function() {
        const userId = getCookie('userId'); // Get user ID from cookies
        if (!userId) {
            console.error('User ID not found in cookies');
            return;
        }
        const button = document.getElementById('enable-2fa'); // Button to toggle 2FA enable/disable

        // Check if 2FA is already enabled
        const is2FAEnabled = button.innerText === 'Disable 2FA';

        try {
            if (is2FAEnabled) {
                // If 2FA is enabled, send request to disable it
                const response = await axios.post('/auth/2fa/disable', {
                    userId,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getCookie('token')}`, // Get token from cookies
                    },
                });

                // Ensure response is handled
                if (response.data.message === '2FA disabled') {
                    alert('2FA has been disabled');
                    button.innerText = 'Enable 2FA'; // Change button text to enable 2FA
                } else {
                    alert('Failed to disable 2FA');
                }

            } else {
                // Generate 2FA secret and QR code
                const generateResponse = await axios.post('/auth/2fa/generate', {
                    userId,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getCookie('token')}`, // Get token from cookies
                    },
                });

                if (generateResponse.data.qrCodeUrl) {
                    const { secret, qrCodeUrl } = generateResponse.data;
                    const qrImage = document.getElementById('qrcode');
                    qrImage.src = qrCodeUrl;
                    qrImage.style.display = 'block';

                    // Dodaj opóźnienie przed wyświetleniem okna dialogowego
                    setTimeout(async() => {
                        // Prompt for 2FA token
                        const token = prompt('Enter 2FA token:');
                        if (!token) {
                            alert('2FA token is required');
                            return;
                        }

                        // Verify 2FA token and enable 2FA
                        const enableResponse = await axios.post('/auth/2fa/enable', {
                            userId,
                            token,
                            secret,
                        }, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${getCookie('token')}`, // Get token from cookies
                            },
                        });

                        if (enableResponse.data.message === '2FA enabled') {
                            alert('2FA has been enabled');
                            button.innerText = 'Disable 2FA'; // Change button text to disable 2FA
                        } else {
                            alert('Failed to enable 2FA');
                        }
                    }, 500); // Opóźnienie 500 ms
                } else {
                    alert('Failed to generate 2FA secret');
                }
            }
        } catch (error) {
            console.error('Error with 2FA setup:', error);
            alert('Failed to change 2FA status');
        }
    });
});