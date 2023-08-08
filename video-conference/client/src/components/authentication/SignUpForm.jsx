import {useState,} from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { CustomInputField } from "../CustomInputField"
import { SignUpSchema } from "./validationSchema/authSchema"
import { signUpApiCall } from "../../service/apiCalls";
import { Box, Button, Heading, VStack, Text , Link} from "@chakra-ui/react";


const SignUpForm =()=>{
    
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const sendSignUpCredentials = async(values)=>{        
        const data = {
            "emaildId": values.emailId,
            "password":values.password 
        };
        try {
            let response = await signUpApiCall(data);
            // let response = await axios.post(`${baseURL}/user/signup`, );
            navigate(`/login`);
        } catch (error) {
            setError(error.response.data.msg);
        }
    }
    
    return(
        <VStack
        justify="center"
        h="100vh"
        spacing="0.3rem"
      >
        <Box boxShadow='base' p='6' rounded='md' bg='#fcfcfc' padding='7rem'> 
        <Heading paddingBottom='1rem'>SignUp!</Heading>
        <Formik
            initialValues={{emailId: "", password:"" , rePassword:""}}   
            validationSchema={SignUpSchema}
            onSubmit={sendSignUpCredentials}
         >
            {({ isSubmitting }) => (
                <Form>
                <CustomInputField
                    label="Email id"
                    name="emailId"
                    type="email"
                    placeholder="example@example.com"
                />
                <br/>
                 <CustomInputField
                    label="Password"
                    name="password"
                    type="password"
                    placeholder=""
                />
                <br/>
                 <CustomInputField
                    label="confirm Password"
                    name="rePassword"
                    type="password"
                    placeholder=""
                />
                <br/>
                <Button disabled={isSubmitting} type="submit">
                    Submit
                </Button>
                <Text fontSize='xs' paddingTop='1rem'>{error}</Text>
                </Form>
        )}
        </Formik>
        <Text fontSize='xs' paddingTop='1rem'>Already have an account? <Link color='teal.500' href="/login">click here</Link> to login</Text>
     </Box>
    </VStack>
    )
}
export default SignUpForm;