import React, { useState } from 'react';
import { FaLeaf, FaHeart, FaLightbulb, FaUsers, FaUtensils, FaAward } from 'react-icons/fa';
import './AboutUs.css';
import Header from '../../Components/Header/Header';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';

const AboutUs = () => {
  const [loading] = useState(false);

  const teamMembers = [
    {
      name: 'John Doe',
      role: 'Founder & CEO',
      bio: 'With over 15 years in the industry, John leads our vision and strategy.',
      icon: <FaAward className="team-icon" />
    },
    {
      name: 'Jane Smith',
      role: 'Head Chef',
      bio: 'Master chef specializing in traditional recipes with a modern twist.',
      icon: <FaUtensils className="team-icon" />
    },
    {
      name: 'Mike Johnson',
      role: 'Operations Manager',
      bio: 'Ensures our products meet the highest quality standards.',
      icon: <FaHeart className="team-icon" />
    },
    {
      name: 'Sarah Williams',
      role: 'Customer Experience',
      bio: 'Dedicated to making every customer interaction memorable.',
      icon: <FaUsers className="team-icon" />
    }
  ];

  const coreValues = [
    {
      title: 'Authenticity',
      description: 'We stay true to traditional recipes and cooking methods.',
      icon: <FaLeaf className="value-icon" />
    },
    {
      title: 'Quality',
      description: 'Only the finest ingredients make it into our products.',
      icon: <FaHeart className="value-icon" />
    },
    {
      title: 'Innovation',
      description: 'We continuously improve while respecting tradition.',
      icon: <FaLightbulb className="value-icon" />
    },
    {
      title: 'Community',
      description: 'We support local farmers and give back to our community.',
      icon: <FaUsers className="value-icon" />
    }
  ];

  return (
    <>
      <LoadingSpinner 
        isLoading={loading} 
        brandName="Sweet Delights" 
        loadingText="Loading delicious sweets..."
        progressColor="#3b82f6"
      />
      <Header />
    
      <div className="about-us-page">
        {/* Hero Section */}
        <section className="about-hero" style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), url('https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`
        }}>
          <div className="hero-content">
            <h1>Our Story</h1>
            <p className="hero-subtitle">Traditional flavors, modern passion</p>
          </div>
        </section>

        {/* Our Journey Section */}
        <section className="section journey-section" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url('https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`
        }}>
          <div className="container">
            <div className="section-header">
              <h2>Our Journey</h2>
              <div className="divider"></div>
            </div>
            <div className="journey-content">
              <div className="journey-text">
                <p>
                  Founded in 2010, our company began as a small family kitchen in Chennai, 
                  dedicated to preserving authentic South Indian snack traditions. What started 
                  as a passion project quickly grew as word spread about our unique flavors 
                  and uncompromising quality.
                </p>
                <p>
                  Today, we operate state-of-the-art facilities while maintaining the 
                  handcrafted approach that made us special. Every product still carries 
                  the love and care of our original recipes.
                </p>
              </div>
              <div className="journey-icon">
                <FaLeaf className="section-main-icon" />
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="section mission-section" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`
        }}>
          <div className="container">
            <div className="mission-content">
              <div className="mission-icon">
                <FaHeart className="section-main-icon" />
              </div>
              <div className="mission-text">
                <h2>Our Mission</h2>
                <div className="divider"></div>
                <p>
                  To bring authentic South Indian flavors to the world while innovating 
                  responsibly. We're committed to:
                </p>
                <ul>
                  <li>Preserving traditional recipes</li>
                  <li>Using sustainable ingredients</li>
                  <li>Supporting local farmers</li>
                  <li>Delivering exceptional quality</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="section values-section" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`
        }}>
          <div className="container">
            <div className="section-header">
              <h2>Our Core Values</h2>
              <div className="divider"></div>
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
        <section className="section team-section" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url('https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`
        }}>
          <div className="container">
            <div className="section-header">
              <h2>Meet Our Team</h2>
              <div className="divider"></div>
              <p className="section-subtitle">
                The passionate people behind our delicious products
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
        <section className="section cta-section" style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`
        }}>
          <div className="container">
            <h2>Experience the Difference</h2>
            <p>
              Taste the tradition and quality in every bite. Join our growing family 
              of satisfied customers today.
            </p>
            <button className="cta-button">Shop Our Products</button>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutUs;