const Conversation = require("../../models/chatModel/convertation.schema.js");
const User = require("../../models/users.schema.js");
const { getReceiverSocketId, io } = require("../../chat/socket.js");
const Message = require("../../models/chatModel/message.schema.js");
const Notification = require("../../models/chatModel/notification.schema.js");

const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const reciverId = req.params.id;

    const { message } = req.body;

    let gotConversation = await Conversation.findOne({
      participants: { $all: [senderId, reciverId] },
    });

    if (!gotConversation) {
      gotConversation = await Conversation.create({
        participants: [senderId, reciverId],
      });
    }
    const newMessage = await Message.create({
      senderId,
      reciverId,
      message,
    });

    const notiFicationMessage = await Message.findOne({ _id: newMessage._id })
      .populate("senderId", "-password")
      .populate("reciverId", "-password");
    if (newMessage) {
      gotConversation.messages.push(newMessage._id);
    }

    await Promise.all([gotConversation.save(), newMessage.save()]);

    // SOCKET IO
    const receiverSocketId = getReceiverSocketId(reciverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", notiFicationMessage);
    }

    await Notification.create({
      senderId,
      reciverId,
      type: "message",
    });

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("getNotification", {
        senderId,
        type: "message",
        createdAt: new Date(),
      });
    }
    return res.status(201).json({ newMessage });
  } catch (error) {
    console.log(error);
  }
};
const getMessage = async (req, res) => {
  try {
    const reciverId = req.params.id;
    const senderId = req.user.id;
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, reciverId] },
    }).populate("messages");
    return res.status(200).json(conversation?.messages);
  } catch (error) {
    console.log(error);
  }
};

const getConversationUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // 1. Find all conversations of the user
    const conversations = await Conversation.find({
      participants: currentUserId,
    });

    // 2. Get all other participants (excluding current user)
    const otherUserIds = conversations.flatMap((conv) =>
      conv.participants.filter(
        (id) => id.toString() !== currentUserId.toString()
      )
    );

    // 3. Remove duplicate IDs
    const uniqueUserIds = [...new Set(otherUserIds.map((id) => id.toString()))];

    // 4. Fetch user details
    const users = await User.find({ _id: { $in: uniqueUserIds } }).select(
      "-password"
    ); // exclude password

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  sendMessage,
  getMessage,
  getConversationUsers,
};
