import {useState} from "react";
import { useNavigate } from "react-router-dom";
import {Form, Formik} from "formik";
import { LogInSchema } from "./validationSchema/authSchema";
import { CustomInputField } from "../CustomInputField";
import { loginApiCall } from "../../service/apiCalls";
import { Box, Button, Heading, VStack, Text , Link} from "@chakra-ui/react";

const LoginForm = ()=>{      
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const sendLoginCredentials = async(values)=>{
        try {
            const data = {"emaildId": values.emailId,"password":values.password};
            console.log("here in form")
            let response = await loginApiCall(data);
            navigate("/home");
        } catch (error) {
            setError(error.response.data.msg);
        }
        return;
    }
    return (  
        <VStack
        justify="center"
        h="100vh"
        spacing="0.2rem"
      >
        <Box boxShadow='base' p='6' rounded='md' bg='#fcfcfc' padding='5rem'> 
        <Heading>Login!</Heading>
     
        <Formik
        initialValues={{emailId: "", password:""}}
        validationSchema={LogInSchema}
        onSubmit={sendLoginCredentials}
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
                    placeholder="password.."
                />
                <br/>
                <Button disabled={isSubmitting} type="submit">
                    Submit</Button>
               
                <br/>
                {error}
                </Form>
        )}
        </Formik>
        <Text fontSize='xs' paddingTop='1rem'>Dont have an account? <Link color='teal.500' href="/signup" >click here</Link> to create one</Text>
        </Box>
    </VStack>
    )
}
export default LoginForm;