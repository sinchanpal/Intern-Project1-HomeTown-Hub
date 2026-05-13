import Community from "../models/communityModel.js";
import Post from "../models/postModel.js";


//?Create a new post inside a community
export const createPost = async (req, res) => {
    try {
        const { communityId } = req.params; // We will pass this in the URL
        const { content, mediaType, media, isPinned } = req.body;
        const userId = req.userId; // From isAuth middleware

        // Basic validation
        if (!content) {
            return res.status(400).json({ message: "Post content is required." });
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
        if (isPinned) {
            if (community.moderators.includes(userId)) {
                finalIsPinned = true; // Approve the pin!
            } else {
                // If a normal user tries to hack the frontend to send isPinned: true, ignore it.
                console.log("Unauthorized pin attempt blocked.");
            }
        }

        // Create the post
        const newPost = await Post.create({
            author: userId,
            community: communityId,
            content,
            mediaType: mediaType || "none",
            media: media || "",
            isPinned: finalIsPinned
        });

        // We use .populate() immediately so we can return the author's name to the frontend
        await newPost.populate("author", "name profilePicture");

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
            .sort({ isPinned: -1, createdAt: -1 }); // -1 means descending. Pinned posts first, then newest first!

        return res.status(200).json({
            message: "Posts fetched successfully",
            posts
        });

    } catch (error) {
        return res.status(500).json({ message: "Error fetching posts", error: error.message });
    }
};