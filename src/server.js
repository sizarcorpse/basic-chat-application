const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const socketio = require("socket.io");
const http = require("http");
require("dotenv").config();

const middlewares = require("./middlewares/middlewares");

const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
} = require("./api/routes/room/room");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const bodyParser = require("body-parser");
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    // eslint-disable-next-line comma-dangle
    credentials: true,
  })
);

mongoose.connect(
  process.env.MONGODB_URI,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => console.log("connected to mongoDB")
);

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

const authRoute = require("./api/routes/user/Authentication");
app.use("/api/user", authRoute);

app.get("/", (req, res) => {
  res.json({
    message: "Basic Chat Application w/ Node  | Socket.io | React | MongoDB ",
  });
});

io.on("connection", (socket) => {
  //this socket - is a instance of a client

  console.log(socket.id);

  //1️⃣✅when someone join the connection
  socket.on("join", async ({ name, room }, callback) => {
    const { error, user } = await addUser({ id: socket.id, name, room });
    if (error) {
      console.log("error error error!!!!!!!!!!!!!!!!!!!!!!");
      return callback(error);
    } else {
      //📌 bot text
      socket.emit("message", {
        // this socket.emit = we emitted event from backend to frondend
        user: "admin",
        text: `${user.username}, welcome to the room ${user.rooms}`,
      });
      socket.broadcast.to(user.rooms).emit("message", {
        user: "admin",
        text: `${user.username}, has joined !`,
      });

      socket.join(room);

      //📌 room data
      io.to(user.rooms).emit("roomData", {
        room: user.rooms,
        users: await getUsersInRoom(user.rooms),
      });

      callback();
    }
  });

  //3️⃣💌 sending chat message into the room
  socket.on("sendMessage", async (message, callback) => {
    // this socket.on = we expect an event in backend from frontend

    //📌 getting user nad his message from frontend and emit them
    const { username, rooms } = await getUser({ id: socket.id });

    if (username && rooms) {
      console.log({ username, rooms });

      io.to(rooms).emit("message", {
        ruser: username,
        text: message,
        profilePhoto: `http://localhost:8000/api/user/${username}/profile`,
      });
    }

    callback();
  });

  //2️⃣❎when someone left the connection
  socket.on("disconnect", async () => {
    const user = await removeUser({ id: socket.id });

    if (user) {
      io.to(user.rooms).emit("message", {
        user: "admin",
        text: `${user.username} has left the chat`,
      });
      //📌 room data
      io.to(user.rooms).emit("roomData", {
        room: user.room,
        users: await getUsersInRoom(user.rooms),
      });
    }
  });
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const port = process.env.PORT || 3333;
server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
