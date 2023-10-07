
import users from "./users.js"
import meets from "./meets.js";

 const configRoutes =(app)=>{
    app.use("/user", users);
    app.use("/meeting", meets);
    app.use("*",async (req, res)=>{
        res.status(404).json({Error: "Page not found"});
    })
}

export default configRoutes;
