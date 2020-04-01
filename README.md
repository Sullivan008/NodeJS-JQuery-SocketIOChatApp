# NodeJS - SocketIO - JQuery - RealTime Chat Web Application [Year of Development: 2019 and 2020]

About the application technologies and operation:

### Technologies:
- Programming Language: NodeJS
- FrontEnd Side: JQuery (~3.4.1) - SocketIO Client (~2.2.0)
- BackEnd Side: NodeJS (~10.16.3) - SocketIO Server (~2.2.0)
- Descriptive Language: HTML5 
- Style Description Language: CSS (Bootstrap ~4.3.1.)
- Database: MongoDB (~3.2.7)
- Other used modul: 
  - Express Module (~4.17.1)
  - Moment (~2.24.0)
  - Nodemon (~1.19.4)
  - Bower (~1.8.8)
  - Gulp (~3.9.1)
  - Laravel-Elixir (6.0.0-18)
- Other uses: 
  - **.bowerrc** file: *This file contains the path to wich folder to "Copy" or "Install" when downloading dependencies from GIT BASH*
  - **bower.json** file: *Packages and dependencies with version numbers are defined by a manifest file bower.json. **(Package Example: jquery": "~3.4)***
  - **package.json** file: *Lists the packages your project depends on and specifies versions of a package that your project can use using semantic versioning rules*
  - **gulpfile.js** file: *gulpfile.js combines the SCSS styles defined in Gulp with application dependency packages (JS dependencies). Mixed files are placed in the specified path.*

### Installation/ Configuration:

1. Restore necessary **node_modules**, so run the following command in **GIT Bash Console** in the application root directory

   ```
   - npm install
   ```

2. Restore necessary application packages and dependencies, so run the following command in **GIT Bash Console** in the application root directory

   ```
   - bower install
   ```
   
3. Restore necessary **CSS** and **JS** public files under **public/assets** folder, so run the following command in **GIT Bash Console** in the application root directory

   ```
   - gulp
   ```

4. Start the application server side, so run the following command in **GIT Bash Console** in the application root directory

   ```
   - nodemon app/server.js
   ``` 

5. If the nodemon bach command not found, run the following command in **GIT Bash Console** in the application root directory

   ```
   - npm install -g nodemon
   ```  

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
