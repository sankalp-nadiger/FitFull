import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0F172A] to-[#1E293B] px-6 py-8">
      
      {/* Content Box with Glassmorphism Effect */}
      <main className="w-full max-w-4xl bg-[#111827] bg-opacity-90 backdrop-blur-lg shadow-xl rounded-xl p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
