import React, { useState } from 'react';
import { 
    Home, 
    Users, 
    BookOpen, 
    Calendar, 
    MessageCircle, 
    Star, 
    ChevronLeft, 
    ChevronRight,
    GraduationCap,
    ClipboardList,
    BarChart3,
    UserCheck,
    Globe,
    Share2,
    Award,
    MonitorSpeaker,
    Code,
    Database,
    Smartphone
} from 'lucide-react';

// Import images (ensure these are in your assets folder)
import SlideImage1 from '../assets/city (2).jpg';
import SlideImage2 from '../assets/21354_2.jpg';
import SlideImage3 from '../assets/Runway.jpg';

const Dashboard = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        { image: SlideImage1, title: "IT Training Excellence", subtitle: "Building Digital Skills for Rwanda's Future" },
        { image: SlideImage2, title: "Comprehensive Learning", subtitle: "From Basics to Advanced Technologies" },
        { image: SlideImage3, title: "Professional Development", subtitle: "Empowering Careers Through Technology" }
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    // Training Programs
    const trainingPrograms = [
        {
            icon: Code,
            title: "Web Development",
            description: "Full-stack development with modern frameworks and technologies.",
            duration: "3-6 months",
            link: "/programs/web-development"
        },
        {
            icon: Database,
            title: "Database Management",
            description: "Master SQL, NoSQL, and database administration fundamentals.",
            duration: "2-3 months",
            link: "/programs/database"
        },
        {
            icon: Smartphone,
            title: "Mobile App Development",
            description: "Build native and cross-platform mobile applications.",
            duration: "4-5 months",
            link: "/programs/mobile-dev"
        },
        {
            icon: MonitorSpeaker,
            title: "Digital Marketing",
            description: "Learn SEO, social media, and online marketing strategies.",
            duration: "2-3 months",
            link: "/programs/digital-marketing"
        }
    ];

    // Management Features
    const managementFeatures = [
        {
            icon: Users,
            title: "Student Management",
            description: "Register, track, and manage student profiles and progress.",
            link: "/students"
        },
        {
            icon: Calendar,
            title: "Course Scheduling",
            description: "Organize training sessions, manage timetables and resources.",
            link: "/scheduling"
        },
        {
            icon: GraduationCap,
            title: "Instructor Hub",
            description: "Manage instructor profiles, assignments, and performance.",
            link: "/instructors"
        },
        {
            icon: ClipboardList,
            title: "Evaluations & Surveys",
            description: "Collect feedback and track course satisfaction rates.",
            link: "/evaluations"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Slideshow Section */}
            <div className="relative h-[70vh] overflow-hidden">
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
                                <h2 className="text-5xl font-bold tracking-wide mb-4">
                                    {slide.title}
                                </h2>
                                <p className="text-xl opacity-90">
                                    {slide.subtitle}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Slide Navigation */}
                <button 
                    onClick={prevSlide}
                    className="absolute left-5 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 transition"
                >
                    <ChevronLeft className="text-white" size={32} />
                </button>
                <button 
                    onClick={nextSlide}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 transition"
                >
                    <ChevronRight className="text-white" size={32} />
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
            <div className="container mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-[#13377C] mb-4">
                        Welcome to LUZ Central
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Your comprehensive IT training management system. Streamlining operations, 
                        enhancing learning experiences, and building digital skills for Rwanda's future.
                    </p>
                </div>

                {/* Core Features */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white shadow-lg rounded-xl p-6 text-center hover:shadow-xl transition transform hover:-translate-y-1">
                        <BookOpen className="mx-auto text-[#13377C] mb-4" size={60} />
                        <h3 className="text-xl font-semibold mb-3">Training Management</h3>
                        <p className="text-gray-600">
                            Comprehensive course catalog, scheduling, and progress tracking system.
                        </p>
                    </div>

                    <div className="bg-white shadow-lg rounded-xl p-6 text-center hover:shadow-xl transition transform hover:-translate-y-1">
                        <BarChart3 className="mx-auto text-[#13377C] mb-4" size={60} />
                        <h3 className="text-xl font-semibold mb-3">Analytics & Reports</h3>
                        <p className="text-gray-600">
                            Real-time insights into student performance, course effectiveness, and operational metrics.
                        </p>
                    </div>

                    <div className="bg-white shadow-lg rounded-xl p-6 text-center hover:shadow-xl transition transform hover:-translate-y-1">
                        <Globe className="mx-auto text-[#13377C] mb-4" size={60} />
                        <h3 className="text-xl font-semibold mb-3">Community Impact</h3>
                        <p className="text-gray-600">
                            Building digital literacy and professional skills across Rwanda's communities.
                        </p>
                    </div>
                </div>

                {/* Training Programs Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-10 mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-[#13377C] mb-4 flex items-center justify-center">
                            <GraduationCap className="mr-4 text-[#13377C]" size={44} />
                            IT Training Programs
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Comprehensive technology training designed to meet industry demands and career aspirations.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {trainingPrograms.map((program, index) => (
                            <div 
                                key={index} 
                                className="bg-white shadow-lg rounded-xl p-6 text-center hover:shadow-xl transition transform hover:-translate-y-2 border-l-4 border-[#13377C]"
                            >
                                <program.icon className="mx-auto text-[#13377C] mb-4" size={50} />
                                <h3 className="text-lg font-semibold mb-3">{program.title}</h3>
                                <p className="text-gray-600 text-sm mb-3">{program.description}</p>
                                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                    {program.duration}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Management Features Section */}
                <div className="container mx-auto px-6 py-16 bg-gray-100 rounded-xl mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-[#13377C] mb-4 flex items-center justify-center">
                            <Share2 className="mr-4 text-[#13377C]" size={44} />
                            Management & Operations
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Powerful tools to streamline operations, manage resources, and enhance learning outcomes.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {managementFeatures.map((feature, index) => (
                            <div 
                                key={index} 
                                className="bg-white shadow-lg rounded-xl p-6 text-center hover:shadow-xl transition transform hover:-translate-y-2 cursor-pointer"
                                onClick={() => window.location.href = feature.link}
                            >
                                <feature.icon className="mx-auto text-[#13377C] mb-4" size={60} />
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-16">
                    <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                        <div className="text-3xl font-bold text-[#13377C] mb-2">500+</div>
                        <div className="text-gray-600">Students Trained</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                        <div className="text-3xl font-bold text-[#13377C] mb-2">15+</div>
                        <div className="text-gray-600">Active Courses</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                        <div className="text-3xl font-bold text-[#13377C] mb-2">95%</div>
                        <div className="text-gray-600">Completion Rate</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                        <div className="text-3xl font-bold text-[#13377C] mb-2">20+</div>
                        <div className="text-gray-600">Expert Instructors</div>
                    </div>
                </div>

                {/* Call to Action Section */}
                <div className="bg-[#13377C] text-white rounded-xl p-10 text-center">
                    <div className="flex justify-center items-center mb-4 space-x-4">
                        <MessageCircle className="text-white" size={50} />
                        <Award className="text-yellow-400" size={50} />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Ready to Transform IT Education?</h2>
                    <p className="mb-6 max-w-xl mx-auto">
                        Join LUZ Central and experience streamlined training management, 
                        enhanced learning outcomes, and comprehensive operational insights.
                    </p>
                    <div className="space-x-4">
                        <button 
                            onClick={() => window.location.href = '/register'}
                            className="bg-white text-[#13377C] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition inline-block"
                        >
                            Get Started
                        </button>
                        <button 
                            onClick={() => window.location.href = '/contact'}
                            className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-[#13377C] transition inline-block"
                        >
                            Contact Us
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-12">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">LUZ Central</h3>
                            <p className="text-gray-400">
                                Transforming IT education and building digital skills for Rwanda's future.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="/programs" className="hover:text-white">Training Programs</a></li>
                                <li><a href="/students" className="hover:text-white">Student Portal</a></li>
                                <li><a href="/instructors" className="hover:text-white">Instructor Hub</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Management</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="/scheduling" className="hover:text-white">Course Scheduling</a></li>
                                <li><a href="/reports" className="hover:text-white">Reports & Analytics</a></li>
                                <li><a href="/evaluations" className="hover:text-white">Evaluations</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Support</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="/help" className="hover:text-white">Help Center</a></li>
                                <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
                                <li><a href="/feedback" className="hover:text-white">Feedback</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 pt-8 text-center">
                        <div className="flex justify-center space-x-2 mb-4">
                            <Star className="text-yellow-400" size={20} />
                            <Star className="text-yellow-400" size={20} />
                            <Star className="text-yellow-400" size={20} />
                            <Star className="text-yellow-400" size={20} />
                            <Star className="text-yellow-400" size={20} />
                        </div>
                        <p className="text-gray-400">&copy; 2024 LUZ Central - LUZ Technologies. All Rights Reserved.</p>
                        <div className="mt-4 space-x-4 text-gray-400">
                            <a href="/privacy" className="hover:text-white">Privacy Policy</a>
                            <a href="/terms" className="hover:text-white">Terms of Service</a>
                            <a href="/support" className="hover:text-white">Support</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;