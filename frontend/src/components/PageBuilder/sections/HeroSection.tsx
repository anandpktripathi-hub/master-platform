import React from 'react';

const HeroSection: React.FC = () => (
  <section className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16 px-8 rounded-lg shadow-lg flex flex-col items-center justify-center">
    <h1 className="text-4xl font-extrabold mb-4">Ultra CMS Hero Section</h1>
    <p className="text-lg mb-6 max-w-xl text-center">Build beautiful, enterprise-grade landing pages with drag & drop. This is a sample hero section.</p>
    <button className="bg-white text-blue-600 font-bold px-6 py-2 rounded shadow hover:bg-blue-100 transition">Get Started</button>
  </section>
);

export default HeroSection;
