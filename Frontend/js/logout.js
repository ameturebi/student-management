
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logoutButton').addEventListener('click', () => {
        const confirmation = confirm('Are you sure you want to log out?');

        if (confirmation) {

            window.location.href = 'index.html'; // Redirect to login page
        }
    });
});
