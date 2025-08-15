import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    Clock,
    BarChart2,
    FileText,
    MessageCircle,
    CheckCircle,
    AlertTriangle,
    Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:3000/api/dashboard/dashboard?year=${yearFilter}`)
            .then((response) => response.json())
            .then((data) => {
                setDashboardData(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            });
    }, [yearFilter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex flex-col items-center space-y-4 bg-white p-8 rounded-2xl shadow-lg">
                    <Clock className="w-16 h-16 text-[#123679] animate-pulse" />
                    <p className="text-xl text-gray-600 font-semibold">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-700">No Data Available</h3>
                    <p className="text-gray-500 mt-2">Please check your data source or network connection.</p>
                </div>
            </div>
        );
    }

    // Data preparation (unchanged)
    const postStatusChartData = [
        { name: 'Approved Posts', count: dashboardData.postStatus.find((p) => p.status === 'Approved')?.post_count || 0 },
        { name: 'Pending Posts', count: dashboardData.postStatus.find((p) => p.status === 'Pending')?.post_count || 0 },
        { name: 'Rejected Posts', count: dashboardData.postStatus.find((p) => p.status === 'Rejected')?.post_count || 0 },
    ];

    const topEngagementChartData = dashboardData.topEngagement.map((tenant) => ({
        name: tenant.tenant_name,
        engagement: tenant.post_count + tenant.feedback_count + tenant.comment_count,
    }));

    const totalPosts = dashboardData.postStatus.reduce((acc, post) => acc + post.post_count, 0);
    const totalComments = dashboardData.commentCount[0]?.comment_count || 0;
    const totalFeedback = dashboardData.tenantEngagement.reduce((acc, tenant) => acc + tenant.feedback_count, 0);

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 pt-4">
                {/* Header */}
                <div className="mb-6 bg-white rounded-2xl p-6 shadow-lg">
                    <h1 className="text-4xl font-bold text-[#123679] flex items-center">
                        <BarChart2 className="mr-3 text-[#123679]" /> 
                        <span className="bg-gradient-to-r from-[#123679] to-[#2563eb] bg-clip-text text-transparent">
                            Dashboard Overview
                        </span>
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Real-time insights into your platform's performance</p>
                </div>

                {/* Year Filter */}
                <div className="mb-6 bg-white rounded-xl p-4 shadow-md">
                    <label htmlFor="yearFilter" className="text-gray-700 font-medium mr-4">
                        Select Year:
                    </label>
                    <select
                        id="yearFilter"
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#123679] focus:border-[#123679] outline-none transition-all duration-200"
                    >
                        {[2025, 2024, 2023, 2022].map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        {
                            title: 'Total Posts',
                            value: totalPosts,
                            icon: <FileText className="text-[#123679]" />,
                            bgColor: 'bg-gradient-to-br from-[#123679]/10 to-[#123679]/5',
                            textColor: 'text-[#123679]',
                            link: '/admin/discussions',
                        },
                        {
                            title: 'Total Comments',
                            value: totalComments,
                            icon: <MessageCircle className="text-[#123679]" />,
                            bgColor: 'bg-gradient-to-br from-[#123679]/10 to-[#123679]/5',
                            textColor: 'text-[#123679]',
                            link: '/admin/discussions',
                        },
                        {
                            title: 'Total Feedback',
                            value: totalFeedback,
                            icon: <CheckCircle className="text-[#123679]" />,
                            bgColor: 'bg-gradient-to-br from-[#123679]/10 to-[#123679]/5',
                            textColor: 'text-[#123679]',
                            link: '/admin/feedbacks',
                        },
                        {
                            title: 'Tenant Engagement',
                            value: dashboardData.topEngagement.length,
                            icon: <BarChart2 className="text-[#123679]" />,
                            bgColor: 'bg-gradient-to-br from-[#123679]/10 to-[#123679]/5',
                            textColor: 'text-[#123679]',
                            link: '/admin/feedbacks',
                        },
                    ].map((metric, index) => (
                        <div
                            key={index}
                            className={`${metric.bgColor} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">{metric.title}</h3>
                                    <p className={`text-3xl font-bold ${metric.textColor} mt-2`}>{metric.value.toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => navigate(metric.link)}
                                    className="p-2 hover:bg-[#123679]/10 rounded-full transition-all duration-300 group"
                                >
                                    <Eye size={28} className="text-[#123679] group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Post Status Chart */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <h3 className="text-xl font-semibold text-[#123679] mb-6 flex items-center">
                            <CheckCircle className="mr-2 text-[#123679]" /> 
                            <span className="bg-gradient-to-r from-[#123679] to-[#2563eb] bg-clip-text text-transparent">
                                Post Status Overview
                            </span>
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={postStatusChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="name" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip
                                    cursor={{ fill: '#123679', fillOpacity: 0.1 }}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        borderColor: '#123679',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="count" fill="#123679" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Tenant Engagement Chart */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <h3 className="text-xl font-semibold text-[#123679] mb-6 flex items-center">
                            <BarChart2 className="mr-2 text-[#123679]" />
                            <span className="bg-gradient-to-r from-[#123679] to-[#2563eb] bg-clip-text text-transparent">
                                Top Tenant Engagement
                            </span>
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={topEngagementChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="name" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip
                                    cursor={{ stroke: '#123679', strokeWidth: 2 }}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        borderColor: '#123679',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="engagement"
                                    stroke="#123679"
                                    strokeWidth={3}
                                    dot={{ fill: '#123679', strokeWidth: 2 }}
                                    activeDot={{
                                        r: 8,
                                        fill: '#123679',
                                        stroke: 'white',
                                        strokeWidth: 2,
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;