import React, { useState } from 'react';
import { FaLeaf, FaHeart, FaLightbulb, FaUsers, FaUtensils, FaAward } from 'react-icons/fa';
import './Aboutus.css';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import Banner from '../../Components/ShippingBanner/ShippingBanner';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';

const AboutUs = () => {
  const [loading] = useState(false);

  const teamMembers = [
    {
      name: 'Ravi Kumar',
      role: 'Founder & CEO',
      bio: 'With over 15 years in traditional sweet making, Ravi leads our vision and strategy.',
      icon: <FaAward className="team-icon" />
    },
    {
      name: 'Priya Sharma',
      role: 'Head Chef',
      bio: 'Master chef specializing in authentic South Indian sweets and snacks.',
      icon: <FaUtensils className="team-icon" />
    },
    {
      name: 'Arjun Patel',
      role: 'Operations Manager',
      bio: 'Ensures our products meet the highest quality standards daily.',
      icon: <FaHeart className="team-icon" />
    },
    {
      name: 'Meera Singh',
      role: 'Customer Experience',
      bio: 'Dedicated to making every customer interaction memorable and sweet.',
      icon: <FaUsers className="team-icon" />
    }
  ];

  const coreValues = [
    {
      title: 'Authenticity',
      description: 'We stay true to traditional South Indian recipes and cooking methods.',
      icon: <FaLeaf className="value-icon" />
    },
    {
      title: 'Quality',
      description: 'Only the finest ingredients make it into our sweets and snacks.',
      icon: <FaHeart className="value-icon" />
    },
    {
      title: 'Innovation',
      description: 'We continuously improve while respecting time-honored traditions.',
      icon: <FaLightbulb className="value-icon" />
    },
    {
      title: 'Community',
      description: 'We support local suppliers and give back to our Toronto community.',
      icon: <FaUsers className="value-icon" />
    }
  ];

  return (
    <>
      <LoadingSpinner 
        isLoading={loading} 
        brandName="Iyappaa Sweets & Snacks" 
        loadingText="Loading delicious sweets..."
        progressColor="#3b82f6"
      />
      
      {/* Header with Background */}
      <div 
        className="header-with-background"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')`
        }}
      >
        <Header />
        
        {/* Hero Section */}
        <section className="about-hero">
          <div className="hero-content">
            <h1>Our Sweet Story</h1>
            <p className="hero-subtitle">Bringing authentic South Indian flavors to Toronto since 2010</p>
          </div>
        </section>
      </div>
    
      <div className="about-us-page">
        {/* Our Journey Section */}
        <section className="about-section journey-section" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url('https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`
        }}>
          <div className="about-container">
            <div className="about-section-header">
              <h2>Our Journey</h2>
              <div className="about-divider"></div>
            </div>
            <div className="journey-content">
              <div className="journey-text">
                <p>
                  Founded in 2010, Iyappaa Sweets & Snacks began as a small family kitchen in Toronto, 
                  dedicated to preserving authentic South Indian sweet and snack traditions. What started 
                  as a passion project quickly grew as word spread about our unique flavors 
                  and uncompromising quality throughout the GTA.
                </p>
                <p>
                  Today, we operate from our state-of-the-art facility in Scarborough while maintaining the 
                  handcrafted approach that made us special. Every laddu, every mixture, and every 
                  sweet still carries the love and care of our original family recipes.
                </p>
              </div>
              <div className="journey-icon">
                <FaLeaf className="section-main-icon" />
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="about-section mission-section" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`
        }}>
          <div className="about-container">
            <div className="mission-content">
              <div className="mission-icon">
                <FaHeart className="section-main-icon" />
              </div>
              <div className="mission-text">
                <div className='about-section-header'>
                  <h2>Our Mission</h2>
                  <div className="about-divider"></div>
                </div>
                <p>
                  To bring authentic South Indian flavors to Toronto while innovating 
                  responsibly and building community. We're committed to:
                </p>
                <ul>
                  <li>Preserving traditional family recipes</li>
                  <li>Using only premium, fresh ingredients</li>
                  <li>Supporting local Toronto businesses</li>
                  <li>Delivering exceptional taste and quality</li>
                  <li>Sharing our cultural heritage through food</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="about-section values-section" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`
        }}>
          <div className="about-container">
            <div className="about-section-header">
              <h2>Our Core Values</h2>
              <div className="about-divider"></div>
            </div>
            <div className="values-grid">
              {coreValues.map((value, index) => (
                <div key={index} className="value-card">
                  <div className="value-icon-container">
                    {value.icon}
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="about-section team-section" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`
        }}>
          <div className="about-container">
            <div className="about-section-header">
              <h2>Meet Our Team</h2>
              <div className="about-divider"></div>
              <p className="about-section-subtitle">
                The passionate people behind our delicious sweets and snacks
              </p>
            </div>
            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <div key={index} className="team-card">
                  <div className="team-icon-container">
                    {member.icon}
                  </div>
                  <div className="team-details">
                    <h3>{member.name}</h3>
                    <p className="role">{member.role}</p>
                    <p className="bio">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-section cta-section" style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`
        }}>
          <div className="about-container">
            <h2>Experience the Authentic Taste</h2>
            <p>
              Taste the tradition and quality in every bite. Join our growing family 
              of satisfied customers across Toronto and the GTA.
            </p>
            <button className="cta-button">Shop Our Products</button>
          </div>
        </section>
      </div>
      <Banner/>
      <Footer/>
    </>
  );
};

export default AboutUs;