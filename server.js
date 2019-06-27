/// Az "mongodb", "socketio" és "express" Modulok importálás/ behúzása a szerver oldali részhez.
const MongoClinet = require('mongodb').MongoClient;
const io = require('socket.io').listen(4000);
const express = require('express');

/// URL Inicializálása, ahol az adatbázis elérhető
let url = 'mongodb://127.0.0.1/socketchat';

/**
 * Kapcsolódás megvalósítása a MongoDB-hez.
 */
MongoClinet.connect(url, function(err, db) 
{
    /// Ha a kapcsolat során bármilyen error keletkezett, akkor...
    if(err)
    {
        /// Akkor a hibát tovább dobjuk.
        throw err;
    }
    
    console.log('Connected to MongoDB');

    /// ---------------------- Az adatbázis konstansok definiálása. ----------------------
    /// Definiáljuk az adatbázist, illetve a szükséges táblákat, mint objektumok.
    const socketchat = db.db('socketchat');
    const users = socketchat.collection('users');
    const messages = socketchat.collection('messages');

    /// --------------------------- Az APP Beállítása ---------------------------
    /// Az Express modul Exportálása.
    const app = express();

    /// Inicializáljuk, hogy az alkalmazás használni tudja a CSS fájlokat, JavaScript-et,
    /// és a különböző képeket, amelyek publikusak. (Public mappában helyezkednek el)
    app.use(express.static('public'));

    /**
     * A Socket IO API-hoz való csatlakozás.
     */
    io.on('connection', function(socket) 
    {
        console.log('Connected to socket.io, ID: ' + socket.id);

        /**
         * LOGIN Metódus
         * 
         * Metódus, amely a felhasználó bejelentkeztetését valósítja meg.
         */
        socket.on("login", function(username)
        {
            console.log('LogIn: ' + username);

            /// Az összes felhasználó lekérdezése majd az eredményhalmaz átadása a bejelentkezett Kliens számára.
            /// Így inicializáljuk, hogy mely felhasználók vannak bejelentkezett állapotban.
            users.find().toArray(function (err, res)
            {
                /// Ha a kapcsolat során bármilyen error keletkezett, akkor...
                if(err)
                {
                    /// Akkor a hibát tovább dobjuk.
                    throw err;
                }
                
                /// Az eredményhalmaz átadása a Bejelentkezett Kliens számára.
                socket.emit('fillLoggedInUsers', res);
            });

            /// Az összes üzenet lekérdezése majd az eredményhalmaz átadása a bejelentkezett Kliens számára.
            /// Így inicializáljuk azokat az üzeneteket, amelyek már elhangzottak a beszélgetésben.
            messages.find().toArray(function(err, res)
            {
                /// Ha a kapcsolat során bármilyen error keletkezett, akkor...
                if(err)
                {
                    /// Akkor a hibát tovább dobjuk.
                    throw err;
                }

                /// Az eredményhalmaz átadása a bejelentkezett Kliens számára.
                socket.emit('fillPublicMessages', res);
            });

            /// A felhasználókat tároló collection-hoz hozzá adjuk a bejelentkezendő
            /// felhasználó adatait.
            users.insertOne({
                socketID: socket.id,
                 username: username});

            /// Minden Kliens-nek elküldjük, a bejelntkezett felhasználó adatait! (Kivéve aki küldte!)
            socket.broadcast.emit('addNewLoggedInUser', {
                socketID: socket.id,
                username: username
            });
        });

        /**
         * Metódus, amely a felhasználó kijelentkeztetését valósítja meg.
         */
        socket.on('disconnect', function()
        {
            console.log('User: ' + socket.id + ' disconnected!');

            /// A felhasználókat tároló collection-ből kitörli a lekapcsolandó felhasználó
            /// adatait.
            users.deleteOne({socketID: socket.id}, function()
            {
                /// Minden Kliens-nek elküldjük, a kijelentkezett felhasználó adatait! (Kivéve aki küldte!)
                socket.broadcast.emit('logoff', socket.id);
            });
        });

        /**
         * Metódus, amely a paraméterben kapott üzenetet az adatbázisba beszúrja, majd kiküldi minden kliens
         * számára.
         */
        socket.on('inputMessage', function(data)
        {
            /// Vizsgálat, hogy Public Chat-ről van-e szó, ugyan is csak azokat az üzeneteket mentjük
            /// az adatbázisba.
            if(data.publicChat)
            {
                messages.insertOne({username: data.username, message: data.message, date: data.date});
            }

            /// A klienstől kapott üzenet kiküldése a Kliensek számára.
            io.emit('outputMessage', data);
        });

        /**
         * Metódus, amely a Kliens oldaltól kapott adatok alapján, a kiválasztott User ID-ja alapján
         * amely megtalálható a paraméterben kapott objektumban, elkészít egy új Chat ablakot.
         */
        socket.on('createNewPrivateChatWindow', function(data)
        {
            /// Az üzenet küldése annak a felhasználónak, akinek a SocketID-ja megtalálható
            /// a küldendő objektumben (SocketID == secondUserID), azaz az üzenetet fogadó felhasználónak
            /// egy új Chat ablakot szükséges elkészíteni.
            socket.to(data.secondUserID).emit('createNewPrivateChatWindow', data);
        });
    });
});