import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Pages/Home/Home';
import Product from '../src/Components/Product/Product';
import Groceries from './Pages/Groceries/Groceries';
import Navbar from './Components/Navbar/Navbar';
import Iyyapa from './Components/Iyyapa/Iyyapa';
import Amirth from './Components/Amirth/Amirth';
import Venba from './Components/Venba/Venba';
import SignUp from './Pages/Signup/Signup';
import SignIn from './Pages/Signin/Signin';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Home />} />
         <Route path="/product" element={<Product />} />
        <Route path="/groceries" element={<Groceries />} />
        <Route path="/brands/iyyappa" element={<Iyyapa />} />
        <Route path="/brands/amrith" element={<Amirth />} />
        <Route path="/brands/venba" element={<Venba />} />
        <Route path="/signup" element={<SignUp />} />
         <Route path="/signin" element={<SignIn />} />
      </Routes>
    </Router>
  );
};

export default App;