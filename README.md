# SocketIO - RealTime Chat Web Application

About the application technologies and operation:

### Technologies:
- Programming Language: NodeJS (Client BackEnd Side)
- Descriptive Language: HTML5
- Style Description Language: CSS
- Database: MongoDB
- Other used modul: Express (NodeJS)

### About the application:
- The application allows for real time communication between more people, either as a common chat room or as a Private Chat between some logged in clients.
- Logged in users are recorded in MongoDB.
- After logging in, all users will automatically be included in the Private Chat Room, where they ca n share a conversation with each other.
  - Private Chat Room messages are stored in MongoDB, so all newly logged users can see the messages you have previously heard.
- The Online User list on the right side of the application contains a list of users logged in to the application.
- If you double click on the Client, you can initiate a Private Chat.
  - During the initiation, a new tab appears between the Rooms located above the message input field, with the name of the user with whom we initiate Private Chat and an X to ensure the completion of Private Chat.
  - A new Chat Window will appear in the Initiative, where Private Messages will be found. These messages will not be stored in MongoDB, so the messages will only be visible until we close this tab.
  - If we send a messa ge to the other party, he will receive a notification, so for him a new Chat Window will be created, a message sent by the Sending Client, and a list of Rooms added to the Sender Client..
  - So we can continue Private Communication between each other.
- If we s end messages to each other but the Sending Client window is not open, we will be notified of this message, so the color of the Room will change to blue.
- The Room Frame that is currently open is displayed with Red.
- So, both Broadcast forwarding and Unicast packet forwarding are implemented within the app.
- If a user closes the application, he / she will perform Disconnect, so it will be deleted from MongoDB.
