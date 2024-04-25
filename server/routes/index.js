
import users from "./users.js"
import meets from "./meets.js";
import calls from "./call.js";

 const configRoutes =(app)=>{
    app.use("/user", users);
    app.use("/meeting", meets);
    app.use("/call", calls);
    app.use("*",async (req, res)=>{
        res.status(404).json({Error: "Page not found"});
    })
}

export default configRoutes;
