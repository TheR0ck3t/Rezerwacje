document.addEventListener('DOMContentLoaded', () => {
    // Attach the login form submit handler
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
                    withCredentials: true // Important for sending cookies with the request
                });

                const data = response.data;

                if (response.status === 200) {
                    if (data.requires2FA) {
                        show2FAModal(data.userId);
                    } else {
                        window.location.href = '/dashboard'; // Redirect to dashboard
                    }
                } else {
                    console.log('Error: ' + data.status);
                    alert(data.error || 'Failed to log in. Please try again later');
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
                    alert('Failed to log in. Reason: ' + (error.message || 'Please try again later'));
                }
            }
        });
        loginForm.addEventListener('reset', (e) => {
            window.location.href = '/'; // Redirect to home page
        });
    }

    // Function to show 2FA modal
    function show2FAModal(userId) {
        const twoFaModal = document.getElementById('twoFaModal');
        if (!twoFaModal) {
            console.error('2FA modal not found');
            return;
        }

        twoFaModal.style.display = 'block';

        // Handle 2FA verification
        const submit2faButton = document.getElementById('submitTwoFa');
        if (!submit2faButton) {
            console.error('Submit 2FA button not found');
            return;
        }

        submit2faButton.addEventListener('click', async(e) => {
            const token2fa = document.getElementById('twoFaInput').value;
            console.log('Sending 2FA verification request', { userId, token: token2fa });
            try {
                const response = await axios.post('auth/2fa/verify', {
                    userId,
                    token: token2fa
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true // Important for sending cookies with the request
                });

                const data = response.data;

                if (response.status === 200) {
                    // Redirect to dashboard after successful 2FA verification
                    window.location.href = '/dashboard';
                } else {
                    alert(data.error || 'Failed to verify 2FA. Please try again later');
                }
            } catch (error) {
                console.error(error);
                alert('Failed to verify 2FA. Please try again later');
            }
        });

        // Close the modal window
        window.addEventListener('click', (e) => {
            if (e.target === twoFaModal) {
                twoFaModal.style.display = 'none';
            }
        });
    }
});