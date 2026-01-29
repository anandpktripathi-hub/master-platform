import React from 'react';

const FooterSection: React.FC = () => (
  <footer className="w-full bg-gray-900 text-gray-200 py-8 px-8 rounded-lg shadow flex flex-col items-center mt-8">
    <p className="text-lg font-semibold">© 2025 Ultra CMS Platform</p>
    <nav className="mt-2 flex gap-4">
      <a href="#" className="hover:underline">Docs</a>
      <a href="#" className="hover:underline">Support</a>
      <a href="#" className="hover:underline">Status</a>
    </nav>
  </footer>
);

export default FooterSection;
