import session from "express-session";
import RedisStore from "connect-redis"
import { getRedisClient } from "../config/redisConnect.js";
const redisClient = await getRedisClient();
let redisStore = new RedisStore({
    client: redisClient,
  })
const sessionMiddleware =session({
    store: redisStore,
    name: 'AuthCookie',
    credentials:true, 
    secret: "ThefamousSecretOfWebPrograming#$",
    saveUninitialized: false,
    resave: false,
    cookie: { 
        maxAge: 6000000,
        sameSite: "lax"
    }
});
  
export default sessionMiddleware;