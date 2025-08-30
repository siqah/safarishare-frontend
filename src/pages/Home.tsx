import React from 'react';
import Hero from '../components/Home/Hero';
import Features from '../components/Home/Features';
import HowItWorks from '../components/Home/HowItWorks';
import Header from '../components/Layout/Header';

const Home: React.FC = () => {
  return (
    <div>
      <Hero />
      <Features />
      <HowItWorks />
    </div>
  );
};

export default Home;