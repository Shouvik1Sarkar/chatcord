/** IMPORT REDIS **/
// import { connectRedis, subscribeToChat, publishChat } from "./redis_connect.js";
import {
  connectRedis,
  subscribeToChat,
  publishChat,
  subscribeToUserEvents,
  publishUserEvent,
} from "./redis_connect.js";
/******************/

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

  socket.on("join-server", async (userName) => {
    const user = {
      userName,
      id: socket.id,
    };

    users.push(user);

    // io.emit("User joined", { user, users });
    await publishUserEvent({
      type: "user-joined",
      user,
    });
  });

  //   socket.on("join-room", (roomName, cb) => {
  socket.on("join-room", async (roomName) => {
    socket.join(roomName);
    // cb(channels[roomName]);
    // io.to(roomName).emit("join-room", roomName);

    await publishUserEvent({
      type: "join-room",
      roomName,
    });
  });

  // socket.on("send-message", ({ content, to, sender, chatName, isChannel }) => {
  //   if (isChannel) {
  //     const payload = {
  //       content,
  //       chatName,
  //       sender,
  //     };

  //     io.to(to).emit("new message", payload);
  //   } else {
  //     const payload = {
  //       content,
  //       chatName: sender,
  //       sender,
  //     };

  //     socket.emit("recieve message", payload);
  //     io.to(to).emit("new message", payload);
  //   }

  //   if (channels[chatName]) {
  //     channels[chatName].push({ sender, content });
  //   }
  // });

  socket.on(
    "send-message",
    async ({ content, to, sender, chatName, isChannel }) => {
      const payload = {
        content,
        to,
        chatName,
        sender,
        isChannel,
      };

      console.log(`SERVER ${PORT} PUBLISHING:`, payload);

      await publishChat(payload);
    },
  );

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

await connectRedis();

await subscribeToUserEvents((message) => {
  const event = JSON.parse(message);

  if (event.type === "user-joined") {
    const alreadyExists = users.some((user) => user.id === event.user.id);

    if (!alreadyExists) {
      users.push(event.user);
    }

    io.emit("User joined", {
      user: event.user,
      users,
    });
  }
});

await subscribeToUserEvents((message) => {
  const event = JSON.parse(message);

  if (event.type === "join-room") {
    // const alreadyExists = users.some((user) => user.id === event.user.id);

    // if (!alreadyExists) {
    //   users.push(event.user);
    // }

    const roomName = event.roomName;
    io.to(roomName).emit("join-room", roomName);
    // io.emit("join-room", roomName);
  }
});

await subscribeToChat((message) => {
  const payload = JSON.parse(message);

  console.log(`REDIS MESSAGE RECEIVED ON SERVER ${PORT}:`, payload);

  // Send the message to clients connected to THIS server
  io.to(payload.to).emit("new message", payload);
});

server.listen(PORT, () => console.log("SERVER RUNNING AT PORT: ", PORT));
