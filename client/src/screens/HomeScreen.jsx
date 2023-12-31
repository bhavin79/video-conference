import { useState } from "react";
import CreateMeetForm from "../components/home/CreateMeetForm";
import JoinMeetForm from "../components/home/JoinMeetForm";
import { Box, Button, Card, CardBody, HStack, VStack,  } from '@chakra-ui/react'
import { Divider, Center } from '@chakra-ui/react'
import { Text , Stack} from '@chakra-ui/react'

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