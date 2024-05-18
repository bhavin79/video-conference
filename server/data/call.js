import { validEmail, validUUID } from "../utils/validatiton.js";
import { users } from "../config/mongoCollections.js";
import { findOneAndUpdate, getOne } from "./dbAbstraction.js";
import { ObjectId } from "mongodb";
import { getRedisClient } from "../config/redisConnect.js";

/**
 * Add current call information - unique id (meet id) and other user's email id
 * @param {ObjectId} userId
 * @param {email} calleeEmailId
 * @param {UUID} meetId
 * @returns updated user document
 */
export const addCurrentCallInfo = async (userId, calleeEmailId, meetId) => {
  //Validation
  calleeEmailId = validEmail(calleeEmailId);
  meetId = validUUID(meetId);
  let user = await getOne(users, { _id: new ObjectId(userId) });
  if (!user) {
    throw `Invalid user id`;
  }

  //Add unique Id and other user's email id
  let callAdd = await findOneAndUpdate(
    users,
    { _id: new ObjectId(userId) },
    {
      $set: {
        "currentCalll.CallTo": calleeEmailId,
        "currentCalll.meetId": meetId,
      },
    }
  );

  //Add cache
  let redisClient = await getRedisClient();
  await redisClient.set(callAdd.value.emailId, meetId);

  return callAdd;
};

/**
 * Remove current call information - unique id (meet id) and other user's email id
 * @param {ObjectId} userId
 * @returns updated user document
 */

export const removeCurrentCallInfo = async (userId) => {
  // Validation
  let user = await getOne(users, { _id: new ObjectId(userId) });
  if (!user) {
    throw `Invalid user id`;
  }
  //Remove unique Id and other user's email id
  let removeCall = await findOneAndUpdate(
    users,
    { _id: new ObjectId(userId) },
    { $set: { "currentCalll.CallTo": "", "currentCalll.meetId": "" } }
  );

  let redisClient = await getRedisClient();
  await redisClient.DEL(`${user.emailId}`);

  return removeCall;
};

/**
 * Insert call information in history (call log)
 * @param {ObjectId} userId
 * @param {emailId} calleeEmailId
 * @param {boolean} Accpeted
 * @returns updated call log
 */

export const addCallHistory = async (userId, calleeEmailId, Accpeted) => {
  // calleeEmailId=  validEmail(calleeEmailId);
  let currDate = new Date();
  console.log(currDate);
  let updateCallHistory = await findOneAndUpdate(
    users,
    { _id: new ObjectId(userId) },
    {
      $push: {
        PreviousCalls: {
          calleeEmailId: calleeEmailId,
          Accpeted: Accpeted,
          Timestamp: currDate,
        },
      },
    }
  );
  return updateCallHistory;
};

/**
 * Fetch history (call log) from given user
 * @param {emailId} emailId
 * @returns history (call log)
 */
export const getHistoryByEmailId = async (emailId) => {
  let user = await getOne(users, { emailId: emailId });
  let calls = [];
  let total = user.PreviousCalls.length - 1;
  for (let i = total; i > total - 10 && i >= 0; i--) {
    calls.push(user.PreviousCalls[i]);
  }
  return calls;
};
