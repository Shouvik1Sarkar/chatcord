/* =========================================================
   SOCKET
========================================================= */

let socket = io();

/* =========================================================
   DOM ELEMENTS
========================================================= */

// Message area
const message_input_form = document.getElementById("message-form");
const message_input = document.getElementById("message-input");
const chat_box = document.getElementById("messages");

// Username / server join
const form = document.getElementById("join-form");
const userNameBox = document.getElementById("username-input");

// Notifications
const notificationContainer = document.getElementById("notification-container");

// Users
const all_users = document.getElementById("user-list");

// Channels
const channels = document.querySelectorAll(".channel");

// Current room
const current_room = document.getElementById("current-room");

// Join channel popup
const joinPopup = document.getElementById("join-popup");
const joinMessage = document.getElementById("join-message");
const cancelJoin = document.getElementById("cancel-join");
const confirmJoin = document.getElementById("confirm-join");

/* =========================================================
   STATE
========================================================= */

const channels_record = {};

let sender = "";
let to = "";

let selectedChannel = null;

let isChannel = false;
let chatName = "";

let content = "";

/* =========================================================
   JOIN SERVER
========================================================= */

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = userNameBox.value.trim();

  sender = username;

  socket.emit("join-server", username);

  userNameBox.value = "";
});

/* =========================================================
   USER JOINED SERVER
========================================================= */

socket.on("User joined", (msg) => {
  // Create notification
  const notification = document.createElement("div");

  notification.classList.add("notification");

  notification.innerText = `User: ${msg.user.userName} joined the server`;

  notificationContainer.append(notification);

  // Update user list
  all_users.innerHTML = "";

  msg.users.map((e) => {
    const li = document.createElement("li");

    li.id = e.id;
    li.innerText = e.userName;

    all_users.append(li);
  });

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
});

/* =========================================================
   CHANNELS
========================================================= */

channels.forEach((channel) => {
  channel.addEventListener("click", () => {
    /*
      If the user has already joined this channel,
      directly open it instead of showing the popup.
    */

    if (channels_record[String(socket.id)]?.includes(channel.id)) {
      isChannel = true;

      chatName = channel.id;

      to = channel.id;

      /* ---------------------------------------------
         CHANGE ACTIVE CHANNEL
      --------------------------------------------- */

      channels.forEach((channel) => {
        channel.classList.remove("active");
      });

      channel.classList.add("active");

      /* ---------------------------------------------
         CLEAR CURRENT CHAT
      --------------------------------------------- */

      chat_box.innerText = "";

      /* ---------------------------------------------
         CHANGE CURRENT CHAT NAME
      --------------------------------------------- */
      current_room.innerText = channel.id;

      /* ---------------------------------------------
         GET CHANNEL HISTORY
      --------------------------------------------- */

      socket.emit("get-channel-history", channel.id);

      console.log("already exists");
    } else {
      /*
        User hasn't joined this channel yet.
        Show confirmation popup.
      */

      selectedChannel = channel.id;

      joinMessage.innerText = `Do you want to join #${channel.id}?`;

      joinPopup.classList.remove("hidden");

      /*
        Store channel in local record.
      */

      if (channels_record[String(socket.id)]) {
        channels_record[String(socket.id)].push(channel.id);
      } else {
        channels_record[String(socket.id)] = [channel.id];
      }
    }
  });
});

/* =========================================================
   CONFIRM JOIN CHANNEL
========================================================= */

confirmJoin.addEventListener("click", () => {
  socket.emit("join-room", selectedChannel);

  current_room.innerText = selectedChannel;

  /* ---------------------------------------------
     CHANGE ACTIVE CHANNEL
  --------------------------------------------- */

  channels.forEach((channel) => {
    channel.classList.remove("active");
  });

  const selectedElement = document.getElementById(selectedChannel);

  if (selectedElement) {
    selectedElement.classList.add("active");
  }

  /* ---------------------------------------------
     CHANNEL STATE
  --------------------------------------------- */

  isChannel = true;

  chatName = selectedChannel;

  to = selectedChannel;

  chat_box.innerText = "";

  /* ---------------------------------------------
     CLOSE POPUP
  --------------------------------------------- */

  joinPopup.classList.add("hidden");
});

/* =========================================================
   CANCEL JOIN CHANNEL
========================================================= */

cancelJoin.addEventListener("click", () => {
  selectedChannel = null;

  joinPopup.classList.add("hidden");
});

/* =========================================================
   USER JOINED CHANNEL
========================================================= */

socket.on("join-room", (msg) => {
  const notification = document.createElement("div");

  notification.classList.add("notification");

  notification.innerText = "User joined the channel";

  notificationContainer.append(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
});

/* =========================================================
   USER SELECTION / PRIVATE CHAT
========================================================= */

all_users.addEventListener("click", (e) => {
  const li = e.target.closest("li");

  if (!li) return;

  /* ---------------------------------------------
     Set private chat target
  --------------------------------------------- */

  current_room.innerText = li.innerText;

  to = li.id;

  chatName = li.innerText;

  isChannel = false;

  /* ---------------------------------------------
     Remove active channel highlight
  --------------------------------------------- */

  channels.forEach((channel) => {
    channel.classList.remove("active");
  });

  console.log("Private chat with:", chatName);
  console.log("Target socket:", to);
});

/* =========================================================
   GET CHANNEL HISTORY
========================================================= */

socket.on("get-channel-history", (chathistory) => {
  chat_box.innerText = "";
  chathistory.forEach((chat) => {
    const p = document.createElement("p");

    p.classList.add("chat-message");

    p.innerText = `${chat.sender}: ${chat.content}`;

    chat_box.append(p);
  });
});

/* =========================================================
   SEND MESSAGE
========================================================= */

message_input_form.addEventListener("submit", (e) => {
  e.preventDefault();

  content = message_input.value;

  console.log("content-> ", content);
  console.log("to-> ", to);
  console.log("sender-> ", sender);
  console.log("chatName-> ", chatName);
  console.log("isChannel-> ", isChannel);

  socket.emit("send-message", {
    content,
    to,
    sender,
    chatName,
    isChannel,
  });

  message_input.value = "";
});

/* =========================================================
   RECEIVE NEW MESSAGE
========================================================= */

socket.on("new message", (msg) => {
  const p = document.createElement("p");

  console.log("sender => ", msg.sender);

  console.log("socket", socket.id == to);

  current_room.innerText = msg.chatName;

  p.classList.add("chat-message");

  p.innerText = `${msg.sender}:   ${msg.content}`;

  chat_box.append(p);
});

/* =========================================================
   RECEIVE MESSAGE
========================================================= */

socket.on("recieve message", (msg) => {
  const p = document.createElement("p");

  console.log("sender => ", msg.sender);

  console.log("socket", socket.id == to);

  p.classList.add("chat-message");

  p.innerText = `${msg.sender}:   ${msg.content}`;

  chat_box.append(p);
});
