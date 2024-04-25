import { version as uuidVersion } from 'uuid';
import { validate as uuidValidate } from 'uuid';

export const validString = (string, parameter = "input", maxLength=null) => {

    if (string === undefined || !string || typeof string !== "string")
        throw `${parameter} does not exist or is not a string`;

    string = string.trim();
    if (string.length == 0)
        throw `${parameter} cannot be an empty string or just spaces`;
    
    if(maxLength){
        if(string.length>maxLength){
            throw `${parameter} can be only ${maxLength} character long`
        }
    }
    return string;
};

export const validEmail =(email)=>{
    // email = validString(email, "email");
    // const regex = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
    
    // if(!regex.test(email)){
    //     throw `Valid email id needed ${email}`;
    // }
    return email.toLowerCase();
}

export const validPassword = (pass)=>{
    pass = validString(pass, "password",15);
    if(pass.length<8){
        throw `Password length should be a minimum of 8`;
    }
    let upperCase =/.*[A-Z].*/g; 
    let oneNumber = /.*[0-9].*/g;
    let oneSpecial =/[^a-zA-Z0-9\s]/g;
    let whiteSpace = /.*[\s].*/g
    if(pass.match(whiteSpace)){
        throw `Password should not contain any spaces`;
    }
    if(!pass.match(upperCase)){
        throw `Password should have atleast one upercase character`;
    }
    if(!pass.match(oneNumber)){
        throw `Password should have atleast one one number`;
    }
    if(!pass.match(oneSpecial)){
        throw `Password should have atleast one special character`;
    }
    return pass;
}

export const validUUID = (uuid) =>{
    uuid = validString(uuid, "Meet id");
    if(!(uuidValidate(uuid) && uuidVersion(uuid) ===4)){
        throw "Valid meetId needed";
    }
    return uuid;
}

export const validPermision =(permision)=>{
    permision = validString(permision, "permision");
    if(permision != "unresolved" && permision != "admit" && permision != "deny"){
        throw "valid permision required";
    }
    
    return permision;
}