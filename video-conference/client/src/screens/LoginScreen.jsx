import {useEffect, useState} from "react";
import LoginForm from "../components/authentication/LoginForm";
import { useNavigate } from "react-router-dom";

const LoginScreen = ()=>{  
    return (
        <>
        <LoginForm/>
        </>
    )
}
export default LoginScreen;