import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },
        reason: {
            type: String,
            required: true,
            enum: ["Spam", "Harassment", "Inappropriate Content", "Other"]
        },
        status: {
            type: String,
            enum: ["Pending", "Resolved", "Dismissed"],
            default: "Pending"
        }
    },
    { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;