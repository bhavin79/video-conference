import {getUser, addUser, newAddUser} from "../data/users.js"
import hash from "../utils/encryption.js";
import { validEmail, validPassword } from "../utils/validatiton.js";

export const postLogin = async(req, res)=>{  
    console.log("login route")
    console.log(req.body);             
    //validate the input
    let {emaildId: email, password} = req.body;

    try { 
        email = validEmail(email);
        password = validPassword(password); 
    } catch (error) {
        return res.status(400).json({msg:"Provide valid format for Email id or password"});
    }

 
    let user;
    //check if email exist
    try {
        user = await getUser(email);
    } catch (error) {
        return res.status(400).json({msg:"Email id or password is incorrect"});
    }
    //compare password
    const result = await hash.compareHash(password, user.password);
    if(!result){
        return res.status(400).json({msg:"Email id or password is incorrect"});
    }

    // set session
    req.session.user = {emailId:user.emailId, id: user._id};
    //send login success.
   return res.status(200).json({status: "login successful"});
}

export const postSignup = async(req, res)=>{
    //validate the input
    let {emaildId: email, password} = req.body;
    try {
        email = validEmail(email);
        password = validPassword(password);  
    } catch (error) {
        return res.status(400).json({msg:error});  
    }
    console.log(req.body);

    //fetch user
    try {
        //user exist. Throw error
        const user = await getUser(email);
        return res.status(400).json({msg:"This Email Id is already registered"});
    } catch (error) {
        
    }
    
    //Create user
    let createUser;
    try {
        createUser = await newAddUser(email, password); 
    } catch (error) {
       return res.status(500).json({msg:error});
    }

    return res.status(200).json({msg: "sign up successful"});
}

export const getLogout =(req, res)=>{
    //destroy session;
    req.session.destroy();
    return res.session(200).json({msg: "Successfully logouts"})
}

 