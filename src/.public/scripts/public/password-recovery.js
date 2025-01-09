document.addEventListener('DOMContentLoaded', () => {
    const passwordRecoveryForm = document.getElementById('passwordRecoveryForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    passwordRecoveryForm.addEventListener('submit', async(event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        try {
            const response = await axios.post('/auth/password-recovery', { email });
            if (response.status === 200) {
                successMessage.classList.remove('d-none');
                errorMessage.classList.add('d-none');
            }
        } catch (error) {
            console.error('Error sending password recovery email:', error.response ? error.response.data : error.message);
            successMessage.classList.add('d-none');
            errorMessage.classList.remove('d-none');
        }

    });
    passwordRecoveryForm.addEventListener('reset', (e) => {
        window.location.href = "/auth?view=login";
    })
});