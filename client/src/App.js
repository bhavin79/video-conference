import { Route, Routes } from 'react-router-dom';
import LoginScreen from "./components/authentication/LoginScreen";
import SignupScreen from './components/authentication/SignupScreen';
import { useNavigate } from "react-router-dom";

import './App.css';
import HomeScreen from './components/home/HomeScreen';
import Meet from "./components/meet/Meet"
import { useState } from 'react';
import { useAuth } from './components/conextAPI/authContext';

function App() {
  const {loggedIn, logoutHandle} =  useAuth();
  const navigate = useNavigate();

  let navValues = [];
  if(loggedIn){
    navValues = [localStorage.getItem("username"), "Logout"];
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
        <div className='nav'>
          <span>{navValues[0]}</span>
          <span className='navLinks'>
            {navValues.map((data, i)=>{
                if(i ==0){
                  return;
                }
                  return <span onClick={()=>handleNavigation(data)}>{data}</span>
              })}
          </span>
          
        </div>

      <Routes>
        <Route path ='/login' element={<LoginScreen />} />
        <Route path='/signup' element={<SignupScreen/>}/>
        <Route path='/' element={<HomeScreen/>} />
        <Route path = "/meet/:id" element={<Meet/>} />
      </Routes>
    </main>
  );
}

export default App;
