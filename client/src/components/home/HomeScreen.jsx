import { useState } from "react";
import CreateMeetForm from "./CreateMeetForm";
import JoinMeetForm from "./JoinMeetForm";
import { Box, Button, Card, CardBody, HStack, VStack,  } from '@chakra-ui/react'
import { Divider, Center } from '@chakra-ui/react'
import { Text , Stack} from '@chakra-ui/react'
import { useAuth } from "../conextAPI/authContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Call from "../call/Call";

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
    <>
    <>
        <Call/>
    </>
    <HStack
          justify="center"
          h="100vh"
          spacing="10rem"
    >
        <Box boxShadow='base' p='6' rounded='md' bg='#fcfcfc'  w="300px" h="400px">

        <Text fontSize='3xl'  mb="10">Create Your meet</Text>

        <CreateMeetForm />

        </Box>
        <Center height='500px'>
            <Divider orientation='vertical' colorScheme="black" />
        </Center>
        <Box boxShadow='base' p='6' rounded='md' bg='#fcfcfc' w="300px" h="400px" >
            <Text fontSize='3xl'  mb="10">Join a meet</Text>
            <JoinMeetForm />
        </Box>
    </HStack>
    </>)
}
export default HomeScreen;