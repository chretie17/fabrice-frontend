import React, { useState } from 'react';
import axios from 'axios';
import BackendPort from '../api';
import { Lock, User, LogIn } from 'lucide-react';
import LoginImage from '../assets/rwanda-september-.jpg'; // Ensure you have this image in your assets

const Login = ({ setUserRole, setIsAuthenticated }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        const response = await axios.post(BackendPort.getApiUrl('users/login'), {
            username: usernameOrEmail,
            email: usernameOrEmail,
            password
        });

        const { token, user } = response.data;

        // Save token, user ID, and role in localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userId', user.id);

        // Update state
        setUserRole(user.role);
        setIsAuthenticated(true);

        // Redirect based on role
        if (user.role === 'student') {
            window.location.href = '/'; // Redirect tenant to homepage
        } else {
            window.location.href = '/dashboard'; // Redirect admin/manager to dashboard
        }
    } catch (error) {
        console.error(error);
        setError('Invalid username/email or password /your account will be Blocked After 3 Failed Attempts, please contact administrator');
        setIsLoading(false);
    }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-0">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Image Section */}
        <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-0">
          <img 
            src={LoginImage} 
            alt="Login Background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          
        </div>

        {/* Login Form Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
          <form 
            onSubmit={handleLogin} 
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#13377C]">Welcome Back to LUZ</h1>
              <p className="text-gray-600 mt-2">Please enter your details</p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username or Email
              </label>
              <div className="flex items-center border-2 rounded-lg">
                <span className="pl-4 text-gray-500">
                  <User size={20} />
                </span>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username or email"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                  className="w-full p-3 pl-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13377C]/50"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <div className="flex items-center border-2 rounded-lg">
                <span className="pl-4 text-gray-500">
                  <Lock size={20} />
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    <LogIn size={20} className="mr-2" /> Sign In
                  </>
                )}
              </button>
              <div className="text-center text-gray-600">
                <p className="text-sm">Don't have an account? <a href="/signup" className="text-[#13377C] hover:underline">Sign Up</a></p>
              </div>

              <div className="text-center">
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;