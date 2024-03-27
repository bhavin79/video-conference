import { Route, Routes } from 'react-router-dom';
import LoginScreen from "./components/authentication/LoginScreen";
import SignupScreen from './components/authentication/SignupScreen';

import './App.css';
import HomeScreen from './components/home/HomeScreen';
import Meet from "./components/meet/Meet"

function App() {
  return (
    <main className="App">
      <Routes>
        <Route path ='/login' element={<LoginScreen />} />
        <Route path='/signup' element={<SignupScreen/>}/>
        <Route path='/home' element={<HomeScreen/>} />
        <Route path = "/meet/:id" element={<Meet/>} />
      </Routes>
    </main>
  );
}

export default App;
