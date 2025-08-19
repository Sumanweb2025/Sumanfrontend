import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaPaperPlane
} from 'react-icons/fa';
import './Contact.css';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import Banner from '../../Components/ShippingBanner/ShippingBanner';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';

const Contact = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();

      if (result.success) {
        alert("Message sent successfully! We'll get back to you soon.");
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert(result.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      alert('Server error. Please try again later.');
    }
  };

  const contactInfo = [
    {
      icon: <FaPhone className="contact-icon" />,
      title: 'Phone',
      detail: '+1 647-573-6363',
      subdetail: 'Mon–Fri, 9:30 AM – 6:30 PM'
    },
    {
      icon: <FaEnvelope className="contact-icon" />,
      title: 'Email',
      detail: 'sellappan@gmail.com',
      subdetail: 'We reply within 24 hours'
    },
    {
      icon: <FaMapMarkerAlt className="contact-icon" />,
      title: 'Address',
      detail: '2721 Markham Road, Unit #16-18',
      subdetail: 'Scarborough, Toronto, Canada'
    },
    {
      icon: <FaClock className="contact-icon" />,
      title: 'Working Hours',
      detail: 'Mon–Fri: 9:30 AM – 6:30 PM',
      subdetail: 'Weekend: Closed'
    }
  ];

  return (
    <>
      <LoadingSpinner
        isLoading={loading}
        brandName="Iyappaa Sweets & Snacks"
        loadingText="Loading contact information..."
        progressColor="#3b82f6"
      />

      <Header />

      <div className="contact-page">
        {/* Hero Section */}
        <section
          className="contact-hero"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),
              url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')
            `
          }}
        >
          <div className="hero-content">
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Get In Touch
            </motion.h1>
            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </motion.p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section
          className="contact-info-section"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)),
              url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')
            `
          }}
        >
          <div className="contact-container">
            <div className="contact-section-header">
              <h2>Contact Information</h2>
              <div className="divider"></div>
              <p className="contact-section-subtitle">Multiple ways to reach us</p>
            </div>
            <div className="contact-info-grid">
              {contactInfo.map((info, idx) => (
                <motion.div
                  key={idx}
                  className="contact-info-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <div className="contact-icon-container">{info.icon}</div>
                  <h3>{info.title}</h3>
                  <p className="detail">{info.detail}</p>
                  <p className="subdetail">{info.subdetail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section
          className="contact-form-section"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.75), rgba(255,255,255,0.75)),
              url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')
            `
          }}
        >
          <div className="container">
            <div className="form-container">
              <motion.div
                className="form-content"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="form-header">
                  <h2>Send Us a Message</h2>
                  <div className="divider"></div>
                  <p>Have a question or want to work together? We'd love to hear from you.</p>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="subject"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      name="message"
                      rows="6"
                      placeholder="Your Message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                  <motion.button
                    type="submit"
                    className="submit-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPaperPlane className="button-icon" />
                    Send Message
                  </motion.button>
                </form>
              </motion.div>

              <motion.div
                className="form-sidebar"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="sidebar-content">
                  <h3>Why Choose Us?</h3>
                  <ul className="benefits-list">
                    <li>✓ Authentic South Indian sweets</li>
                    <li>✓ Fresh ingredients daily</li>
                    <li>✓ Traditional recipes</li>
                    <li>✓ Quality guaranteed</li>
                    <li>✓ Local Toronto business</li>
                  </ul>
                  <div className="social-section">
                    <h4>Follow Us</h4>
                    <div className="social-icons">
                      <a href="#" className="social-icon"><FaFacebook /></a>
                      <a href="#" className="social-icon"><FaTwitter /></a>
                      <a href="#" className="social-icon"><FaInstagram /></a>
                      <a href="#" className="social-icon"><FaLinkedin /></a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="map-section">
          <div className="container">
            <div className="section-header">
              <h2>Find Us</h2>
              <div className="divider"></div>
              <p className="section-subtitle">Visit our store in Scarborough, Toronto</p>
            </div>
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2877.1234567890!2d-79.22345678901234!3d43.78901234567890!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d1a2b3c4d5e6%3A0x1234567890abcdef!2s2721%20Markham%20Rd%2C%20Scarborough%2C%20ON%20M1X%201L5%2C%20Canada!5e0!3m2!1sen!2sca!4v1634567890123!5m2!1sen!2sca"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Iyappaa Sweets & Snacks Location"
              />
            </div>
          </div>
        </section>
      </div>

      <Banner />
      <Footer />
    </>
  );
};

export default Contact;
