document.addEventListener('DOMContentLoaded', () => {
    // Attach the register form submit handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async(e) => {
            e.preventDefault();
            const email = document.getElementById('emailRegister').value;
            const password = document.getElementById('passwordRegister').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            try {
                const response = await axios.post('auth/register', {
                    email,
                    password
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = response.data;

                if (response.status === 200) {
                    window.location.href = '/register-success';
                } else {
                    alert(data.error || 'Failed to register. Please try again later');
                }
            } catch (error) {
                console.error(error);
                alert('Failed to register. Please try again later');
            }
        });

        registerForm.addEventListener('reset', (e) => {
            console.log('Register form cancelled');
            window.location.href = '/'; // Redirect to home page
        });
    }
});