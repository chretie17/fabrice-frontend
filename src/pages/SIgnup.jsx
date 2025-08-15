import React, { useState } from 'react';
import { Lock, User, Mail, Phone, UserPlus } from 'lucide-react';

// BackendPort class
class BackendPort {
  static BASE_URL = 'http://localhost:3000';
  
  static getApiUrl(endpoint) {
    return `${this.BASE_URL}/api/${endpoint}`;
  }
}

const StudentSignup = ({ setUserRole, setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 3) {
      setError('Password must be at least 3 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(BackendPort.getApiUrl('users/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          phone_number: formData.phone_number,
          password: formData.password,
          role: 'student'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Account created successfully! You can now login.');
      
      // Reset form
      setFormData({
        name: '',
        username: '',
        email: '',
        phone_number: '',
        password: '',
        confirmPassword: ''
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } catch (error) {
      console.error(error);
      setError(error.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-0">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Image Section */}
        <div className="w-full md:w-2/5 relative min-h-[300px] md:min-h-0">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <div className="text-white text-center p-8">
              <h2 className="text-3xl font-bold mb-4">Join LUZ Technologies</h2>
              <p className="text-blue-100">Start your IT learning journey with us</p>
            </div>
          </div>
        </div>

        {/* Signup Form Section */}
        <div className="w-full md:w-3/5 flex items-center justify-center p-6 md:p-8">
          <div className="w-full max-w-md">
            <form onSubmit={handleSignup} className="w-full">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-[#13377C]">Join LUZ Central</h1>
                <p className="text-gray-600 mt-2">Create your student account</p>
              </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                {success}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Full Name *
              </label>
              <div className="flex items-center border-2 rounded-lg">
                <span className="pl-4 text-gray-500">
                  <User size={20} />
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 pl-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13377C]/50"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username *
              </label>
              <div className="flex items-center border-2 rounded-lg">
                <span className="pl-4 text-gray-500">
                  <User size={20} />
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 pl-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13377C]/50"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email Address *
              </label>
              <div className="flex items-center border-2 rounded-lg">
                <span className="pl-4 text-gray-500">
                  <Mail size={20} />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 pl-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13377C]/50"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone_number">
                Phone Number
              </label>
              <div className="flex items-center border-2 rounded-lg">
                <span className="pl-4 text-gray-500">
                  <Phone size={20} />
                </span>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full p-3 pl-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13377C]/50"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password *
              </label>
              <div className="flex items-center border-2 rounded-lg">
                <span className="pl-4 text-gray-500">
                  <Lock size={20} />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 pl-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13377C]/50"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                Confirm Password *
              </label>
              <div className="flex items-center border-2 rounded-lg">
                <span className="pl-4 text-gray-500">
                  <Lock size={20} />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 pl-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13377C]/50"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center p-3 rounded-lg text-white font-bold transition duration-300 
                  ${isLoading 
                    ? 'bg-[#13377C]/50 cursor-not-allowed' 
                    : 'bg-[#13377C] hover:bg-[#0E2A62] focus:outline-none focus:shadow-outline'
                  }`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <UserPlus size={20} className="mr-2" /> Create Account
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <a href="/login" className="text-[#13377C] hover:text-[#0E2A62] font-semibold">
                    Sign in here
                  </a>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  );
};

export default StudentSignup;