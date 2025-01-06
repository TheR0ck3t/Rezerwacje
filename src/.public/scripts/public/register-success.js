document.getElementById('resendVerification').addEventListener('click', async() => {
    try {
        const response = await axios.post('/auth/resend-verification', {}, { withCredentials: true });
        alert('E-mail weryfikacyjny został wysłany ponownie!');
    } catch (error) {
        console.error('Error resending verification email:', error.response ? error.response.data : error.message);
        alert('Nie udało się wysłać e-maila weryfikacyjnego. Spróbuj ponownie później.');
    }
});