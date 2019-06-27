/**
 * A DOM betöltésekor lefutó metódus.
 */
$(function() {
    /// A Kliens a szerveroldali SocketIO-hoz csatlakozása
    var socket = io.connect('http://127.0.0.1:4000');

    //#region EVENT METHODS
    /**
     * Click esemény definiálása a "login-chat" Button-ra.
     * 
     * Az esemény bejelentkezető kérelmet küld a szerver oldal felé.
     */
    $("a#login-chat").click(function(e) 
    {
        /// Az esemény alapértelmezett műveletének megakadályozása.
        e.preventDefault();

        /// Az felhasználó nevének kiolvasása a HTML Element-ből.
        let username = $("#user-name").val();

        /// A lokális tároló objektumban, azaz a böngészőben lementjük a bejelentkezni próbáló
        /// felhasználó felhasználónevét.
        localStorage.setItem("username", username);

        /// Vizsgáljuk, hogy a felhasználó kitöltött-e a felhasználó nevet.
        if (username != "") 
        {
            /// Kérelmet küldünk a szerver oldal felé, amely a bejelentkeztetést hajtja végre.
            socket.emit("login", username);

            /// A Login felület eltüntetése, majd a Chat felület megjelenítése.
            $("div#user-data").addClass('hidden');
            $("div#chat-main").removeClass('hidden');

            /// Animáció végig futtatása, ahhoz, hogy bejelentkezéskor, amikor az összes Chat üzenet betöltődik, akkor a végére kerüljön, az ablak.
            $('div.chatroom.active').animate({ scrollTop: $('div.chatroom.active').prop('scrollHeight') }, 1000);
        }
        else 
        {
            alert('You must enter a User Name!');
        }
    });

    /**
     * Billentyű lenyomás esemény definiálása a "user-name" Input mezőre
     * 
     * Metódus, amely beléptet a Chat felületre, amikor az ENTER billentyűt lenyomjuk.
     */
    $("input#user-name").keypress(function(e) 
    {
        /// A felhasználónév kiolvasása a HTML Input Elementből.
        let username = $("#user-name").val();

        /// Vizsgálat, hogy az eseménykezelő változóiban található KeyCode az a 13-mas-e
        /// (Azaz -> ENTER)
        if (e.which == 13) 
        {
            /// Vizsgálat, hogy a felhasználónév ki van-e töltve.
            if (username != "") 
            {
                /// A "login-chat" gombon egy Click eseményt hajtunk végre, azaz Login-t hajtunk végre.
                $("a#login-chat").click();
            } 
            else
            {
                alert('You must enter a User Name!');
            }
        }
    });

    /**
     * Billentyű lenyomás esemény definiálása a "chat-text" Input mezőre.
     * 
     * Metódus, amely elküld egy üzenetet, amikor az ENTER billentyűt lenyomjuk.
     */
    $("#chat-text").keypress(function(e) 
    {
        /// Vizsgálat, hogy az eseménykezelő változóiban található KeyCode az a 13-mas-e
        /// (Azaz az -> ENTER)
        if (e.which == 13) 
        {
            /// Szükséges adatok lekérdezése a Kliensről.
            ///     - A küldendő üzenet,
            ///     - Annak a "chat-window"-nak az ID-ja amelyik aktív a Küldő Kliens-nek.
            let message = $("#chat-text").val();
            let windowID = $("div#chat-windows div.active").attr('id');

            /// További változók definiálása.
            let publicChat = true;
            let secondUserName = false;
            let secondUserID;
            let data;

            /// Vizsgálat, hogy a küldendő üzenet, nem üres-e.
            if (message != "") 
            {
                /// Vizsgálat, hogy a "public-chat Room" aktív-e. Ha nem aktív, akkor Private Chat-ről beszélünk 
                if (!($("#public-chat").hasClass('active'))) 
                {
                    /// A logikai változó értékét False-ra állítjuk, ugyan is Private üzenetet szeretnénk küldeni.
                    publicChat = false;

                    /// Lekérdezzük annak a "chat-room"-nak az ID-ját, amely jelenleg Active állapotban van.
                    let usersDiv = $("div.chatroom.active").attr('id');

                    /// A "chat-room"-ot feldaraboljuk, így megkapjuk azt, hogy melyik a Küldő és a Fogadó Kliens.
                    let userArray = usersDiv.split("-");

                    /// A tömb 2. eleme fogja tartalmazni a fogadó Kliens nevét.
                    secondUserName = userArray[1];

                    /// A Fogadó Kliens SocketID-ját kiolvassuk abból a táblázatból, ahol tároljuk a bejelentkezett User-eket.
                    secondUserID = $("li:contains(" + secondUserName + ")").attr('id');

                    /// Vizsgálat, hogy annak a Kliens-nek SocketID-ja az létezik-e, akinek az üzenetet akarjuk küldeni.
                    if (!secondUserID) 
                    {
                        /// Ha az elem még nem létezik, mivel az első üzenetet küldjük-el neki, így a Fogadó Kliens Neve a tömb 1. eleme lesz.
                        secondUserName = userArray[0];

                        /// A Fogadó Kliens SocketID-ját kiolvassuk abból a táblázatból, ahol tároljuk a bejelentkezett User-eket.
                        secondUserID = $("li:contains(" + secondUserName + ")").attr('id');
                    }

                    /// A küldendő adathalmaz inicializálása.
                    data = {
                        from: localStorage.getItem("username"),
                        message: message,
                        date: moment().format("DD/MM/YYYY HH:mm"),
                        secondUserID: secondUserID,
                        secondUserName: secondUserName
                    };

                    /// Kérelem küldés a szerver oldal felé, azaz új ablak készítése a Fogadó Kliens számára.
                    socket.emit('createNewPrivateChatWindow', data);
                }

                /// Kérelem küldése a szerver oldal felé, amely el fogja küldeni az üzenetet. 
                /// Az objektum a küldendő üzenetet és a hozzá tartozó információkat fogja tartalmazni.
                socket.emit('inputMessage', {
                    username: localStorage.getItem('username'),
                    message: message,
                    date: moment().format("DD/MM/YYYY HH:mm"),
                    windowID: windowID,
                    publicChat: publicChat
                });

                /// Az INPUT mező ürítése, ahol az üzenet szövegét tároljuk.
                $("#chat-text").val("");

                /// Az esemény alapértelmezett műveletének megakadályozása.
                e.preventDefault();
            }
            else 
            {
                alert('You must enter a message');
            }
        }
    });

    /**
     * Duplaklikk esemény definiálása a "user-list li" mezőjére.
     * 
     * Metódus, amely azt valósítja meg, hogyha az Online User-re duplán kattintunk,
     * akkor egy Private Chat kezdeményezést indítunk el.
     */
    $(document).on("dblclick", "div#user-list li", function() 
    {
                /// A bejelentkezett felhasználó SocketID-ja.
                let socketID = $(this).attr('id');
        /// Annak a Kliens-nek a neve, aki kezdeményezi a Private Chat-et.
        let senderUserName = localStorage.getItem("username");

        /// Annak a Kliens-nek a neve, akinek az üzenetet szeretnénk küldeni.
        let receiverUserName = $(this).text();

        /// A beviteli mezőre való Fókuszálás.
        $("#chat-text").focus();

        /// Vizsgálat, hogy az a "Chat Room" már létezik-e a Room-ok között. Ha igen, akkor...
        if ($("div#rooms div#" + receiverUserName).length)
        {
            /// A már meglévő "Chat Room"-on egy Click eseményt hajtunk végre, hogy az megnyiljon.
            $("div#rooms div#" + receiverUserName).click();

            return;
        }

        /// Azokat a DIV-eket, amelyek aktuálisan aktívak mind a "room"-ban mind pedig a "chat-window"-sban, deaktiváljuk, ugyanis a fókusz a Private Chat
        /// ablakra fog kerülni.
        $("div#rooms > div").removeClass('active');
        $("div#chat-windows > div").removeClass('active');

        /// Ahhoz a DIV-hez, amely a "Chat Room"-okat tartalmazza (hiszen a Private Chat is egy Room lesz)
        ///     azokhoz hozzá adjuk azt az elemet, amely hivatkozni fogja, hogy melyik felhasználóval folytatunk magán
        ///     beszélgetést.
        /// Ahhoz a DIV-hez, amely a felek közötti Messagek-et tartalmazza, egy Private Message List-et tartalmazó DIV-et
        ///     adunk hozzá, így biztosítva az üzenetek megjelenését.
        $("div#rooms").append("<div id=" + receiverUserName + "  class='active'>" + "<span>x</span>" + receiverUserName + "</div>");
        $("div#chat-windows").append("<div id=" + senderUserName + "-" + receiverUserName + "  class='chatroom active'></div>");
    });

    /**
     * Click esemény definiálása a "rooms" DIV-ben található "room"-ra.
     * 
     * Metódus, amely lehetővé teszi azt, hogy a Kliens oldalon a "room"-ok közötti váltást meg tudjuk valósítani.
     */
    $("div#rooms").on("click", "div", function() 
    {
        /// Azokat a DIV-eket, amelyek aktuálisan aktívak mind a "room"-ban mind pedig a "chat-window"-sban,
        /// deaktiváljuk, ugyanis a fókusz a Private Chat ablakra fog kerülni.
        $("div#rooms > div").removeClass('active');
        $("div#chat-windows > div").removeClass('active');

        /// Ahhoz a DIV-hez amely tartalmazza, hogy melyik "room"-al szeretnénk Chat-elni, azt
        /// aktívvá tesszük és ha tartalmaz 'new' Class-t, azt eltávolítjuk.
        $(this).addClass('active');
        $(this).removeClass('new');

        /// Ha a Fő ("main-room") tartalmazza az "Active" Class-t, akkor a Public Chat fület kell aktiválni.
        if ($("div#main-room").hasClass('active')) 
        {
            $("#public-chat").addClass('active');
        } 
        else 
        {
            /// Inicializáljuk a Küldő és a Fogadó Kliens neveit.
            let firstUserName = localStorage.getItem("username");
            let secondUserName = $(this).attr('id');

            /// Azokat a DIV-eket aktiváljuk, amelyek a Küldő és Fogadó Kliens-nek is megvannak, annak érdekében,
            /// hogy láthassák egymás üzeneteit.
            $("div#chat-windows div#" + firstUserName + "-" + secondUserName).addClass('active');
            $("div#chat-windows div#" + secondUserName + "-" + firstUserName).addClass('active');
        }

        /// Animáció végig futtatása, ahhoz, hogyha egy új üzenet érkezik akkor a Chat ablak automatikusan lentebb gördüljön.
        $('div.chatroom.active').animate({ scrollTop: $('div.chatroom.active').prop('scrollHeight') }, 1000);
    });

    /**
     * Click esemény definiálása a "rooms" DIV-ben található SPAN Element-re.
     * 
     * Metódus, amely lehetővé teszi azt, hogy egy Private Chat Room bezáródjon a kérelmező Kliens számára.
     */
    $("div#rooms").on('click', 'span', function(e) 
    {
        /// Megakadájozzuk, hogy a további események lefussanak, a DOM Fában,
        /// mivel erre a DIV-re, már inicializálva lett egy esemény, hiába a SPAN TAG-et célozzuk meg.
        e.stopPropagation();

        /// Inicializáljuk a Küldő és a Fogadó Kliens Neveit.
        let firstUserName = localStorage.getItem("username");
        let secondUserName = $(this).parent().attr('id');

        /// Azokat a DIV-eket aktiváljuk, amelyek a Küldő és Fogadó Kliens-nek is megvannak, annak érdekében,
        /// hogy láthassák egymás üzeneteit.
        $("div#chat-windows div#" + firstUserName + "-" + secondUserName).remove();
        $("div#chat-windows div#" + secondUserName + "-" + firstUserName).remove();

        /// A DIV Class törlése, a "rooms" DIV-ből.
        $(this).parent().remove();

        /// Aktiváljuk a "Public Chat Room"-ot. 
        if ($("div#rooms > div").length == 1) 
        {
            $("div#main-room").addClass('active');
            $("div#public-chat").addClass('active');
        }
    });
    //#endregion

    //#region CATCH METHODS
    /**
     * Fill Logged In Usres - METHOD
     * 
     * A metódus feltölti a szerver oldaltól kapott felhasználók listájával a Kliens oldali aktuálisan elérhető
     * bejelentkezett felhasználók listáját.
     */
    socket.on('fillLoggedInUsers', function(usersData) 
    {
        /// A felhasználók listájának bejárása.
        usersData.forEach(item => {

            /// Vizsgálat, hogy ez a felhasználó, megtalálható-e már a felhasználók listájában. Ha nem, akkor...
            if (!$("li#" + item.socketID).length && $("div#user-list li").text() != item.username) 
            {
                /// Hozzáadjuk azt az elemet a felhasználók listájához.
                $("div#user-list ul").append('<li id="' + item.socketID + '">' + item.username + '</li>');
            }
        });
    });

    /**
     * Fill Public Messages - METHOD
     * 
     * A metódus feltölti a szerver oldaltól kapott (Public Chat Room) üzenetek listájával a Kliens oldali
     * Public Chat Room-ot az.
     */
    socket.on('fillPublicMessages', function(messages)
     {
        /// Az üzenetek listájának bejárása.
        messages.forEach(item => {
            $("div#public-chat").append("<p><span>" + item.date + "</span> <b>" + item.username + "</b>: " + item.message + "</p>");
        });
    });

    /**
     * Add New Logged In User - BROADCAST METHOD
     * 
     * A metódussal hozzáadjuk az újonnan bejelentkezett felhasználót a Kliens oldali aktuálisan elérhető
     * bejelentkezett felhasználók listájához.
     */
    socket.on("addNewLoggedInUser", function(data) 
    {
        $("div#user-list ul").append('<li id="' + data.socketID + '">' + data.username + '</li>');
    });

    /**
     * Log Off - BROADCAST METHOD
     * 
     * A metódussal eltávolítjuk a paraméterben kapott felhasználó adatait, az aktuálisan elérhető felhasználók
     * listájából.
     */
    socket.on("logoff", function(userID) 
    {
        /// Felhasználó eltávolítása a táblázatból.
        $("li#" + userID).remove();

        /// A lokális tároló objektumból, azaz a böngészőből is kitöröljük a kijelentkezett felhasználó
        /// adatait.
        localStorage.removeItem("username");
    });

    /**
     * Output - METHOD 
     * 
     * A metódussal beszúrjuk a szerver oldaltól kapott üzenetet, a megfelelő, aktív üzeneteket tartalmazó DIV-be.
     */
    socket.on('outputMessage', function(data)
    {
        let windowID;

        /// Ha a "chat-windows"-on belül nem található meg az az üzenet megjelenítő DIV a fogadó Kliens-nek,
        /// mint a Küldő félnek, akkor...
        if (!$("div#chat-windows div#" + data.windowID).length) 
        {
            /// A küldő fél "windowID"-ját feldaraboljuk egy tömbben
            let userArray = data.windowID.split("-");

            /// Majd a tömb két elemével megcserélve megkapjuk a fogadó fél "windowID-ját"
            windowID = userArray[1] + "-" + userArray[0];
        } 
        else 
        {
            /// Különben a WindowID-t megkapjuk a küldött adathalmazból.
            windowID = data.windowID;
        }

        /// Ha az üzenet az "public-chat"-ben érkezett de a "main-room", az nincs aktiválva (azaz a "public-chat" felület), akkor...
        if (data.publicChat && !$("div#main-room").hasClass('active')) 
        {
            /// A "main-room"-hoz hozzá adunk egy "new" Class jelzőt, hogy jelezzük, hogy új üzenet érkezett.
            $("div#main-room").addClass('new');
        } 
        else
        {
            /// Ha a Private Chat Partner Room-ja nem aktív, azaz a felhasználónak nincs megnyitva ez a szoba, akkor...
            if (!$("div#" + data.windowID).hasClass('active')) 
            {
                /// A Partner Room-jához hozzá adunk egy "new" Class jelzőt, annak érdekében, hogy jelezzük, hogy kapott egy új üzenetet.
                $("div#rooms div#" + data.username).addClass('new');
            }
        }

        /// A bejövő üzenet hozzáadása a Room-hoz tartozó Chat ablakhoz.
        $("div#chat-windows div#" + windowID).append("<p><span>" + data.date + "</span> <b>" + data.username + "</b>: " + data.message + "</p>");

        /// Animáció végig futtatása, ahhoz, hogyha egy új üzenet érkezik akkor a Chat ablak automatikusan lentebb gördüljön.
        $('div.chatroom.active').animate({ scrollTop: $('div.chatroom.active').prop('scrollHeight') }, 1000);
    });

    /**
     * Crate New Private Chat Window - METHOD
     * 
     * Metódus, amely a kapott adatok alapján, létrehoz egy új Private Chat Ablakot a Fogadó Kliens-nek,
     * így biztosítva a Private Chat funkciót. 
     */
    socket.on('createNewPrivateChatWindow', function(data) 
    {
        /// Ha az adatokban, nem található meg az Üzenet Küldő adatai, akkor nem folytatjuk tovább a metódust.
        if ($("div#" + data.from).length) 
        {
            return;
        }

        /// Azokat a DIV-eket, amelyek aktuálisan aktívak mind a "room"-ban mind pedig a "chat-window"-sban, deaktiváljuk, ugyanis a fókusz a Private Chat
        /// ablakra fog kerülni.
        $("div#rooms > div").removeClass('active');
        $("div#chat-windows > div").removeClass('active');

        /// Ahhoz a DIV-hez, amely a "Chat Room"-okat tartalmazza (hiszen a Private Chat is egy Room lesz)
        ///     azokhoz hozzá adjuk azt az elemet, amely hivatkozni fogja, hogy melyik felhasználóval folytatunk magán
        ///     beszélgetést.
        /// Ahhoz a DIV-hez, amely a felek közötti Messagek-et tartalmazza, egy Private Message List-et tartalmazó DIV-et
        ///     adunk hozzá, így biztosítva az üzenetek megjelenését.
        $("div#rooms").append("<div id=" + data.from + "  class='active'>" + "<span>x</span>" + data.from + "</div>");
        $("div#chat-windows").append("<div id=" + data.from + "-" + data.secondUserName + "  class='chatroom active'></div>");
    });
    //#endregion
});