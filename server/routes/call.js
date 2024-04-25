import { Router} from "express";
import { call, callAccept } from "../controllers/call.js";
const router = Router();


router.route("/call").post(call);
router.route("/callAccept").post(callAccept);

export default router; 
