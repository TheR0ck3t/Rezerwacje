document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
    const toggleRegisterBtn = document.getElementById('toggle-register');
    const toggleLoginBtn = document.getElementById('toggle-login');

    // Sprawdź parametry URL, aby ustawić początkowy widok
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');

    if (view === 'register') {
        container.classList.add("active");
    } else {
        container.classList.remove("active");
    }

    registerBtn.addEventListener('click', () => {
        container.classList.add("active");
    });

    loginBtn.addEventListener('click', () => {
        container.classList.remove("active");
    });

    toggleRegisterBtn.addEventListener('click', () => {
        container.classList.add("active");
    });

    toggleLoginBtn.addEventListener('click', () => {
        container.classList.remove("active");
    });
});