import { Route, Routes } from 'react-router-dom';
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from './screens/SignupScreen';

import './App.css';
import HomeScreen from './screens/HomeScreen';
import MeetNew from "./screens/Meet2"

function App() {
  return (
    <main className="App">
      <Routes>
        <Route path ='/login' element={<LoginScreen />} />
        <Route path='/signup' element={<SignupScreen/>}/>
        <Route path='/home' element={<HomeScreen/>} />
        {/* <Route path = "/meet/:id" element={<Meet/>} /> */}
        <Route path = "/meetNew/:id" element={<MeetNew/>} />
      </Routes>
    </main>
  );
}

export default App;
