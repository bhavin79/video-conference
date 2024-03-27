import { useNavigate } from "react-router-dom";
import {Form, Formik} from "formik";
import { CustomInputField } from "../CustomInputField";
import { createMeetApiCall } from "../../service/apiCalls";
import { useState } from "react";
import { VStack, Button, HStack, useClipboard, Input, InputGroup , InputRightElement} from "@chakra-ui/react";
import * as yup from "yup";
import {BiCopy} from "react-icons/bi";
import {FcVideoCall} from "react-icons/fc"

const CreateMeetForm =()=>{

    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [meetid, setMeetingId] = useState("");
    const { onCopy, hasCopied } = useClipboard(meetid);

    const getMeetingId = async(values)=>{
        // axios.defaults.withCredentials = true;
        let response;
        try {
            response = await createMeetApiCall({password:values.password});
           const responseMeetId = response.data.meetId;
           setMeetingId(responseMeetId)
        //    navigate(`/meet/${responseMeetId}`);
        } catch (error) {
            setError(error.response.data.msg);
        }
    }
    const handleStart =()=>{
        // navigate(`/meet/${meetid}`);
        navigate(`/meet/${meetid}`);

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
                    label="Password"
                    type ="text"
                    name="password"
                    placeholder="1234"
                    />
                <br></br>
                <Button disabled={isSubmitting} bg = 'green.300'type="submit" mb="6" borderRadius="40">Create</Button>
                {error}
            </Form>
            )} 
        </Formik>
       
        {meetid && <>
                    <HStack spacing="4" align="center">
                    <InputGroup>
                        <Input value={meetid} isReadOnly placeholder={meetid} />    
                        <InputRightElement width="3.2rem">
                            <Button onClick={onCopy} >
                                <BiCopy />   
                            </Button>   
                        </InputRightElement>                
                    </InputGroup>
                    </HStack>        
                       <FcVideoCall onClick={handleStart} size="40"/>
                </>}
    
       
        </VStack>
    )
}

export default CreateMeetForm;