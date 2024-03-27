import { Router} from "express";
import { createMeet, joinMeet} from "../controllers/meets.js";
const router = Router();


router.route("/createMeet").post(createMeet); //creates room using uuid
router.route("/join").post(joinMeet); // joining the room
router.route("/ping").get(async(req, res)=>{
    req.io.to(req.session.user.meetId).emit("user:Present", {emailId:req.session.user.emailId});
    return res.send("");
}) 

export default router;
