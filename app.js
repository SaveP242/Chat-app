const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mysql = require('mysql');
const bodyParser = require('body-parser');
const fs = require('fs');


// MySQL connection configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'Ecultify',
    password: 'EcultAdvert@456',
    database: 'chat_app'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected');
});

app.use(bodyParser.urlencoded({ extended: true }));

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// Handle login form submission
// Handle login form submission
app.post('/login', (req, res) => {
    const { username, password, receiver } = req.body; // Capture sender's and receiver's usernames
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password, receiver], (err, result) => {
        if (err) {
            throw err;
        }
        if (result.length > 0) {
            // Redirect to chat page upon successful login
            res.redirect(`/chat?sender=${username}&receiver=${receiver}`); // Pass both sender's and receiver's usernames to chat page
        } else {
            res.send('Invalid username or password');
        }
    });
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

// Handle registration form submission
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            throw err;
        }
        console.log('User registered successfully');
        // Redirect to login page after successful registration
        res.redirect('/');
    });
});

app.get('/chat', (req, res) => {
    const { sender, receiver } = req.query;
    const sql = 'SELECT * FROM messages WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?) ORDER BY timestamp';
    db.query(sql, [sender, receiver, receiver, sender], (err, result) => {
        if (err) {
            throw err;
        }
        res.sendFile(__dirname + '/public/index.html');
        io.on('connection', (socket) => {
            socket.emit('chat history', result);
            socket.on('chat message', (data) => {
                const { message } = data;
                const sql = 'INSERT INTO messages (sender, receiver, message) VALUES (?, ?, ?)';
                db.query(sql, [sender, receiver, message], (err, result) => {
                    if (err) {
                        throw err;
                    }
                    io.emit('chat message', data);
                });
            });
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});