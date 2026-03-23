import React from 'react';
import Navbar from './Navbar';

const LayoutWrapper = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      <footer className="bg-gray-800 text-white text-center py-4">
        AttendanceClock © 2026
      </footer>
    </div>
  );
};

export default LayoutWrapper;