import { useState } from "react";
import CreateMeetForm from "../components/home/CreateMeetForm";
import JoinMeetForm from "../components/home/JoinMeetForm";
import { Box, Button, Card, CardBody, HStack, VStack,  } from '@chakra-ui/react'

const HomeScreen =()=> {
    const [joinMeet, setJoinMeet] = useState(false);
    const [createMeet, setCreateMeet] = useState(false);
    

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
    <HStack
          justify="center"
          h="100vh"
          spacing="10rem"
    >
        <Box boxShadow='base' p='6' rounded='md' bg='#fcfcfc' >
        <Button id= "createMeet"onClick = {handleCreateMeet}>  Create Meeting</Button>
        {createMeet &&  <CreateMeetForm />}
        </Box>
   
        <Box boxShadow='base' p='6' rounded='md' bg='#fcfcfc' >

        <Button id = "joinMeet" onClick={handleJoinMeet}>Join Meeting</Button>
        {joinMeet && <JoinMeetForm />}
        </Box>
    </HStack>
    </>)
}
export default HomeScreen;