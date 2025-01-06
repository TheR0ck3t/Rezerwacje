document.addEventListener('DOMContentLoaded', async function() {

    // Get user data
    document.getElementById('greeting').innerHTML = "Witaj " + localStorage.getItem('userName');
    // Logout handler
    document.getElementById('logout').addEventListener('click', () => {
        // Clear cookies (assuming your token is stored as a cookie)
        document.cookie = 'token=; Max-Age=0; path=/'; // Expire the token cookie
        document.cookie = 'userId=; Max-Age=0; path=/'; // Expire the userId cookie

        // Redirect to the homepage or login page
        window.location.href = '/';
    });
});