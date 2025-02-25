document.addEventListener('DOMContentLoaded', async() => {
    try {
        // Pobierz dane użytkownika
        const response = await axios.get('/user', { withCredentials: true });
        const user = response.data;

        // Wyświetl imię i nazwisko lub email
        let userName;
        if (user.firstName && user.lastName) {
            userName = `${user.firstName} ${user.lastName}`;
            localStorage.setItem('userName', userName); // Zapisz do localStorage
        } else {
            userName = user.email;
            localStorage.setItem('userEmail', user.email); // Zapisz email do localStorage jako userEmail
        }

        document.getElementById('userName').innerText = userName; // Wyświetl w headerze
    } catch (error) {
        console.error('Error loading user data:', error.response ? error.response.data : error.message);
        document.getElementById('userName').innerText = 'Unknown User'; // Domyślny tekst w przypadku błędu
    }

    // Obsługa wylogowania
    document.getElementById('logout').addEventListener('click', () => {
        document.cookie = 'token=; Max-Age=0; path=/'; // Usuń token
        document.cookie = 'userId=; Max-Age=0; path=/'; // Usuń userId
        window.location.href = '/'; // Przekierowanie na stronę główną
        localStorage.removeItem('userName'); // Usuń imię i nazwisko z localStorage
        localStorage.removeItem('userEmail'); // Usuń email z localStorage
    });
});