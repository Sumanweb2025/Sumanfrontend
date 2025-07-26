import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Pages/Home/Home';
import Product from '../src/Components/Product/Product';
import Sweets from './Pages/Sweets/sweets';
import Snacks from './Pages/Snacks/Snacks';
import Ourproduct from "../src/Components/Ourproduct/Ourproduct";
import Ourproduct1 from "../src/Components/Ourproduct1/Ourproduct1";
import Gutproduct from "../src/Components/Gudproduct/Gudproduct";
import Offer from "../src/Components/Offer/Offer";
import Groceries from './Pages/Groceries/Groceries';
import Iyyapa from './Components/Iyyapa/Iyyapa';
import Amirth from './Components/Amirth/Amirth';
import Venba from './Components/Venba/Venba';
import SignUp from './Pages/Signup/Signup';
import SignIn from './Pages/Signin/Signin';
import Footer from './Components/Footer/Footer';
import Contacts from './Pages/Contact/Contact';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
         <Route path="/product" element={<Product />} />
         <Route path="/sweets" element={<Sweets />} />
         <Route path="/snacks" element={<Snacks />} />
          <Route path="/contact" element={<Contacts />} />
         <Route path="/Ourproduct" element={<Ourproduct />} />
         <Route path="/Ourproduct1" element={<Ourproduct1 />} />
         <Route path="/Gudproduct" element={<Gutproduct/>}/>
         <Route path="/Offer" element={<Offer/>}/>
         <Route path="/Gudproduct" element={<Gutproduct />} />
         <Route path="/Offer" element={<Offer />} />
         <Route path="/groceries" element={<Groceries />} />
        <Route path="/brands/iyyappa" element={<Iyyapa />} />
        <Route path="/brands/amrith" element={<Amirth />} />
        <Route path="/brands/venba" element={<Venba />} />
        <Route path="/signup" element={<SignUp />} />
         <Route path="/signin" element={<SignIn />} />
         <Route path="/footer" element={<Footer/>} />

      </Routes>
    </Router>
  );
};

export default App;