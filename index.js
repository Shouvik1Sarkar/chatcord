import express from "express";
import { createServer } from "http";

import dotenv from "dotenv";

dotenv.config({ path: ".env" });

import { Server } from "socket.io";

const app = express();

const server = createServer(app);

const io = new Server(server);

const PORT = process.env.PORT;

app.use(express.static("./public"));

app.get("/", (req, res) => {
  return res.sendFile("/public/index.html");
});

const channels = {
  general: [],
  jokes: [],
  random: [],
  javascript: [],
};

let users = [];

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join-server", (userName) => {
    const user = {
      userName,
      id: socket.id,
    };

    users.push(user);

    io.emit(`User joined`, { user, users });
  });

  //   socket.on("join-room", (roomName, cb) => {
  socket.on("join-room", (roomName) => {
    socket.join(roomName);
    // cb(channels[roomName]);
    io.to(roomName).emit("join-room", roomName);
  });

  socket.on("send-message", ({ content, to, sender, chatName, isChannel }) => {
    if (isChannel) {
      const payload = {
        content,
        chatName,
        sender,
      };

      io.to(to).emit("new message", payload);
    } else {
      const payload = {
        content,
        chatName: sender,
        sender,
      };

      socket.emit("recieve message", payload);
      io.to(to).emit("new message", payload);
    }

    if (channels[chatName]) {
      channels[chatName].push({ sender, content });
    }
  });

  socket.on("get-channel-history", (channel_name) => {
    socket.emit("get-channel-history", channels[channel_name]);
  });

  socket.on("typing", ({ sender, to }) => {
    socket.to(to).emit("typing", `${sender} typing...`);
    socket.emit("typing-self", `Type a message...`);
  });

  socket.on("after", ({ m, to }) => {
    io.to(to).emit("after", m);
    socket.emit("after", m);
  });

  socket.on("disconnect", () => {
    users = users.filter((user) => user.id !== socket.id);

    console.log("user disconnected");
  });
});

server.listen(PORT, () => console.log("SERVER RUNNING AT PORT : ", PORT));
