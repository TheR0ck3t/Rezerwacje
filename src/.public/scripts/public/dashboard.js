document.addEventListener('DOMContentLoaded', async function() {

    // Pobierz dane użytkownika
    document.getElementById('greeting').innerHTML = "Witaj " + localStorage.getItem('userName');
    // Obsługa wylogowania
    document.getElementById('logout').addEventListener('click', () => {
        // Wyczyść ciasteczka (zakładając, że token jest przechowywany jako ciasteczko)
        document.cookie = 'token=; Max-Age=0; path=/'; // Wygaszenie ciasteczka tokenu
        document.cookie = 'userId=; Max-Age=0; path=/'; // Wygaszenie ciasteczka userId

        // Przekierowanie na stronę główną lub stronę logowania
        window.location.href = '/';
    });
});