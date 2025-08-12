import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Pages/Home/Home';
import Product from '../src/Components/Product/Product';
import Sweets from './Pages/Sweets/sweets';
import ProductDetailsPage from './Pages/ProductDetailsPage/ProductDetailsPage';
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
import Profile from './Pages/Profile/Profile';
import Footer from './Components/Footer/Footer';
import Contacts from './Pages/Contact/Contact';
import Wishlist from './Pages/Wishlist/Wishlist';
import Cart from './Pages/Cart/Cart';
import CheckoutPage from './Pages/CheckOut/CheckOut';
import MyOrders from './Pages/Myorders/Myorders';
import OrderTrackingPage from './Pages/OrderTracking/OrderTracking';
import AboutUs from './Pages/Aboutus/Aboutus';

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
         <Route path="/groceries" element={<Groceries />} />
        <Route path="/brands/iyyappa" element={<Iyyapa />} />
        <Route path="/brands/amrith" element={<Amirth />} />
        <Route path="/brands/venba" element={<Venba />} />
        <Route path="/signup" element={<SignUp />} />
         <Route path="/signin" element={<SignIn />} />
         <Route path="/profile" element={<Profile />} />
         <Route path="/footer" element={<Footer/>} />
         <Route path="/product/:id" element={<ProductDetailsPage/>} />
         <Route path="/wishlist" element={<Wishlist />} />
         <Route path="/cart" element={<Cart />} /> 
         <Route path='/checkout' element={<CheckoutPage/>} />
         <Route path='/myorders' element={<MyOrders/>} />
         <Route path="/track-order" element={<OrderTrackingPage />} />
         <Route path='/aboutus' element={<AboutUs/>} />

      </Routes>
    </Router>
  );
};

export default App;