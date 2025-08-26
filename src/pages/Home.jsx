import React, { useState } from 'react';
import { 
    Users, 
    BookOpen, 
    Calendar, 
    ChevronLeft, 
    ChevronRight,
    GraduationCap,
    ClipboardList,
    BarChart3,
    Code,
    Database
} from 'lucide-react';

// Import images (ensure these are in your assets folder)
import SlideImage1 from '../assets/city (2).jpg';
import SlideImage2 from '../assets/21354_2.jpg';
import SlideImage3 from '../assets/Runway.jpg';

const Dashboard = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        { image: SlideImage1, title: "IT Training Excellence" },
        { image: SlideImage2, title: "Professional Development" },
        { image: SlideImage3, title: "Digital Skills" }
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Slideshow Section */}
            <div className="relative h-[60vh] overflow-hidden">
                {slides.map((slide, index) => (
                    <div 
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                            currentSlide === index ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <img 
                            src={slide.image} 
                            alt={slide.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-600/50 flex items-center justify-center">
                            <div className="text-center text-white">
                                <h2 className="text-4xl font-bold mb-4">
                                    {slide.title}
                                </h2>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Slide Navigation */}
                <button 
                    onClick={prevSlide}
                    className="absolute left-5 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 transition"
                >
                    <ChevronLeft className="text-white" size={24} />
                </button>
                <button 
                    onClick={nextSlide}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 transition"
                >
                    <ChevronRight className="text-white" size={24} />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition ${
                                currentSlide === index ? 'bg-white' : 'bg-white/50'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#13377C] mb-3">
                        LUZ Central
                    </h1>
                    <p className="text-lg text-gray-600">
                        IT Training Management System
                    </p>
                </div>

                {/* Core Features */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white shadow-lg rounded-xl p-6 text-center">
                        <BookOpen className="mx-auto text-[#13377C] mb-3" size={48} />
                        <h3 className="text-lg font-semibold mb-2">Training Management</h3>
                        <p className="text-gray-600 text-sm">
                            Course scheduling and progress tracking
                        </p>
                    </div>

                    <div className="bg-white shadow-lg rounded-xl p-6 text-center">
                        <BarChart3 className="mx-auto text-[#13377C] mb-3" size={48} />
                        <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                        <p className="text-gray-600 text-sm">
                            Performance insights and reports
                        </p>
                    </div>

                    <div className="bg-white shadow-lg rounded-xl p-6 text-center">
                        <Users className="mx-auto text-[#13377C] mb-3" size={48} />
                        <h3 className="text-lg font-semibold mb-2">Student Management</h3>
                        <p className="text-gray-600 text-sm">
                            Student profiles and enrollment
                        </p>
                    </div>
                </div>

                {/* Training Programs */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 mb-12">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-[#13377C] mb-3 flex items-center justify-center">
                            <GraduationCap className="mr-3 text-[#13377C]" size={32} />
                            Training Programs
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
                            <Code className="mx-auto text-[#13377C] mb-3" size={40} />
                            <h3 className="text-lg font-semibold mb-2">Web Development</h3>
                            <p className="text-gray-600 text-sm">Full-stack development training</p>
                        </div>

                        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
                            <Database className="mx-auto text-[#13377C] mb-3" size={40} />
                            <h3 className="text-lg font-semibold mb-2">Database Management</h3>
                            <p className="text-gray-600 text-sm">SQL and database administration</p>
                        </div>
                    </div>
                </div>

                {/* Management Features */}
                <div className="bg-gray-100 rounded-xl p-8 mb-12">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-[#13377C] mb-3">
                            Management Tools
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
                            <Calendar className="mx-auto text-[#13377C] mb-3" size={40} />
                            <h3 className="text-lg font-semibold mb-2">Course Scheduling</h3>
                            <p className="text-gray-600 text-sm">Manage timetables and resources</p>
                        </div>

                        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
                            <ClipboardList className="mx-auto text-[#13377C] mb-3" size={40} />
                            <h3 className="text-lg font-semibold mb-2">Evaluations</h3>
                            <p className="text-gray-600 text-sm">Collect feedback and surveys</p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 text-center shadow-lg">
                        <div className="text-2xl font-bold text-[#13377C] mb-1">500+</div>
                        <div className="text-gray-600 text-sm">Students</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-lg">
                        <div className="text-2xl font-bold text-[#13377C] mb-1">15+</div>
                        <div className="text-gray-600 text-sm">Courses</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-lg">
                        <div className="text-2xl font-bold text-[#13377C] mb-1">95%</div>
                        <div className="text-gray-600 text-sm">Success Rate</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-lg">
                        <div className="text-2xl font-bold text-[#13377C] mb-1">20+</div>
                        <div className="text-gray-600 text-sm">Instructors</div>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="bg-gray-800 text-white py-6">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-gray-400">2024 LUZ Central - LUZ Technologies. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;