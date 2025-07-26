import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Pages/Home/Home';
import Product from '../src/Components/Product/Product';
import Ourproduct from "../src/Components/Ourproduct/Ourproduct";
import Ourproduct1 from "../src/Components/Ourproduct1/Ourproduct1";
import Gutproduct from "../src/Components/Gudproduct/Gudproduct";
import Offer from "../src/Components/Offer/Offer";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
         <Route path="/product" element={<Product />} />
         <Route path="/Ourproduct" element={<Ourproduct />} />
         <Route path="/Ourproduct1" element={<Ourproduct1 />} />
         <Route path="/Gudproduct" element={<Gutproduct/>}/>
         <Route path="/Offer" element={<Offer/>}/>

      </Routes>
    </Router>
  );
};

export default App;