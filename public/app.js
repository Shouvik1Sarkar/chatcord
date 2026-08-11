let socket = io();
const message_input_form = document.getElementById("message-form");
const messages = document.getElementById("messages");
const message_input = document.getElementById("message-input");

// User name inputs

const form = document.getElementById("join-form");
const userNameBox = document.getElementById("username-input");
// Notification
const notificationContainer = document.getElementById("notification-container");

// sideo bar
const all_users = document.getElementById("user-list");

const channels = document.querySelectorAll(".channel");

// current channel

const current_room = document.getElementById("current-room");
console.log("channels", channels);

//lll

const joinPopup = document.getElementById("join-popup");

const joinMessage = document.getElementById("join-message");

const cancelJoin = document.getElementById("cancel-join");

const confirmJoin = document.getElementById("confirm-join");

const chat_box = document.getElementById("messages");

const channels_record = {};
const x = { id: "iddd" };
let sender = "";
// console.log("=====", channels_record[String(socket.id)]);
// channels_record[String(socket.id)] = [String(x.id)];
// console.log("=====>>>>>", channels_record[String(socket.id)]);
let to = "";
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = userNameBox.value.trim();
  sender = username;
  socket.emit("join-server", username);
  userNameBox.value = "";
});

socket.on("User joined", (msg) => {
  const notification = document.createElement("div");

  notification.classList.add("notification");

  notification.innerText = `User: ${msg.user.userName} joined the server`;

  notificationContainer.append(notification);
  all_users.innerHTML = "";
  msg.users.map((e) => {
    const li = document.createElement("li");

    li.id = e.id;
    li.innerText = e.userName;
    all_users.append(li);

    // li.addEventListener("click", () => {
    //   to = li.id;
    // });
  });

  setTimeout(() => {
    notification.remove();
  }, 3000);
});

// channels.forEach((channel) => {
//   console.log("channels", channel);
//   channel.addEventListener("click", () => {
//     console.log("joined");

//     socket.emit("join-room", channel.id);
//     current_room.innerText = channel.id;
//   });
// });

let selectedChannel = null;

let isChannel = false;
let chatName = "";

channels.forEach((channel) => {
  channel.addEventListener("click", () => {
    if (channels_record[String(socket.id)]?.includes(channel.id)) {
      isChannel = true;
      chatName = channel.id;
      to = channel.id;

      chat_box.innerText = "";

      channel.forEach;

      socket.emit("get-channel-history", channel.id); // channel.id = channel_name

      console.log("already exists");
    } else {
      selectedChannel = channel.id;

      joinMessage.innerText = `Do you want to join #${channel.id}?`;

      joinPopup.classList.remove("hidden");
      if (channels_record[String(socket.id)]) {
        channels_record[String(socket.id)].push(channel.id);
      } else {
        channels_record[String(socket.id)] = [channel.id];
      }
      // channels_record[socket.id].push(channel.id);
    }
  });
});

confirmJoin.addEventListener("click", () => {
  socket.emit("join-room", selectedChannel);

  current_room.innerText = selectedChannel;

  joinPopup.classList.add("hidden");
});

cancelJoin.addEventListener("click", () => {
  selectedChannel = null;

  joinPopup.classList.add("hidden");
});

socket.on("join-room", (msg) => {
  const notification = document.createElement("div");

  notification.classList.add("notification");

  notification.innerText = `User joined the channel`;

  notificationContainer.append(notification);
  setTimeout(() => {
    notification.remove();
  }, 3000);
});

/********* Message *********/

all_users.addEventListener("click", (e) => {
  console.log("aLL USERS", all_users);
  const li = e.target.closest("li");
  current_room.innerText = li.innerText;
  to = li.id;
});

let content = "";

socket.on("get-channel-history", (chathistory) => {
  // console.log("history", chathistory);
  // chathistory.map((e) => console.log(e));
  chat_box.innerText = "";
  chathistory.forEach((chat) => {
    const p = document.createElement("p");
    p.innerText = `${chat.sender}: ${chat.content}`;
    chat_box.append(p);
  });
});

message_input_form.addEventListener("submit", (e) => {
  e.preventDefault();

  content = message_input.value;
  console.log("content-> ", content);
  console.log("to-> ", to);
  console.log("sender-> ", sender);

  socket.emit("send-message", { content, to, sender, chatName, isChannel });
  message_input.value = "";
});
socket.on("new message", (msg) => {
  const p = document.createElement("p");
  console.log("sender => ", msg.sender);

  console.log("socket", socket.id == to);
  current_room.innerText = msg.chatName;
  p.classList.add("chat-message");
  p.innerText = `${msg.sender}:   ${msg.content}`;

  chat_box.append(p);
});
socket.on("recieve message", (msg) => {
  const p = document.createElement("p");
  console.log("sender => ", msg.sender);

  console.log("socket", socket.id == to);

  p.classList.add("chat-message");
  p.innerText = `${msg.sender}:   ${msg.content}`;

  chat_box.append(p);
});
