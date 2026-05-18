import Community from "../models/communityModel.js";
import User from "../models/userModel.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";

//? This controller handles the creation of a new community hub
export const createCommunity = async (req, res) => {
    try {
        const { name, state, city, description, rules } = req.body;
        const userId = req.userId; // We get this securely from your isAuth middleware!

        // 1. Basic Validation
        if (!name || !state || !city || !description) {
            return res.status(400).json({ message: "Name, state, city, and description are required." });
        }

        // 2. Check for Duplicates
        // We don't want two "Kolkata Tech" groups confusing people
        const existingCommunity = await Community.findOne({ name });
        if (existingCommunity) {
            return res.status(400).json({ message: "A community with this exact name already exists." });
        }

        // 3. Create the Community
        const newCommunity = await Community.create({
            name,
            state,
            city,
            description,
            rules: rules || [], // If they didn't provide rules, just use an empty array
            creator: userId,
            moderators: [userId], // The creator automatically becomes the first Pandit!
            members: [userId]     // The creator is automatically inside the group
        });

        // Return a 201 (Created) status with the new community data
        return res.status(201).json({
            message: "Community created successfully!",
            community: newCommunity
        });

    } catch (error) {
        return res.status(500).json({ message: "Error creating community", error: error.message });
    }
}


//? Fetch a single community by its ID
export const getSingleCommunity = async (req, res) => {
    try {
        const { id } = req.params;

        // We populate the moderators so we know who the Pandits are!
        const community = await Community.findById(id).populate("moderators", "name profilePicture");

        if (!community) {
            return res.status(404).json({ message: "Community not found" });
        }

        return res.status(200).json({
            message: "Community fetched successfully",
            community
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching community", error: error.message });
    }
};


//? This controller fetches all communities, prioritizing those in the user's location
export const getAllCommunities = async (req, res) => {
    try {
        // 1. Get the current logged-in user to find their location
        const currentUser = await User.findById(req.userId);

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const userCity = currentUser.city;
        const userState = currentUser.state;

        // 2. Fetch communities that EXACTLY match the user's city and state
        const localCommunities = await Community.find({
            city: userCity,
            state: userState
        }).sort({ createdAt: -1 });

        // 3. Fetch a few other communities to show the platform is active 
        // ($ne means "Not Equal", so we don't show their local ones twice)
        const exploreCommunities = await Community.find({
            $or: [
                { city: { $ne: userCity } },
                { state: { $ne: userState } }
            ]
        }).sort({ createdAt: -1 }).limit(10); // Limit to 10 so we don't overload the database

        // 4. Send both lists back to the frontend!
        return res.status(200).json({
            message: "Communities fetched successfully",
            localCommunities,
            exploreCommunities
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching communities",
            error: error.message
        });
    }
}


// This controller allows a user to join an existing community
export const joinCommunity = async (req, res) => {
    try {
        const communityId = req.params.id; // We will pass the ID in the URL
        const userId = req.userId; // Securely from isAuth

        // 1. Find the community
        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ message: "Community not found" });
        }

        // 2. Check if the user is already a member
        if (community.members.includes(userId)) {
            return res.status(400).json({ message: "You are already a member of this community" });
        }

        // 3. Add the user to the members array
        community.members.push(userId);
        await community.save();

        return res.status(200).json({
            message: "Successfully joined the community",
            community // Return the updated community
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error joining community",
            error: error.message
        });
    }
}



// Edit Community Details (Pandits Only)
export const editCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // We extract the text fields from the body
        const { name, description, rules } = req.body;

        // 1. Find the community
        const community = await Community.findById(id);
        if (!community) {
            return res.status(404).json({ message: "Community not found." });
        }

        // 2. SECURITY CHECK: Is this user a Pandit?
        if (!community.moderators.includes(userId)) {
            return res.status(403).json({ message: "Access denied. Only moderators can edit this community." });
        }

        // 3. Handle Image Upload ONLY if a new file was actually provided
        if (req.file) {
            const localFilePath = req.file.path;
            const coverImageUrl = await uploadOnCloudinary(localFilePath);

            if (!coverImageUrl) {
                return res.status(500).json({ message: "Failed to upload new cover image." });
            }
            community.coverImage = coverImageUrl; // Update the image url
        }

        // 4. Update the text fields (fallback to existing data if they left the input blank)
        if (name) community.name = name;
        if (description) community.description = description;

        // Note: FormData sends arrays/objects as strings, so we parse it if rules are provided
        if (rules) {
            try {
                // If the frontend sends JSON stringified rules, parse them
                community.rules = JSON.parse(rules);
            } catch (e) {
                // If the frontend just sends a comma-separated string, handle that too
                community.rules = rules.split(',').map(rule => rule.trim());
            }
        }

        // 5. Save the changes to the database
        await community.save();

        return res.status(200).json({
            message: "Community updated successfully!",
            community // Returning the fresh data so the frontend updates instantly
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error updating community",
            error: error.message
        });
    }
};



// Get all communities the user has joined
export const getMyHubs = async (req, res) => {
    try {
        const userId = req.userId; // From isAuth middleware

        // Find all communities where the user's ID is in the members array
        const myCommunities = await Community.find({ members: userId })
            .sort({ createdAt: -1 }); // Show newest first

        return res.status(200).json({ myCommunities });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching your hubs", error: error.message });
    }
};