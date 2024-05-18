import { Router } from "express";
import { call, callAccept, callEnd, getHistory } from "../controllers/call.js";
const router = Router();

router.route("/call").post(call);
router.route("/callAccept").post(callAccept);
router.route("/callEnd").get(callEnd);
router.route("/history").get(getHistory);

export default router;
