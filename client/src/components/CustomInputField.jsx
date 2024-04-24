import { FormControl, FormLabel, FormErrorMessage } from "@chakra-ui/react";
import {Input} from "@chakra-ui/react"
import { Field, useField } from "formik";
export const CustomInputField =({label, ...props}) =>{
    const [field, meta]= useField(props);
    return (
        <FormControl isInvalid={meta.touched && meta.error}>
            <FormLabel>{label}</FormLabel>
            <Input {...field} {...props} />
            <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
    )
}