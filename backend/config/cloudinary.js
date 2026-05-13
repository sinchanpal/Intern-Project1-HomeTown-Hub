import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Configure Cloudinary ONCE globally outside the function
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) return null;

        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto"
        });

        // Delete the file from local storage after successful upload
        fs.unlinkSync(filePath);

        return result.secure_url;

    } catch (error) {
        // Ensure the file is deleted from local storage even if there's an error
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.error('Error uploading to Cloudinary:', error);
        return null; // Return null so the controller knows it failed
    }
};