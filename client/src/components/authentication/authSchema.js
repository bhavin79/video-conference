import * as yup from "yup";
const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;

const schema = {
    emailId: yup.string().email("Please provide valid email id").required("Required"),
    password: yup.string().min(5).matches(passwordRules, {message:"Please create a strong password"}).required("Required"),
}
export const LogInSchema = ()=>{
    return yup.object().shape(schema);
}
export const SignUpSchema =()=>{
    schema["rePassword"] = yup.string().oneOf([yup.ref("password"), null], "Password do not match").required("Required");
    return yup.object().shape(schema);
}