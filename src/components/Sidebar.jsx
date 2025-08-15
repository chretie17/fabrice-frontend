import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, UserCog, FileSpreadsheet, LogOut, Cog,
  ChevronLeft, ChevronRight, TrendingUp, MessageSquare,
  AlignLeft, FileQuestion, FileText, BarChart3, Globe,
  Layers, Users, BookOpen, Clipboard, Award, PieChart,
  ChevronDown, ChevronUp, Sun, Moon, Clock, Menu,
  Bell, Settings, Home
} from 'lucide-react';
import Logo from '../assets/logo.png';
import { GiTeacher } from 'react-icons/gi';

const Sidebar = ({ onLogout }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const [openGroup, setOpenGroup] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const [isHovering, setIsHovering] = useState(false);
    const role = localStorage.getItem('userRole') || 'Guest';
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile && !isCollapsed) {
                setIsCollapsed(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const navigationGroups = {
        admin: [
            {
                group: 'Core Management',
                icon: Home,
                links: [
                    { path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
                    { path: '/users', label: 'User Management', icon: Users },
                    { path: '/reports', label: 'Reports', icon: BarChart3 },
                ]
            },
            {
                group: 'Administration',
                icon: Layers,
                links: [
                    { path: '/admin/discussions', label: 'Discussions Mgt', icon: MessageSquare },
                    { path: '/admin/courses', label: 'Courses Management', icon: AlignLeft },
                    { path: '/admin/engage', label: 'Discussion Engaging', icon: FileQuestion },
                    { path: '/admin/surveys', label: 'Survey Dashboard', icon: Clipboard },
                ]
            },
            {
                group: 'Feedbacks & Reaction',
                icon: MessageSquare,
                links: [
                    { path: '/admin/feedbacks', label: 'Feedbacks Analysis', icon: AlignLeft },                   
                ]
            },
            {
                group: 'Surveys management',
                icon: MessageSquare,
                links: [    
                    { path: '/admin/responses', label: 'Response Library', icon: FileText },
                ]
            },
           
        ],
        instructor: [
            {
                group: 'Management Console',
                icon: LayoutGrid,
                links: [
                    { path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
                    { path: '/instructor-page', label: 'Courses Management', icon: GiTeacher },
                ]
            }
        ],
        student: [
            {
                group: 'Welcome',
                icon: Globe,
                links: [
                    { path: '/', label: 'Home', icon: Globe }
                ]
            }
        ]
    };

    const toggleGroup = (groupName) => {
        setOpenGroup(currentOpenGroup => 
            currentOpenGroup === groupName ? '' : groupName
        );
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const renderNavigationGroup = (group) => {
        const GroupIcon = group.icon;
        return (
            <div 
                key={group.group} 
                className="mb-2 last:mb-0"
            >
                <button 
                    onClick={() => toggleGroup(group.group)}
                    className={`
                        w-full 
                        flex 
                        items-center 
                        justify-between 
                        px-4 
                        py-3
                        transition-all
                        duration-300
                        ${isCollapsed ? 'justify-center' : ''}
                        ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-white/10'}
                        rounded-lg
                    `}
                >
                    <div className="flex items-center">
                        <GroupIcon size={20} className={`
                            ${isCollapsed ? '' : 'mr-3'}
                            ${openGroup === group.group ? 'text-blue-400' : 'text-gray-400'}
                        `} />
                        {!isCollapsed && (
                            <span className={`
                                text-sm 
                                font-medium
                                ${openGroup === group.group ? 'text-blue-400' : 'text-gray-300'}
                            `}>
                                {group.group}
                            </span>
                        )}
                    </div>
                    {!isCollapsed && (
                        <ChevronDown
                            size={18}
                            className={`
                                transition-transform duration-300
                                ${openGroup === group.group ? 'rotate-180 text-blue-400' : 'text-gray-400'}
                            `}
                        />
                    )}
                </button>

                <div className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${openGroup === group.group ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
                `}>
                    <ul className="mt-2 space-y-1 px-3">
                        {group.links.map((link, index) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;
                            return (
                                <li key={index}>
                                    <NavLink
                                        to={link.path}
                                        onClick={() => isMobile && setIsOpen(false)}
                                        className={`
                                            flex 
                                            items-center 
                                            px-3 
                                            py-2.5
                                            rounded-lg 
                                            transition-all
                                            duration-300
                                            group
                                            ${isActive 
                                                ? 'bg-gradient-to-r from-blue-600/20 to-blue-400/10 text-blue-400' 
                                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}
                                            ${isCollapsed ? 'justify-center' : ''}
                                        `}
                                    >
                                        <Icon 
                                            size={20} 
                                            className={`
                                                transition-transform duration-300
                                                ${isCollapsed ? '' : 'mr-3'}
                                                ${isActive ? 'text-blue-400' : 'group-hover:text-gray-200'}
                                            `}
                                        />
                                        {!isCollapsed && (
                                            <span className="text-sm font-medium whitespace-nowrap">
                                                {link.label}
                                            </span>
                                        )}
                                        {!isCollapsed && isActive && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                                        )}
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        );
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 bg-[#0E2A62] p-2 rounded-lg text-white"
            >
                <Menu size={24} />
            </button>

            <aside 
                className={`
                    fixed 
                    inset-y-0 
                    left-0 
                    z-40
                    transition-all 
                    duration-300 
                    ease-in-out
                    ${isDarkMode ? 'bg-gray-900' : 'bg-[#13377C]'}
                    ${isCollapsed ? 'w-20' : 'w-64'}
                    ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
                    flex 
                    flex-col
                    border-r border-white/10
                    backdrop-blur-xl
                `}
                onMouseEnter={() => !isMobile && setIsHovering(true)}
                onMouseLeave={() => !isMobile && setIsHovering(false)}
            >
                {/* Header */}
                <div className="flex flex-col items-center py-6 border-b border-white/10">
                    <div className="relative flex items-center justify-center">
                        <img 
                            src={Logo} 
                            alt="Logo" 
                            className={`
                                w-12 h-12
                                transition-all 
                                duration-300
                                ${isCollapsed ? 'scale-90' : 'scale-100'}
                            `}
                        />
                        {!isCollapsed && (
                            <h1 className="ml-3 text-xl font-bold text-white">
                                Luz Central
                            </h1>
                        )}
                    </div>
                    
                    {!isCollapsed && (
                        <div className="mt-4 flex items-center space-x-3">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                                {role}
                            </span>
                            <div className="flex items-center text-xs text-gray-400">
                                <Clock size={14} className="mr-1" />
                                {formatTime(currentTime)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-700 px-3 py-4">
                    <div className="space-y-4">
                        {navigationGroups[role].map(renderNavigationGroup)}
                    </div>
                </nav>

                {/* Footer */}
                <div className="border-t border-white/10 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <button 
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            {isDarkMode ? (
                                <Sun size={20} className="text-gray-400" />
                            ) : (
                                <Moon size={20} className="text-gray-400" />
                            )}
                        </button>
                        
                        {!isCollapsed && (
                            <>
                               
                            </>
                        )}
                    </div>

                    <button
                        onClick={onLogout}
                        className="
                            w-full 
                            flex 
                            items-center 
                            justify-center
                            px-4 
                            py-2 
                            space-x-2
                            rounded-lg
                            bg-red-500/10
                            text-red-500
                            hover:bg-red-500/20
                            transition-colors
                        "
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>

                {/* Collapse Toggle */}
                {!isMobile && (
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`
                            absolute 
                            right-0 
                            top-1/2 
                            -translate-y-1/2
                            translate-x-1/2
                            bg-blue-500
                            text-white
                            p-1.5
                            rounded-full
                            shadow-lg
                            hover:bg-blue-600
                            transition-colors
                            z-50
                        `}
                    >
                        {isCollapsed ? (
                            <ChevronRight size={16} />
                        ) : (
                            <ChevronLeft size={16} />
                        )}
                    </button>
                )}
            </aside>

            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;