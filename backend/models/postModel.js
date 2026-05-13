import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
        required: true // A post MUST live inside a community!
    },
    content: {
        type: String,
        required: true, // Every post must have at least some text.
        trim: true
    },
    mediaType: {
        type: String,
        enum: ["image", "video", "none"], // Added "none" for text-only posts
        default: "none"
    },
    media: {
        type: String, // Made optional. Will contain the image/video URL if uploaded
        default: ""
    },
    isPinned: {
        type: Boolean,
        default: false // Pandits can flip this to true to pin announcements to the top
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    comments: [
        {
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            message: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now // know exactly when a comment was made!
            }
        }
    ]
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);
export default Post;