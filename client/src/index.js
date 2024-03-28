import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {BrowserRouter} from "react-router-dom"
import { ChakraProvider } from '@chakra-ui/react';
import { ApiProvider } from './components/conextAPI/authContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApiProvider>
      <BrowserRouter>
        <ChakraProvider>
          <App />
          </ChakraProvider>
      </BrowserRouter>
    </ApiProvider>
  </React.StrictMode>
);
