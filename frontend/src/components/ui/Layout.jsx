import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1E2A47] to-[#2C3E63] px-6 py-8">
      
      {/* Content Box with Glassmorphism Effect */}
      <main className="w-full max-w-4xl bg-[#192235] bg-opacity-95 backdrop-blur-lg shadow-2xl rounded-xl p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
