addEventListener('DOMContentLoaded', () => {
    document.getElementById('register').addEventListener('click', async() => {
        const formContainer = document.getElementById('form-container');

        try {
            // Fetch the registration form template
            const response = await axios.get('/registerForm');
            const parser = new DOMParser();
            const doc = parser.parseFromString(response.data, 'text/html');
            const form = doc.querySelector('form'); // Select the form element from the fetched HTML

            // Clear any existing content and append the form
            formContainer.innerHTML = '';
            formContainer.appendChild(form);

            // Attach Cancel button functionality (reset button behavior)
            form.addEventListener('reset', () => {
                console.log('Cancel clicked');
                formContainer.innerHTML = '';
            });

            // Attach Submit functionality
            form.addEventListener('submit', async function(event) {
                event.preventDefault(); // Prevent page refresh

                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                try {
                    console.log(email, password);
                    const registerResponse = await axios.post('auth/register', {
                        email,
                        password
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (registerResponse.status !== 200) {
                        throw new Error(`Failed to register. ${registerResponse.statusText}`);
                    } else {
                        const data = registerResponse.data;
                        localStorage.setItem('userId', data.userId);
                        localStorage.setItem('token', data.token);
                        console.log(data.userId, data.token);
                        window.location.href = '/dashboard';
                    }
                } catch (error) {
                    console.error('Error registering:', error);
                    alert('Failed to register. Please try again later.');
                }
            });
        } catch (err) {
            console.error('Error loading the form:', err);
            alert('Failed to load the registration form. Please try again later.');
        }
    });
});