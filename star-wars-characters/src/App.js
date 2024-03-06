
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


import React from 'react';



import HomePage from './homepage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
