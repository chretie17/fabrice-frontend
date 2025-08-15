import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LogOut, 
  Menu, 
  X, 
  Home, 
  User, 
  Settings, 
  Activity,
  BarChart2,
  MessageCircle,
  MessageSquare,
  PieChart,
  FileText,
  ClipboardList,
  MessageSquareMore
} from 'lucide-react';
import Logo from '../assets/logo.png'; // Import the logo
import { PiStudent } from 'react-icons/pi';

const Navbar = ({ 
  links = [], 
  onLogout, 
  brandName = "LUZ Tech",
  defaultIcon = Home 
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Default icon mapping with additional icons
    const defaultIconMap = {
        'Home': Home,
        'Profile': User,
        'Dashboard': Activity,
        'Settings': Settings,
        'Enrollment': PiStudent,
        'Discussions': MessageCircle,
        'Feedback': MessageSquare,
        'Surveys': PieChart,
        'Lease and Appreciation': FileText,
        'Leaseandappreciation': FileText
    };

    const renderNavLinks = (isMobile = false) => (
        <>
            {links.map((link, index) => {
                // Prioritize custom icon, then mapped icon, then default icon
                const IconComponent = 
                    link.icon || 
                    defaultIconMap[link.label?.replace(/\s/g, '')] || 
                    defaultIcon;

                return (
                    <NavLink
                        key={index}
                        to={link.path}
                        className={({ isActive }) => `
                            flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
                            ${isActive 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-gray-300 hover:bg-blue-600/20 hover:text-white'
                            }
                            ${isMobile ? 'w-full mb-2' : ''}
                        `}
                        onClick={isMobile ? toggleMobileMenu : undefined}
                    >
                        <IconComponent size={18} className="mr-2" />
                        {link.label}
                    </NavLink>
                );
            })}
        </>
    );

    return (
        <nav className="bg-gradient-to-r from-[#13377C] to-blue-900 text-white shadow-2xl fixed top-0 left-0 w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand and Desktop Menu */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <img 
                                src={Logo} 
                                alt={`${brandName} Logo`} 
                                className="h-10 w-10 mr-3" 
                            />
                            <span className="text-2xl font-bold tracking-wider">{brandName}</span>
                        </div>
                        <div className="ml-10 hidden md:flex space-x-4">
                            {renderNavLinks()}
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center">
                        <button 
                            onClick={toggleMobileMenu}
                            className="text-white hover:text-gray-300 focus:outline-none"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Logout Button */}
                    <div className="hidden md:block">
                        <button
                            onClick={onLogout}
                            className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                        >
                            <LogOut size={18} className="mr-2" />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-[#13377C] absolute top-16 left-0 w-full p-4 space-y-2 shadow-xl">
                        <div className="flex flex-col space-y-2">
                            {renderNavLinks(true)}
                            <button
                                onClick={() => {
                                    onLogout();
                                    toggleMobileMenu();
                                }}
                                className="flex items-center w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300"
                            >
                                <LogOut size={18} className="mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;