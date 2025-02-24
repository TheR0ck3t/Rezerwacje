document.addEventListener('DOMContentLoaded', async function() {
    // Funkcja do ustawienia powitania
    function setGreeting() {
        const userName = localStorage.getItem('userName');
        const userEmail = localStorage.getItem('userEmail');
        if (userName || userEmail) {
            document.getElementById('greeting').innerHTML = "Witaj " + (userName || userEmail);
        } else {
            // Jeśli dane nie są jeszcze dostępne, spróbuj ponownie po krótkim czasie
            setTimeout(setGreeting, 100);
        }
    }

    // Ustaw powitanie
    setGreeting();

    // Obsługa wylogowania
    document.getElementById('logout').addEventListener('click', () => {
        // Wyczyść ciasteczka (zakładając, że token jest przechowywany jako ciasteczko)
        document.cookie = 'token=; Max-Age=0; path=/'; // Wygaszenie ciasteczka tokenu
        document.cookie = 'userId=; Max-Age=0; path=/'; // Wygaszenie ciasteczka userId

        // Przekierowanie na stronę główną lub stronę logowania
        window.location.href = '/';
    });
});