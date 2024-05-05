import { Route, Routes } from 'react-router-dom';
import LoginScreen from "./components/authentication/LoginScreen";
import SignupScreen from './components/authentication/SignupScreen';
import { useNavigate } from "react-router-dom";

import './App.css';
import Meet from "./components/meet/Meet"
import { useAuth } from './components/conextAPI/authContext';
import Call from './components/call/Call';
import { NotFound } from './NotFound';

function App() {
  const {loggedIn, logoutHandle} =  useAuth();
  const navigate = useNavigate();

  let navValues = [];
  if(loggedIn){
    navValues = ["Welcome", localStorage.getItem("username"), "Logout"];
  }
  if(!loggedIn){
    navValues = ["Welcome", "Login" , "Sign Up"];
  }
  const handleNavigation = async (data)=>{
      switch(data){
        case "Login":{
          navigate(`/login`);
          break;
        }
        case "Sign Up":{
          navigate(`/signup`);
          break;
        }
        case "Logout":{
          logoutHandle();
          localStorage.removeItem("username");
          navigate(`/login`);
          break;
        }
      }
  }
  return (
    <main className="App">
        <div  className='flex justify-around text-base font-normal h-12 bg-custom-blue text-neutral-cutom-white text-white items-center'>
          <span>{navValues[0]}</span>
          <span className='flex'>
            {navValues.map((data, i)=>{
                if(i ==0){
                  return;
                }
                  return <span className='mx-2 hover:cursor-pointer' onClick={()=>handleNavigation(data)}>{data}</span>
              })}
          </span>   
        </div>

      <Routes>
        <Route path ='/login' element={<LoginScreen />} />
        <Route path='/signup' element={<SignupScreen/>}/>
        <Route path='/' element={<Call/>} />
        <Route path='*' element={<NotFound/>}/>
      </Routes>
    </main>
  );
}

export default App;
