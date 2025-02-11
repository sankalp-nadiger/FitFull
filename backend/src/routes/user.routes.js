import { registerUser, loginUser } from "../controllers/user.controller.js";
import  express from 'express'
const router = express.Router();
router.post("/register",registerUser)
router.post("/login",loginUser)

export default router