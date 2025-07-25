import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Pages/Home/Home';
import Product from '../src/Components/Product/Product';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
         <Route path="/product" element={<Product />} />


      </Routes>
    </Router>
  );
};

export default App;