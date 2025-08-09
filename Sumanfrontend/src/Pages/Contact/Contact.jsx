import { useState, useEffect} from 'react';
import './Contact.css';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';

const Contact = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API/data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 second loading delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
     <LoadingSpinner 
            isLoading={loading} 
            brandName="Contact Us" 
            loadingText="Loading contact information..."
            progressColor="#3b82f6"
          />
      <Header />
      <motion.div
        className="contact-container"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="contact-title">Get in Touch With Us</h1>

        <div className="contact-grid">
          <motion.div
            className="contact-info"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2>Contact Information</h2>
            <p><strong>Email:</strong> support@sumanfoods.com</p>
            <p><strong>Phone:</strong> +91 98765 43210</p>
            <p><strong>Address:</strong> No.123, Sweets Street, Coimbatore, Tamil Nadu</p>
            <p><strong>Working Hours:</strong> Mon - Sat, 9:00 AM to 6:00 PM</p>
          </motion.div>

          <motion.form
            className="contact-form"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={(e) => {
              e.preventDefault();
              alert("Message sent! We'll get back to you soon.");
              e.target.reset();
            }}
          >
            <h2>Send Us a Message</h2>
            <input type="text" name="name" placeholder="Your Name" required />
            <input type="email" name="email" placeholder="Your Email" required />
            <textarea name="message" rows="5" placeholder="Your Message" required />
            <button type="submit">Send Message</button>
          </motion.form>
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default Contact;
