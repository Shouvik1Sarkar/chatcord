# Socket.IO Real-Time Chat

A basic real-time chat application built with **Node.js, Express, Socket.IO, HTML, CSS, and JavaScript**.

This project was built as a learning project to understand how real-time communication works with Socket.IO, particularly **events, rooms, broadcasting, private messaging, and message history**.

---

## 🚀 Features

- Real-time communication using Socket.IO
- Join the chat server with a username
- Display currently connected users
- Join different chat channels
- Channel-based messaging using Socket.IO rooms
- Private messaging between users
- Channel message history
- Join-channel confirmation popup
- Real-time join notifications
- Simple retro/terminal-inspired chat interface
- Automatic message display for new incoming messages

---

## 🛠️ Tech Stack

### Backend

- Node.js
- Express.js
- Socket.IO

### Frontend

- HTML
- CSS
- Vanilla JavaScript

### Concepts Practiced

- WebSockets
- Socket.IO events
- Socket.IO rooms
- `socket.join()`
- `socket.to()`
- `io.to()`
- `io.emit()`
- Client ↔ Server communication
- Broadcasting
- Private messaging
- Managing connected users
- Maintaining channel state
- Sending chat history to clients

---

## 📁 Project Structure

```text
socket-chat/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── package.json
├── package-lock.json
└── server.js