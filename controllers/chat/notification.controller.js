const Notification = require("../../models/chatModel/notification.schema");

const getUserNotification = async (req, res) => {
  try {
    const notifications = await Notification.find({
      reciverId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .populate("senderId", "name picture");

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

const readNotification = async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update notification." });
  }
};

module.exports = { getUserNotification, readNotification };
