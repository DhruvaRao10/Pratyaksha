import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import './styles/global.css';
import { MantineEmotionProvider } from '@mantine/emotion';
import "../src/home.css"
// import "../src/styles/collection.css"
import { ThemeProvider } from "../src/components/theme-provider"

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">

    <BrowserRouter>
    <MantineEmotionProvider>
      <App />
      </MantineEmotionProvider>
    </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
  
);

