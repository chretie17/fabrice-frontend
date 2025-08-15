import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Users from './pages/ManageUsers';
import Login from './pages/Login';
import StudentSignup from './pages/SIgnup';
import Dashboard from './pages/Dashboard';
import ManagerServices from './pages/ManagerServices';
import Discussions from './pages/Forum/CommunityPost.jsx';
import TenantsFeedback from './pages/studentFeedback.jsx';
import AdminFeedbackPage from './pages/AdminFeedbacks';
import CourseAccess from './pages/studentpages/courseaccess';
import AdminPage from './pages/AdminSurveys';
import TenantPage from './pages/Surveys.jsx';
import AdminEngage from './pages/Forum/CommunityPost.jsx'
import QuestionManagement from './pages/AdminQuestions';
import AdminSurveyResponses from './pages/AdminResponse';
import ReportGenerator from './pages/Report';
import StudentDashboard from './pages/StudentEnrollment';
import AdminDashboard from './pages/AdminCourses.jsx';
import AdminContentManagement from './pages/AdminPosts.jsx';

const App = () => {
    const [userRole, setUserRole] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole');
        if (token && role) {
            setIsAuthenticated(true);
            setUserRole(role);
        }

        // Handle initial sidebar state based on screen size
        const handleResize = () => {
            setIsSidebarCollapsed(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
        setUserRole(null);
    };

    return (
        <Router>
            {isAuthenticated && userRole !== 'student' && (
                <div className="flex min-h-screen">
                {isAuthenticated && userRole !== 'student' && (
                    <Sidebar
                        onLogout={handleLogout}
                        isCollapsed={isSidebarCollapsed}
                        onToggleCollapse={(state) => setIsSidebarCollapsed(state)}
                    />
                )}
                <div
                    className={`
                        flex-1 
                        transition-all 
                        duration-300
                        p-4
                        ${isAuthenticated && userRole !== 'student' ? '' : 'pt-20'} 
                        ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
                        ml-0
                    `}
                >
                    <Routes>
                        {isAuthenticated && userRole !== 'student' ? (
                            <>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/users" element={<Users />} />
                                <Route path="/admin/feedbacks" element={<AdminFeedbackPage />} />
                                <Route path="/admin/questions" element={<QuestionManagement />} />
                                <Route path="/admin/surveys" element={<AdminPage />} />
                                <Route path="/admin/responses" element={<AdminSurveyResponses />} />
                                 <Route path="/admin/discussions" element={<AdminContentManagement />} />
                                <Route path="/admin/courses" element={<AdminDashboard />} />
                                <Route path="/admin/engage" element={<AdminEngage />} />
                                <Route path="/manager/services" element={<ManagerServices />} />
                                <Route path="/reports" element={<ReportGenerator />} />
                                <Route path="*" element={<Navigate to="/dashboard" />} />
                            </>
                        ) : (
                            <>
                                <Route path="/" element={<Home />} />
                                <Route path="/services" element={<TenantServices />} />
                                <Route path="/discussions" element={<Discussions />} />
                                <Route path="/surveys" element={<TenantPage />} />
                                <Route path="/feedback" element={<TenantsFeedback />} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </>
                        )}
                    </Routes>
                </div>
            </div>
            )}

            {isAuthenticated && userRole === 'student' && (
                <div className="min-h-screen">
                    <Navbar
                        links={[
                            { path: '/', label: 'Home' },
                            { path: '/student-study', label: 'Enrollment' },
                            { path: '/discussions', label: 'Discussions' },
                            { path: '/feedback', label: 'Feedback' },
                            { path: '/surveys', label: 'Surveys' },
                        ]}
                        onLogout={handleLogout}
                        className="fixed top-0 w-full z-50"
                    />
                    <div className="pt-20 p-4 md:p-6 lg:p-8">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/student-study" element={<StudentDashboard />} />
                            <Route path="/discussions" element={<Discussions />} />
                            <Route path="/surveys" element={<TenantPage />} />
                            <Route path="/feedback" element={<TenantsFeedback />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </div>
                </div>
            )}

            {!isAuthenticated && (
                <div className="min-h-screen">
                    <Routes>
                        <Route
                            path="/login"
                            element={
                                <Login setUserRole={setUserRole} setIsAuthenticated={setIsAuthenticated} />
                            }
                        />
                        <Route path="/signup" element={<StudentSignup />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                                                    <Route path="/course-access" element={<CourseAccess />} />


                    </Routes>
                </div>
            )}
        </Router>
    );
};

export default App;