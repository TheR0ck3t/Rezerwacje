document.addEventListener('DOMContentLoaded', async() => {
    try {
        // Pobierz dane użytkownika
        const response = await axios.get('/user', { withCredentials: true });
        const user = response.data;

        // Wyświetl imię i nazwisko lub email
        const userName = user.firstName && user.lastName ?
            `${user.firstName} ${user.lastName}` :
            user.email;

        localStorage.setItem('userName', userName); // Zapisz do localStorage
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
    });
});