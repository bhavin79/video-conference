import { useState } from "react";
import { joinMeetApiCall } from "../../service/apiCalls";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

const JoinMeetForm =()=>{

    const navigate = useNavigate();
    const [error, setError] = useState("");
    const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm();

    const joinMeeting = async(values)=>{
        console.log(values);
        let response;
        try {
            const data = {
                "meetId": values.meetId, 
                "password": values.password
            }
            response = await joinMeetApiCall(data);
            if (response.data.msg){
                // navigate(`/meet/${values.meetId}`);
                navigate(`/meet/${values.meetId}`);
            }
        } catch (error) {
            console.log(error);
            setError(error.response.data.msg);
        }
    }

    return (
        <div className="flex flex-col items-center">
        <form className="form-control w-full max-w-xs" onSubmit={handleSubmit(joinMeeting)} autoComplete= "new-password">
        <input type={"password"} name="To-Stop-Chrome-From-AutoComplete" className="h-0"/>
            <label htmlFor = "meetId" className="label">MeetId:</label> 
                <input 
                    className= "input input-bordered w-full max-w-xs text-black" 
                    type ="text"
                    id="meetId"
                    name="meetId"
                    autoComplete="off"
                    placeholder="xxxx"
                    {...register("meetId", {
                        required: "MeetId is Required",
                        validate:{
                            justSpaces: (name)=>{
                                    if(name.trim().length==0){
                                        return "password can't be empty spaces";
                                }
                            }
                        },
                    })}
                    />
                {errors && errors.meetId && <p className="label text-orange-600" >{errors.meetId.message}</p>}
                
               <label htmlFor = "password" className="label">Password:</label> 
                <input 
                    type="password"
                    name="pass"
                    id="password"
                    className= "input input-bordered w-full max-w-xs text-black" 
                    placeholder="Add password"
                    {...register("password", {
                        required: "password is Required",
                        validate:{
                            justSpaces: (name)=>{
                                    if(name.trim().length==0){
                                        return "password can't be empty spaces";
                                }
                            }
                        },
                    })}/>
                    {errors && errors.password && <p className="label text-orange-600" >{errors.password.message}</p>}
                    <div className="flex justify-center my-5">
                        <button className="btn bg-green-500 hover:bg-green-200 border-none" type="submit">Join!</button>
                    </div>               
                    {error && <p className="text-orange-600">{error}</p>}
            </form>
        </div>
    )
}
export default JoinMeetForm;