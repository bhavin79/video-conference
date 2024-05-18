import { v4 as uuidV4 } from "uuid";
import {
  addCallHistory,
  addCurrentCallInfo,
  removeCurrentCallInfo,
  getHistoryByEmailId,
} from "../data/call.js";
import { validEmail } from "../utils/validatiton.js";
import { getUser } from "../data/users.js";
import { getRedisClient } from "../config/redisConnect.js";

/*
 * Generates unique Id for the call and notify other user about the call.
 * Requires session object for calling this function.
 * Requires emailId of the other user.
 */

export const call = async (req, res) => {
  //  check if the user is logged in; // move to middleware;
  if (!req.session.user || !req.session.user.emailId) {
    return res.status(403).json({ msg: "Please log in" });
  }

  const { emailId } = req.body;

  //1. generate Unique Id
  const meetId = uuidV4();

  try {
    //2. Add the Id in database.
    let callAdd = await addCurrentCallInfo(
      req.session.user.id,
      emailId,
      meetId
    );
    console.log(callAdd);
    //3. Notify the other user.
    if (callAdd) {
      req.io.to(emailId).emit("call", { emailId: callAdd.value.emailId });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }

  return res.status(200).json({ meetId });
};

/*
 * Accept the call i.e. add the unique Id in the database and update the call history of both the users.
 * Requires session object for calling this function.
 * Requires emailId of the other user.
 */
export const callAccept = async (req, res) => {
  //move to middleware;
  if (!req.session.user || !req.session.user.emailId) {
    return res.status(403).json({ msg: "Please log in" });
  }

  const { emailId } = req.body;

  //1. Check if other user exists
  let callee;
  try {
    callee = await getUser(emailId);
  } catch (error) {
    return res.status(404).json(error);
  }

  //2. Add unique Id in database
  let callAdd = undefined;
  try {
    callAdd = await addCurrentCallInfo(
      req.session.user.id,
      emailId,
      callee.currentCalll.meetId
    );
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }

  //3. Add this entry in Call History for both the users
  try {
    // User's history
    await addCallHistory(req.session.user.id, emailId, true);

    // Other user's histroy
    await addCallHistory(callee._id, callAdd.value.emailId, true);
  } catch (error) {
    return res.status(400).json(error);
  }

  return res.status(200).json({ meetId: callee.currentCalll.meetId });
};

/*
 * End Call and notify other user to end the call as well.
 * Requires session object for calling this function.
 * Requires emailId of the other user.
 */
export const callEnd = async (req, res) => {
  if (!req.session.user || !req.session.user.emailId) {
    return res.status(403).json({ msg: "Please log in" });
  }
  let user = undefined;
  try {
    // 1.Get the user
    user = await getUser(req.session.user.emailId);

    // 2. Remove unique ID for current call
    await removeCurrentCallInfo(req.session.user.id);
  } catch (error) {
    return res.status(400).json(error);
  }

  //3. notify the other user
  if (user && user.currentCalll.CallTo) {
    console.log("second Get", user.currentCalll.CallTo);
    let otherUser = await getUser(user.currentCalll.CallTo);

    //To make sure only valid calls are cut.
    if (
      otherUser.currentCalll.CallTo == user.emailId ||
      otherUser.currentCalll.CallTo == ""
    ) {
      req.io
        .to(user.currentCalll.CallTo)
        .emit("callEnd:receive", { msg: "call end" });
    }
  }
  res.status(200).json({ msg: "Call Ended" });
};

export const callReject = async (req, res) => {};

/*
 * Fetches the history (call log)
 * Requires session object for calling this function.
 */
export const getHistory = async (req, res) => {
  //move to middleware
  if (!req.session.user || !req.session.user.emailId) {
    return res.status(403).json({ msg: "Please log in" });
  }

  //Fetch call logs
  try {
    let history = await getHistoryByEmailId(req.session.user.emailId);
    res.status(200).json(history);
  } catch (error) {
    return res.status(400).json(error);
  }
};
