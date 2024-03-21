// Assuming you have already included Socket.IO in your HTML file

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        
        const formData = new FormData(loginForm);
        const username = formData.get('username');
        const password = formData.get('password');
        const receiver = formData.get('receiver');
        
        // Send login credentials to the server
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, receiver })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to chat page or perform some action upon successful login
                window.location.href = '/chat'; // Assuming /chat is your chat page route
            } else {
                // Display error message to the user
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
