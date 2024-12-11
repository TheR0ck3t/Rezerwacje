document.addEventListener('DOMContentLoaded', () => {
    // Load the login form dynamically
    document.getElementById('login').addEventListener('click', () => {
        const formContainer = document.getElementById('form-container');

        fetch('/loginForm')
            .then(res => res.text())
            .then(html => {
                // Parse the response HTML string into a DOM structure
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const form = doc.querySelector('form'); // Select the form element from the fetched HTML

                // Clear any existing content and append the form
                formContainer.innerHTML = ''; // Safe to clear everything
                formContainer.appendChild(form);

                // Attach the Cancel button functionality
                form.addEventListener('reset', () => {
                    console.log('Cancel clicked');
                    formContainer.innerHTML = ''; // Safely remove the form
                });

                // Attach the login form submit handler
                form.addEventListener('submit', async(e) => {
                    e.preventDefault();
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
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
                            alert(data.error || 'Failed to log in. Please try again later');
                        }
                    } catch (error) {
                        console.error(error);
                        alert('Failed to log in. Please try again later');
                    }
                });
            })
            .catch(err => console.error('Error loading the form:', err));
    });

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