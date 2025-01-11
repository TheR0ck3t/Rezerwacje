// Dodanie nasłuchiwania na kliknięcie przycisku "resendVerification"
document.getElementById('resendVerification').addEventListener('click', async() => {
    try {
        // Wysłanie żądania ponownego wysłania e-maila weryfikacyjnego
        await axios.post('/auth/register/resend-verification', {}, { withCredentials: true });
        // Wyświetlenie komunikatu o sukcesie
        alert('E-mail weryfikacyjny został wysłany ponownie!');
    } catch (error) {
        // Obsługa błędów i wyświetlenie komunikatu o błędzie
        console.error('Error resending verification email:', error.response ? error.response.data : error.message);
        alert('Nie udało się wysłać e-maila weryfikacyjnego. Spróbuj ponownie później.');
    }
});