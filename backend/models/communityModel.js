import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true, // Prevents duplicate hubs like two "Midnapore Tech" groups
        },
        state: {
            type: String,
            required: true,
            trim: true,
            lowercase: true, // Ensures "West Bengal" and "west bengal" are treated the same
        },
        city: {
            type: String,
            required: true,
            trim: true,
            lowercase: true, // Ensures "Kolkata" and "kolkata" are treated the same
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500, // Keeps the description concise
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true, // The original Pandit who started the hub
        },
        moderators: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", // Allows for multiple Pandits to manage the group
            }
        ],
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", // The list of standard users in the digital neighborhood
            }
        ],
        pendingMembers: [  //  The waiting room for users requesting to join
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        coverImage: {
            type: String,
            default: "", // Space for a nice banner image of the city or village later
        },
        rules: [
            {
                type: String, // Array of strings so Pandits can set specific community guidelines
            }
        ],
    },
    {
        timestamps: true // Automatically generates 'createdAt' (satisfying your Data Requirements) and 'updatedAt'
    }
);

// Virtual field to dynamically calculate the member count without needing a separate database column
communitySchema.virtual('memberCount').get(function () {
    return this.members.length;
});

// Ensure virtual fields are included when converting the document to JSON
communitySchema.set('toJSON', { virtuals: true });
communitySchema.set('toObject', { virtuals: true });

const Community = mongoose.model("Community", communitySchema);

export default Community;