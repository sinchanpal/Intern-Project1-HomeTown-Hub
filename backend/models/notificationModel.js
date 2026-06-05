import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    // 1. Who is receiving this notification?
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // 2. Who triggered this? (e.g., The person who liked the post)
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    // 3. What kind of notification is it?
    type: {
        type: String,
        enum: ["LIKE", "COMMENT", "JOIN_REQUEST", "REQUEST_APPROVED", "REQUEST_REJECTED", "NEW_POST", "NEW_EVENT"],
        required: true
    },
    // 4. Which community did this happen in? (Clicking it takes them to the hub)
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community"
    },
    // 5. Which post is involved? (Optional: Only used for likes/comments)
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    // 6. The actual text message to display (e.g., "Sinchan commented on your post")
    message: {
        type: String,
        required: true
    },
    // 7. Has the user seen it yet? (Controls the unread badge!)
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;