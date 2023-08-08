import session from "express-session";

const sessionMiddleware =session({
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