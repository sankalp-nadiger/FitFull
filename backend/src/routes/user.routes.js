import { registerUser, loginUser } from "../controllers/user.controller.js";

router.post("/register",registerUser)
router.post("/login",loginUser)

export default router