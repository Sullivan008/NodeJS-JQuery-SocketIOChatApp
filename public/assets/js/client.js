var socket = io.connect('http://127.0.0.1:4000');

var chatClient = {

    initSocketMethods: function() {

        socket.on('setLoggedInUsers', function(users) {
            users.forEach(item => {
                if (!$("li#" + item.socketId).length) {
                    $("div#user-list ul").append('<li id="' + item.socketId + '">' + item.username + '</li>');
                }
            });
        });

        socket.on('setPublicMessages', function(messages) {
            messages.forEach(item => {
                $("div#public-chat").append("<p><span>" + item.date + "</span> <b>" + item.username + "</b>: " + item.message + "</p>");
            });
        });

        socket.on("addNewLoggedInUser", function(loggedUser) {
            $("div#user-list ul").append('<li id="' + loggedUser.socketId + '">' + loggedUser.username + '</li>');
        });

        socket.on('createNewPrivateChat', function(usersData) {
            
            if ($("div#" + usersData.senderUserName).length) {
                return;
            }
            
            $("div#rooms > div").removeClass('active');
            $("div#chat-messages > div").removeClass('active');
    
            $("div#rooms").append("<div id=" + usersData.senderUserName + " class='active'><span>x</span>" + usersData.senderUserName + "</div>");
            $("div#chat-messages").append("<div id=" + usersData.senderUserName + "-" + usersData.recipientUserName + " class='chatroom active'></div>");
        });

        socket.on('receiveNewMessage', function(messageData) {
            let roomId;

            if (!$("div#chat-messages div#" + messageData.roomId).length) {
                let userArray = messageData.roomId.split("-");

                roomId = userArray[1] + "-" + userArray[0];
            } else {
                roomId = messageData.roomId;
            }

            if (messageData.isPublicMessage && !$("div#main-room").hasClass('active')) {
                $("div#main-room").addClass('new');
            } else {
                if (!$("div#" + messageData.roomId).hasClass('active')) {
                    $("div#rooms div#" + messageData.username).addClass('new');
                }
            }

            $("div#chat-messages div#" + roomId).append("<p><span>" + messageData.date + "</span> <b>" + messageData.username + "</b>: " + messageData.message + "</p>");
            $('div.chatroom.active').animate({ scrollTop: $('div.chatroom.active').prop('scrollHeight') }, 1000);
        });

        socket.on("logout", function(loggedOutUserId) {
            $("li#" + loggedOutUserId).remove();

            localStorage.removeItem("username");
        });
    },

    setLoginFormFocus: function() {
        $("input#user-name").focus();
    },

    initLoginActions: function() {

        $("a#login-chat").click(function(event) {
            event.preventDefault();

            let username = $("#user-name").val();

            if (username !== "") {
                localStorage.setItem("username", username);

                socket.emit("login", username);

                $("div#user-data").addClass('hidden');
                $("div#chat-main").removeClass('hidden');

                $('div.chatroom.active').animate({scrollTop: $('div.chatroom.active').prop('scrollHeight')}, 1000);
            } else {
                alert('You must enter a User Name!');
            }
        });

        $("input#user-name").keypress(function(event) {
            if (event.which === 13) {
                $("a#login-chat").click();
            }
        });
    },

    initMessageActions: function() {
        
        $("#message-text").keypress(function(event) {
            if (event.which === 13) {
                let message = $("#message-text").val();
                let roomId = $("div#chat-messages div.active").attr('id');
    
                if (message !== "") {
                    let isPublicMessage = true;
    
                    if (!($("#public-chat").hasClass('active'))) {
                        isPublicMessage = false;
    
                        let userArray = $("div.chatroom.active").attr('id').split("-");
                        let recipientUserName = userArray[1];
    
                        let usersData = {
                            senderUserName: localStorage.getItem("username"),
                            recipientUserName: recipientUserName,
                            recipientUserId: $("li:contains(" + recipientUserName + ")").attr('id')};
    
                        socket.emit('createNewPrivateChat', usersData);
                    }
    
                    socket.emit('sendNewMessage', {
                        username: localStorage.getItem('username'),
                        message: message,
                        date: moment().format("DD/MM/YYYY HH:mm"),
                        roomId: roomId,
                        isPublicMessage: isPublicMessage});
    
                    $("#message-text").val("");
    
                    event.preventDefault();
                } else {
                    alert('You must enter a message');
                }
            }
        });
    },

    initUserListActions: function() {
        $(document).on("dblclick", "div#user-list li", function() {
            let senderUserName = localStorage.getItem("username");
            let recipientUserName = $(this).text();
    
            $("#message-text").focus();
    
            if ($("div#rooms div#" + recipientUserName).length) {
                $("div#rooms div#" + recipientUserName).click();
    
                return;
            }
    
            $("div#rooms > div").removeClass('active');
            $("div#chat-messages > div").removeClass('active');
    
            $("div#rooms").append("<div id=" + recipientUserName + " class='active'>" + "<span>x</span>" + recipientUserName + "</div>");
            $("div#chat-messages").append("<div id=" + senderUserName + "-" + recipientUserName + " class='chatroom active'></div>");
        });
    },

    initRoomActions: function() {
        $("div#rooms").on("click", "div", function() {
            $("div#rooms > div").removeClass('active');
            $("div#chat-messages > div").removeClass('active');

            $(this).addClass('active');
            $(this).removeClass('new');

            if ($("div#main-room").hasClass('active')) {
                $("#public-chat").addClass('active');
            } else {
                let senderUserName = localStorage.getItem("username");
                let recipientUserName = $(this).attr('id');

                $("div#chat-messages div#" + senderUserName + "-" + recipientUserName).addClass('active');
                $("div#chat-messages div#" + recipientUserName + "-" + senderUserName).addClass('active');
            }
            
            $('div.chatroom.active').animate({ scrollTop: $('div.chatroom.active').prop('scrollHeight') }, 1000);
        });

        $("div#rooms").on('click', 'span', function(event) {
            event.stopPropagation();

            let senderUserName = localStorage.getItem("username");
            let recipientUserName = $(this).parent().attr('id');

            $("div#chat-messages div#" + senderUserName + "-" + recipientUserName).remove();
            $("div#chat-messages div#" + recipientUserName + "-" + senderUserName).remove();

            $(this).parent().remove();

            if ($("div#rooms > div").length === 1) {
                $("div#main-room").addClass('active');
                $("div#public-chat").addClass('active');
            }
        });
    },

    init: function() {
        this.initSocketMethods();

        this.setLoginFormFocus();

        this.initLoginActions();
        this.initMessageActions();
        this.initUserListActions();
        this.initRoomActions();
    }
};

$(function(){
    chatClient.init();
});