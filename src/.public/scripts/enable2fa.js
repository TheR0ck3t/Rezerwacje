document.addEventListener('DOMContentLoaded', () => {

    // Helper function to get cookie by name
    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }

    document.addEventListener('DOMContentLoaded', async function() {
        const userId = getCookie('userId'); // Get user ID from cookies
        const button = document.getElementById('enable-2fa'); // Button to toggle 2FA enable/disable

        // Check if 2FA is enabled for the user
        try {
            const response = await axios.get(`/auth/2fa/status/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getCookie('token')}`, // Get token from cookies
                },
            });

            const { is2FAEnabled } = response.data;
            // Update the button text based on the 2FA status
            if (is2FAEnabled) {
                button.innerText = 'Disable 2FA';
            } else {
                button.innerText = 'Enable 2FA';
            }
        } catch (error) {
            console.error('Error fetching 2FA status:', error);
        }
    });

    document.getElementById('enable-2fa').addEventListener('click', async function() {
        const userId = getCookie('userId'); // Get user ID from cookies
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
                if (response.data.success) {
                    alert('2FA has been disabled');
                    button.innerText = 'Enable 2FA'; // Change button text to enable 2FA
                } else {
                    alert('Failed to disable 2FA');
                }

            } else {
                // If 2FA is not enabled, send request to enable it
                const response = await axios.post('/auth/2fa/enable', {
                    userId,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getCookie('token')}`, // Get token from cookies
                    },
                });

                // Ensure response is handled
                if (response.data.qrCode) {
                    const { qrCode } = response.data;
                    const qrImage = document.getElementById('qrcode');
                    qrImage.src = qrCode;
                    qrImage.style.display = 'block';
                    button.innerText = 'Disable 2FA'; // Change button text to disable 2FA
                } else {
                    alert('Failed to enable 2FA');
                }
            }
        } catch (error) {
            console.error('Error with 2FA setup:', error);
            alert('Failed to change 2FA status');
        }
    });
});