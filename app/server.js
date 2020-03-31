const MongoClinet = require('mongodb').MongoClient;
const socketIo = require('socket.io').listen(4000);
const express = require('express');

MongoClinet.connect('mongodb://127.0.0.1/socketchat', function(err, db) {
    if(err) {
        throw err;
    }
    
    console.log('Connected to MongoDB');

    /// ---------------------- Az adatbázis konstansok definiálása. ----------------------
    const socketchat = db.db('socketchat');
    const users = socketchat.collection('users');
    const messages = socketchat.collection('messages');

    /// --------------------------- Az APP Beállítása ---------------------------
    const app = express();

    /// Inicializáljuk, hogy az alkalmazás használni tudja a CSS fájlokat, JavaScript-et,
    /// és a különböző képeket, amelyek publikusak. (Public mappában helyezkednek el)
    app.use(express.static('public'));

    socketIo.on('connection', function(socket) {
        console.log('Connected to socket.io, ID: ' + socket.id);

        socket.on("login", function(username) {

            console.log('Logged user name: ' + username);

            users.find().toArray(function (err, loggedInUsers) {
                if(err) {
                    throw err;
                }
                
                socket.emit('setLoggedInUsers', loggedInUsers);
            });

            messages.find().toArray(function(err, publicMessages) {
                if(err) {
                    throw err;
                }

                socket.emit('setPublicMessages', publicMessages);
            });

            users.insertOne({
                socketId: socket.id,
                username: username});

            socket.broadcast.emit('addNewLoggedInUser', {
                socketId: socket.id,
                username: username
            });
        });

        socket.on('disconnect', function() {
            console.log('User: ' + socket.id + ' disconnected!');

            users.deleteOne({socketId: socket.id}, function() {
                socket.broadcast.emit('logout', socket.id);
            });
        });

        socket.on('sendNewMessage', function(messageData) {
            if(messageData.isPublicMessage) {
                messages.insertOne({
                    username: messageData.username,
                    message: messageData.message,
                    date: messageData.date});
            }

            socketIo.emit('receiveNewMessage', messageData);
        });

        socket.on('createNewPrivateChat', function(usersData) {
            console.log(usersData);
            socket.to(usersData.recipientUserId).emit('createNewPrivateChat', usersData);
        });
    });
});