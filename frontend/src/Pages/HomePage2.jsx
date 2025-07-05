import React from 'react';
import { Stethoscope, Mail, Phone, Heart, User, LogIn } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function HomePage() {
return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50" style={{ backgroundColor: '#fff9e9' }}>
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg" >
                <img src='aj logo.png' alt="Ayurjanani Logo" style={{ width: '65px', height: '65px' }} />
              </div>
              <span className="text-2xl font-bold" style={{ color: '#403c39' }}>Ayurjanani</span>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 transition-colors duration-200" style={{ color: '#403c39' }} onMouseEnter={(e) => e.target.style.color = '#638473'} onMouseLeave={(e) => e.target.style.color = '#403c39'}>
                <LogIn className="h-4 w-4" />
                <span className="font-medium">Login</span>
              </button>
              <button className="flex items-center space-x-2 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg" style={{ backgroundColor: '#638473' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#557a68'} onMouseLeave={(e) => e.target.style.backgroundColor = '#638473'}>
                <User className="h-4 w-4" />
                <span className="font-medium">Register</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight" style={{ color: '#403c39' }}>
                Join Ayurjanani as a{' '}
                <span style={{ color: '#638473' }}>
                  Doctor
                </span>
              </h1>
              <p className="text-xl leading-relaxed max-w-lg" style={{ color: '#6b6b6b' }}>
                Connect with expecting mothers. Manage appointments seamlessly. 
                Support healthier pregnancies with our comprehensive digital platform.
              </p>
            </div>
            
            {/* Features List */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-1 rounded-full" style={{ backgroundColor: '#ffd8b7' }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#638473' }}></div>
                </div>
                <span style={{ color: '#403c39' }}>Secure patient management system</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-1 rounded-full" style={{ backgroundColor: '#ffd8b7' }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#638473' }}></div>
                </div>
                <span style={{ color: '#403c39' }}>Integrated appointment scheduling</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-1 rounded-full" style={{ backgroundColor: '#ffd8b7' }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#638473' }}></div>
                </div>
                <span style={{ color: '#403c39' }}>Comprehensive prenatal care tools</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <button className="text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl" style={{ backgroundColor: '#c17754' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#a86644'} onMouseLeave={(e) => e.target.style.backgroundColor = '#c17754'}>
                Get Started Today
              </button>
            </div>
          </div>

          {/* Right Content - Medical Illustration */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="rounded-xl p-8" style={{ backgroundColor: '#fff9e9' }}>
                <div className="text-center space-y-6">
                  <div className=" flex items-center justify-center" >
                    <img src='aj logo.png' alt="Ayurjanani Logo" style={{ width: '200px', height: '200px' }} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold" style={{ color: '#403c39' }}>Professional Care</h3>
                    <p style={{ color: '#6b6b6b' }}>
                      Empowering healthcare providers with modern digital tools
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold" style={{ color: '#638473' }}>24/7</div>
                      <div className="text-sm" style={{ color: '#6b6b6b' }}>Support</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold" style={{ color: '#c17754' }}>100%</div>
                      <div className="text-sm" style={{ color: '#6b6b6b' }}>Secure</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20 animate-pulse" style={{ backgroundColor: '#ffd8b7' }}></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-20 animate-pulse" style={{ backgroundColor: '#c17754', animationDelay: '1000ms' }}></div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Logo and Description */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                
                <span className="text-xl font-bold" style={{ color: '#403c39' }}>Ayurjanani</span>
              </div>
              <p className="text-sm" style={{ color: '#6b6b6b' }}>
                Connecting healthcare providers with expecting mothers for better prenatal care.
              </p>
            </div>

            {/* Support Contact */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold" style={{ color: '#403c39' }}>Support</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4" style={{ color: '#638473' }} />
                  <span className="text-sm" style={{ color: '#6b6b6b' }}>support@ayurjanani.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4" style={{ color: '#638473' }} />
                  <span className="text-sm" style={{ color: '#6b6b6b' }}>+1 (555) 123-4567</span>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="flex flex-col justify-end">
              <p className="text-sm" style={{ color: '#999' }}>
                © 2025 Ayurjanani. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


