import Community from "../models/communityModel.js";
import Post from "../models/postModel.js";
import { uploadOnCloudinary } from "../config/cloudinary.js"
import Notification from "../models/notificationModel.js";
import { userSocketMap } from "../index.js";
import User from "../models/userModel.js";
import Report from "../models/reportModel.js";


//?Create a new post inside a community (Now with Media Upload Support)
export const createPost = async (req, res) => {
    try {
        const { communityId } = req.params;

        const { content, isPinned } = req.body;
        const userId = req.userId;

        // Basic validation If there is no text AND no file attached, block the post.
        if (!content && !req.file) {
            return res.status(400).json({ message: "You must provide either text or a media file to post." });
        }

        // Find the community
        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ message: "Community not found." });
        }

        // Security Check 1: User MUST be a member to post
        if (!community.members.includes(userId)) {
            return res.status(403).json({ message: "You must join this community to post." });
        }

        // Security Check 2: Pandit Superpowers (Only moderators can pin posts)
        let finalIsPinned = false;
        // Check if isPinned is explicitly true or the string "true"
        if (isPinned === true || isPinned === 'true') {
            if (community.moderators.includes(userId)) {
                finalIsPinned = true;
            } else {
                console.log("Unauthorized pin attempt blocked.");
            }
        }

        // ---MEDIA UPLOAD LOGIC ---
        let mediaUrl = "";
        let detectedMediaType = "none";

        if (req.file) {
            const localFilePath = req.file.path;
            const uploadedMedia = await uploadOnCloudinary(localFilePath);

            if (!uploadedMedia) {
                return res.status(500).json({ message: "Failed to upload media to cloud." });
            }

            mediaUrl = uploadedMedia;

            // Auto-detect if it's an image or a video based on the mimetype Multer gives us
            if (req.file.mimetype.startsWith("video/")) {
                detectedMediaType = "video";
            } else if (req.file.mimetype.startsWith("image/")) {
                detectedMediaType = "image";
            }
        }

        // Create the post
        const newPost = await Post.create({
            author: userId,
            community: communityId,
            content,
            mediaType: detectedMediaType, // Set automatically!
            media: mediaUrl,              // Cloudinary URL!
            isPinned: finalIsPinned
        });

        // Populate author data before sending to frontend
        await newPost.populate("author", "name profilePicture");

        // ==========================================
        // NOTIFICATION LOGIC START
        // ==========================================
        const io = req.app.get("io");

        // Notify all members of the community EXCEPT the author of the post
        const notificationPromises = community.members.map(async (memberId) => {
            if (memberId.toString() !== userId.toString()) {
                const newNotif = await Notification.create({
                    recipient: memberId,
                    sender: userId,
                    type: "NEW_POST",
                    community: communityId,
                    post: newPost._id,
                    message: `${newPost.author.name} shared a new post in ${community.name}.`
                });

                // If this specific member is online, send it to them instantly!
                const targetSocketId = userSocketMap[memberId.toString()];
                if (targetSocketId) {
                    io.to(targetSocketId).emit("newNotification", newNotif);
                    io.to(targetSocketId).emit("newPost", newPost); //send the new post itself so it can appear in real-time on their feed if they're viewing the community
                }
            }
        });

        // Wait for all notifications to finish saving
        await Promise.all(notificationPromises);
        // ==========================================

        return res.status(201).json({
            message: "Post created successfully",
            post: newPost
        });

    } catch (error) {
        return res.status(500).json({ message: "Error creating post", error: error.message });
    }
};

//? Fetch all posts for a specific community
export const getCommunityPosts = async (req, res) => {
    try {
        const { communityId } = req.params;

        // Fetch posts, populate the author details, and sort them!
        const posts = await Post.find({ community: communityId })
            .populate("author", "name profilePicture") // Grabs the User's name and photo using their ID
            .populate("comments.author", "name profilePicture")
            .sort({ isPinned: -1, createdAt: -1 }); // -1 means descending. Pinned posts first, then newest first!

        return res.status(200).json({
            message: "Posts fetched successfully",
            posts
        });

    } catch (error) {
        return res.status(500).json({ message: "Error fetching posts", error: error.message });
    }
};


//? Delete a post (Author or Moderator only)
export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.userId;

        // 1. Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        // 2. Find the community this post belongs to
        const community = await Community.findById(post.community);
        if (!community) {
            return res.status(404).json({ message: "Community not found." });
        }

        // 3. SECURITY CHECK: Is the user the Author OR a Moderator (Pandit)?
        const isAuthor = post.author.toString() === userId.toString();
        const isModerator = community.moderators.includes(userId);

        if (!isAuthor && !isModerator) {
            return res.status(403).json({
                message: "Access denied. You can only delete your own posts unless you are a community moderator."
            });
        }



        // 4. Delete the post from MongoDB
        await Post.findByIdAndDelete(postId);

        return res.status(200).json({ message: "Post deleted successfully." });

    } catch (error) {
        return res.status(500).json({
            message: "Error deleting post",
            error: error.message
        });
    }
};

//? Toggle Like on a Post
export const toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.userId; // From isAuth middleware

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        // Check if the user's ID is already in the likes array
        const hasLiked = post.likes.includes(userId);

        if (hasLiked) {
            // Unlike: Remove user ID from array
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        } else {
            // Like: Add user ID to array
            post.likes.push(userId);
        }

        await post.save();

        // ==========================================
        //  NOTIFICATION LOGIC START
        // ==========================================

        // ONLY send a notification if they LIKED the post (not unliked)
        // AND make sure the liker is NOT the author of the post (don't notify yourself)
        if (!hasLiked && post.author.toString() !== userId.toString()) {

            // 1. Get the liker's name
            const sender = await User.findById(userId).select("name");

            // 2. Create the notification in the database
            const newNotif = await Notification.create({
                recipient: post.author, // The creator of the post
                sender: userId,         // The person who clicked like
                type: "LIKE",
                community: post.community, // This helps the frontend navigate on click
                post: post._id,
                message: `${sender.name} liked your post.`
            });

            // 3. Send it via WebSockets if the author is online
            const io = req.app.get("io");
            const targetSocketId = userSocketMap[post.author.toString()];

            if (targetSocketId) {
                io.to(targetSocketId).emit("newNotification", newNotif);
            }
        }

        // ==========================================


        return res.status(200).json({
            message: hasLiked ? "Post unliked" : "Post liked",
            likes: post.likes // Send back the updated likes array
        });

    } catch (error) {
        return res.status(500).json({ message: "Error toggling like", error: error.message });
    }
};

//? Add a Comment to a Post
export const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { message } = req.body;
        const userId = req.userId;

        if (!message || message.trim() === "") {
            return res.status(400).json({ message: "Comment message is required." });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        // Create the new comment object
        const newComment = {
            author: userId,
            message: message.trim()
        };

        // Push it into the post's comments array
        post.comments.push(newComment);
        await post.save();

        // To show the new comment instantly on the frontend with the user's name and picture, 
        // we need to populate the author of the comments.
        await post.populate("comments.author", "name profilePicture");

        // ==========================================
        // NOTIFICATION LOGIC START
        // ==========================================

        // ONLY send a notification if the commenter is NOT the author of the post
        if (post.author.toString() !== userId.toString()) {

            // 1. Get the commenter's name
            const sender = await User.findById(userId).select("name");

            // Create a short preview of the comment (max 20 characters)
            const commentPreview = message.length > 20 ? message.substring(0, 20) + "..." : message;

            // 2. Create the notification in the database
            const newNotif = await Notification.create({
                recipient: post.author, // The creator of the post
                sender: userId,         // The person who commented
                type: "COMMENT",
                community: post.community,
                post: post._id,
                message: `${sender.name} commented: "${commentPreview}"`
            });

            // 3. Send it via WebSockets if the author is online
            const io = req.app.get("io");
            const targetSocketId = userSocketMap[post.author.toString()];

            if (targetSocketId) {
                io.to(targetSocketId).emit("newNotification", newNotif);
            }
        }

        // ==========================================

        return res.status(201).json({
            message: "Comment added successfully",
            comments: post.comments // Send back the updated comments array
        });

    } catch (error) {
        return res.status(500).json({ message: "Error adding comment", error: error.message });
    }
};




//? Delete a comment (Author or Moderator only)
export const deleteComment = async (req, res) => {
    try {
        // We need both the post ID and the specific comment ID from the URL
        const { postId, commentId } = req.params;
        const userId = req.userId; // Securely from your isAuth middleware

        //  Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        //  Find the specific comment inside the post
        // Mongoose has a handy .id() method to find subdocuments in an array!
        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        // Find the community to check for Pandit (moderator) status
        const community = await Community.findById(post.community);
        if (!community) {
            return res.status(404).json({ message: "Community not found." });
        }

        // SECURITY CHECK (RBAC): Is the user the Author OR a Moderator?
        const isAuthor = comment.author.toString() === userId.toString();
        const isModerator = community.moderators.includes(userId);

        if (!isAuthor && !isModerator) {
            return res.status(403).json({
                message: "Access denied. You can only delete your own comments unless you are a community moderator."
            });
        }

        // Delete the comment by filtering it out of the array
        post.comments = post.comments.filter(c => c._id.toString() !== commentId);

        // Save the updated post
        await post.save();

        // Populate the author data before sending the fresh array back to the frontend
        await post.populate("comments.author", "name profilePicture");

        return res.status(200).json({
            message: "Comment deleted successfully.",
            comments: post.comments // Send the updated comments list back!
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error deleting comment",
            error: error.message
        });
    }
};



// User reports a post
export const reportPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { reason } = req.body;
        const userId = req.userId;

        // Prevent duplicate reports
        const existingReport = await Report.findOne({ reportedBy: userId, post: postId });
        if (existingReport) {
            return res.status(400).json({ message: "You have already reported this post." });
        }

        await Report.create({
            reportedBy: userId,
            post: postId,
            reason
        });

        return res.status(201).json({ message: "Post reported successfully. Admins will review it." });
    } catch (error) {
        return res.status(500).json({ message: "Error reporting post", error: error.message });
    }
};