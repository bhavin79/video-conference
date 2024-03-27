import { Route, Routes } from 'react-router-dom';
import LoginScreen from "./components/authentication/LoginScreen";
import SignupScreen from './components/authentication/SignupScreen';

import './App.css';
import HomeScreen from './components/home/HomeScreen';
import Meet from "./components/meet/Meet"
import { useState } from 'react';

function App() {
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem("userLoggedIn") || false);

  if(!loggedIn){
    
  }
  return (
    <main className="App">
        <div className='nav'>
          <spna>hello</spna>
          <spna>hie</spna>
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
