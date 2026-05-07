import jwt from 'jsonwebtoken';

// Function to generate a JWT token for a given user ID
const genToken = async (userId) => {
    try {
        const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: "1y" });
        return token;
    } catch (error) {
        return null;
    }
}

export default genToken;