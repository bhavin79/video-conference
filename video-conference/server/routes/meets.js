import { Router} from "express";
import { createMeet, joinMeet} from "../controllers/meets.js";
const router = Router();


router.route("/createMeet").post(createMeet); //creates room using uuid
router.route("/join").post(joinMeet); // joining the room

export default router;
