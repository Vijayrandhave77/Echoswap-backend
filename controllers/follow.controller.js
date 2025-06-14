const Follow = require("../models/follow.schema");
const Notification = require("../models/chatModel/notification.schema");
const { getReceiverSocketId, io } = require("../chat/socket.js");
const followUser = async (req, res) => {
  const followerId = req.user.id;
  const { followingId } = req.body;

  if (followerId.toString() === followingId) {
    return res.status(400).json({ error: "You can't follow yourself" });
  }

  try {
    const exist = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    if (!exist) {
      const follow = await Follow.create({
        follower: followerId,
        following: followingId,
      });

      const notifi = await Notification.create({
        senderId: followerId,
        reciverId: followingId,
        type: "follow",
      });

      const populatedNotification = await Notification.findById(notifi._id)
        .populate("senderId", "name picture")
        .populate("reciverId", "name picture");
      const receiverSocketId = getReceiverSocketId(followingId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("getNotification", {
          notification: populatedNotification,
        });
      }

      return res.status(200).json({
        message: "Followed successfully",
        follow,
      });
    } else {
      await Follow.findOneAndDelete({
        follower: followerId,
        following: followingId,
      });
      return res.status(200).json({ message: "Unfollowed successfully" });
    }
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Already following" });
    }
    console.error("Follow error:", err);
    return res.status(500).json({ error: "Failed to follow/unfollow" });
  }
};

const getFollowFollowing = async (req, res) => {
  try {
    const followerCount = await Follow.find({
      following: req.user.id,
    });
    const followingCount = await Follow.find({
      follower: req.user.id,
    });

    res.status(200).json({
      message: "Follower and following counts fetched successfully",
      data: { followerCount, followingCount },
    });
  } catch (error) {
    console.error("Error fetching follow counts:", error);
    res.status(500).json({ error: "Failed to fetch follow counts" });
  }
};

module.exports = { followUser, getFollowFollowing };
