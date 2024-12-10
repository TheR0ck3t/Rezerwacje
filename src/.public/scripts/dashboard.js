document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await axios.get('/user', {
            // No need to manually include the Authorization header; the token will be sent automatically via cookies
            withCredentials: true // Ensures cookies are included in the request
        });

        // If the response is successful, update the greeting element
        const data = response.data;
        document.getElementById('greeting').innerText = `${data.message}`;
    } catch (error) {
        // Handle errors (e.g., session expiration)
        console.error('Error fetching user data:', error.response ? error.response.data : error.message);
        alert('Session expired. Please log in again.');
        window.location.href = '/'; // Redirect to login page
    }


    // Logout handler
    document.getElementById('logout').addEventListener('click', () => {
        // Clear cookies (assuming your token is stored as a cookie)
        document.cookie = 'token=; Max-Age=0; path=/'; // Expire the token cookie
        document.cookie = 'userId=; Max-Age=0; path=/'; // Expire the userId cookie

        // Redirect to the homepage or login page
        window.location.href = '/';
    });

});