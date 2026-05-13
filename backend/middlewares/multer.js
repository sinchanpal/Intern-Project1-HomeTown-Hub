import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // IMPORTANT: Make sure a folder named "public" actually exists 
        // in the root of backend directory!
        cb(null, "./public");
    },
    filename: (req, file, cb) => {
        // Adds a timestamp to make the filename 100% unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

export const upload = multer({ storage: storage });