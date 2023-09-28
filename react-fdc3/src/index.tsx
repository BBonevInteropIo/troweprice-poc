import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { GlueProvider } from '@glue42/react-hooks';
import  Glue42Web  from '@glue42/web'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const settings = {
  web: {
    factory: Glue42Web
  },
};

root.render(
  <BrowserRouter>
    <GlueProvider settings={settings}>
      <App />
    </GlueProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
