import { useState } from "react";
import { joinMeetApiCall } from "../../service/apiCalls";
import { useNavigate } from "react-router-dom";
import { CustomInputField } from "../CustomInputField";
import {Form, Formik} from "formik"
import * as yup from "yup";
import { Button, VStack } from "@chakra-ui/react";

const JoinMeetForm =()=>{

    const navigate = useNavigate();
    const [error, setError] = useState("");

    const joinMeeting = async(values)=>{
        console.log(values);
        let response;
        try {
            const data = {
                "meetId": values.meetId, 
                "password": values.password
            }
            response = await joinMeetApiCall(data);
            // response = await axios.post(`${baseURLAPI}/meeting/join`,{"meetId": meetId, password: password},{withCredentials:true});
            if (response.data.msg){
                navigate(`/meet/${values.meetId}`);
            }
        } catch (error) {
            // console.log(error);
            setError(error.response.data.msg);
        }
    }

    return (
        <VStack
        justify="center"
        spacing="0.3rem"
        >
        <Formik
        initialValues={{meetId:"", password:""}}
        validationSchema={yup.object().shape({
            meetId: yup.string().max(36).required("Required"),
            password: yup.string().max(5).required("Required")
        })}
        onSubmit={joinMeeting}
       >
        {({isSubmitting})=>( 
            <Form>
                <CustomInputField 
                    label="Meet Id"
                    type ="text"
                    name="meetId"
                    placeholder="xxxx"
                    />
                <CustomInputField 
                    label="password"
                    type ="text"
                    name="password"
                    placeholder="1234"
                    />
                    <br/>
                <Button disabled={isSubmitting} bg = 'green.300'type="submit">Start</Button>
                {error}
            </Form>
            )} 
    </Formik>
    </VStack>

    )
}
export default JoinMeetForm;