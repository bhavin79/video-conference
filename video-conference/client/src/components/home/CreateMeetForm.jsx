import { useNavigate } from "react-router-dom";
import {Form, Formik} from "formik";
import { CustomInputField } from "../CustomInputField";
import { createMeetApiCall } from "../../service/apiCalls";
import { useState } from "react";
import { VStack, Button } from "@chakra-ui/react";
import * as yup from "yup";

const CreateMeetForm =()=>{

    const navigate = useNavigate();
    const [error, setError] = useState("");

    const getMeetingId = async(values)=>{
        // axios.defaults.withCredentials = true;
        let response;
        try {
            response = await createMeetApiCall({password:values.password});
            // resposne = await axios.post(`${baseURLAPI}/meeting/createMeet`, {password:password}, {withCredentials:true});
           const responseMeetId = response.data.meetId;
           navigate(`/meet/${responseMeetId}`);
        } catch (error) {
            // console.log(error.response.data.msg)
            setError(error.response.data.msg);
        }
    }

    return (
        <VStack
        justify="center"
        spacing="0.3rem"
      >
        <Formik
            initialValues={{password:""}}
            validationSchema={yup.object().shape({
                password: yup.string().max(5).required("Required")
            })}
            onSubmit={getMeetingId}
        >
        {({isSubmitting})=>( 
            <Form>
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

export default CreateMeetForm;