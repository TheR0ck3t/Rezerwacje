document.addEventListener("DOMContentLoaded", () => {
    // Przeniesienie na stronę logowania po kliknięciu przycisku
    document.getElementById('login').addEventListener('click', () => {
        window.location.href = '/auth'; // Przekierowanie na stronę /auth
    });
    document.getElementById('register').addEventListener('click', () => {
        window.location.href = '/auth'; // Przekierowanie na stronę /auth
    });
});