import React from 'react';

const FeatureSection: React.FC = () => (
  <section className="w-full bg-white py-12 px-8 rounded-lg shadow flex flex-col items-center">
    <h2 className="text-2xl font-bold mb-2 text-gray-800">Enterprise Features</h2>
    <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <li className="bg-blue-50 p-4 rounded shadow text-blue-700 font-semibold">Unlimited Pages</li>
      <li className="bg-blue-50 p-4 rounded shadow text-blue-700 font-semibold">SEO Meta Tags</li>
      <li className="bg-blue-50 p-4 rounded shadow text-blue-700 font-semibold">Real-time Collaboration</li>
    </ul>
  </section>
);

export default FeatureSection;
