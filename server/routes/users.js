import { Router} from "express";
import { postLogin, postSignup, getLogout } from "../controllers/users.js";
const router = Router();


router.route("/login").post(postLogin);
router.route("/signup").post(postSignup);
router.route("/logout").get(getLogout);

export default router;
