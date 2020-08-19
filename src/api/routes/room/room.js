const express = require("express");
const User = require("../../../models/User");
const addUser = async ({ id, name, room }) => {
  const user = await User.findOne({ username: name });

  if (user) {
    user.rooms = room;
    user.socketID.push(id);
    await user.save();

    return { user: user };
  } else {
    return { error: "no user" };
  }
};

const removeUser = async ({ id }) => {
  // const index = users.findIndex((user) => user.id === id);

  // if (index !== -1) {
  //   return users.splice(index, 1)[0];
  // }

  const user = await User.findOne({ socketID: { $in: [id] } });
  if (user) {
    user.socketID = [];
    user.rooms = "";
    await user.save();
    return user;
  }
};

const getUser = async ({ id }) => {
  const user = await User.findOne({
    socketID: { $in: [id] },
  });

  return {
    username: user.username,
    rooms: user.rooms,
    profilePhoto: user.profilePhoto,
  };
};

const getUsersInRoom = async (room) => {
  const users = [];

  const uxs = await User.find({ rooms: room });
  uxs.forEach((user) => {
    users.push({
      username: user.username,
      profilePhoto: `http://localhost:8000/api/user/${user.username}/profile`,
    });
  });

  return users;
};

module.exports = { addUser, getUser, getUsersInRoom, removeUser };
