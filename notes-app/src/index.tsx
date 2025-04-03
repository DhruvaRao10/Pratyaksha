import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import Sidebar from "./components/sidebar";
import GlobalStyle from './styles/global';
import { MantineEmotionProvider } from '@mantine/emotion';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <MantineEmotionProvider>
      <App />
      </MantineEmotionProvider>
    </BrowserRouter>
  </React.StrictMode>
);

