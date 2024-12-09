document.getElementById('loginForm').addEventListener('submit', async(e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const token2fa = document.getElementById('token2fa').value ? document.getElementById('token2fa').value : null;

    try {
        const response = await axios.post('auth/login', {
            email,
            password,
            token2fa
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.status === 200) {
            if (data.requires2FA) {
                localStorage.setItem('userId', data.userId);
                show2FAModal(data.userId);
            } else {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);
                window.location.href = '/dashboard';
            }
        } else {
            alert(data.error || 'Failed to log in. Please try again later');
        }
    } catch (error) {
        console.error(error);
        alert('Failed to log in. Please try again later')
    }
});

// Function to show 2FA modal
function show2FAModal(userId) {
    const twoFaModal = document.getElementById('twoFaModal');
    twoFaModal.style.display = 'block';

    // Handle 2fa verification
    document.getElementById('submit2fa').addEventListener('click', async(e) => {
        const token2fa = document.getElementById('token2fa').value;
        const userId = localStorage.getItem('userId');
        console.log('sending 2fa verification request', { userId, token: token2fa });
        try {
            const response = await axios.post('auth/verify-2fa', {
                userId,
                token: token2fa
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.status === 200) {
                localStorage.setItem('token', data.token);
                window.location.href = '/dashboard';
            } else {
                alert(data.error || 'Failed to verify 2FA. Please try again later');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to verify 2FA. Please try again later')
        }
    });

    // Close the modal window
    window.addEventListener('click', (e) => {
        if (e.target === twoFaModal) {
            twoFaModal.style.display = 'none';
        }
    });

}