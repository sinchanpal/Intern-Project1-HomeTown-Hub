import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
    getDashboardStats,
    getAllUsers,
    deleteUser,
    deleteAdminCommunity,
    getAllAdminCommunities,
    getReports,
    handleReport
} from "../controllers/adminControllers.js";


const adminRouter = express.Router();

// SECURITY FIRST: 
// By putting these middlewares here, we protect EVERY route inside this file automatically!
adminRouter.use(isAuth, isAdmin);

// Dashboard Overview Data
adminRouter.get("/stats", getDashboardStats);

// User Management
adminRouter.get("/users", getAllUsers);
adminRouter.delete("/users/:id", deleteUser);

// Community Management
adminRouter.get("/communities", getAllAdminCommunities);
adminRouter.delete("/communities/:id", deleteAdminCommunity);

//Handel Reports
adminRouter.get("/reports", getReports);
adminRouter.put("/reports/:reportId", handleReport);

export default adminRouter;