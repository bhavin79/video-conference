import { useState } from "react";
import CreateMeetForm from "./CreateMeetForm";
import JoinMeetForm from "./JoinMeetForm";
import { useAuth } from "../conextAPI/authContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


const HomeScreen =()=> {
    const [joinMeet, setJoinMeet] = useState(false);
    const [createMeet, setCreateMeet] = useState(false);
    const navigate = useNavigate();
    const {loggedIn} = useAuth();

    useEffect(()=>{
        if (!loggedIn){
            navigate("/login");
        }
    },[loggedIn])

    //handle on click event for meeting START
    const handleCreateMeet=()=>{
        setCreateMeet(true);
        setJoinMeet(false);
    }

    //handling onclick event from joining meet
    const handleJoinMeet =()=>{
        setJoinMeet(true);
        setCreateMeet(false);
    }
    
    return (

        <div className="flex justify-center items-center h-screen">
            <div className="grid grid-cols-2 gap-32 ">
            <div  className="card shadow-md  py-16 px-5 ">
                <div className="card-body items-center text-center">
                <h2 className="card-title mb-5 text-3xl">Create Your meet</h2>
                    <CreateMeetForm />
                </div>
            </div>
            <div  className="card shadow-md py-16 px-5 ">
                <div className="card-body items-center text-center">
                <h2 className="card-title mb-5 text-3xl">Join a meet</h2>
                <JoinMeetForm />
                </div>
            </div>
        </div>
    </div>

    )
}
export default HomeScreen;