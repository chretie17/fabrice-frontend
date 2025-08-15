import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BackendPort from '../api';
import { Wrench, CheckCircle2, ChevronDown, Calendar, Building2, DoorClosed, AlertCircle, Plus } from 'lucide-react';
import { Snackbar, Alert } from '@mui/material';

const TenantServices = () => {
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        service_type: '',
        description: '',
        priority: '',
        floors: [],
        room_numbers: [],
        service_date: new Date().toISOString().split('T')[0],
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
    const [isFormExpanded, setIsFormExpanded] = useState(false);

    const serviceCategories = [
        { type: 'Electrical', severity: 'High', icon: '⚡️' },
        { type: 'Plumbing', severity: 'Medium', icon: '🚰' },
        { type: 'Cleaning', severity: 'Low', icon: '🧹' },
        { type: 'Repair', severity: 'Medium', icon: '🔧' },
        { type: 'Maintenance', severity: 'Low', icon: '🛠️' },
    ];

    useEffect(() => {
        fetchServices();
    }, []);

    // Existing fetch, handle change, and submit functions remain the same
    const fetchServices = async () => {
        const tenantId = localStorage.getItem('userId');
        try {
            const response = await axios.get(BackendPort.getApiUrl(`services/tenant/${tenantId}`));
            const updatedServices = response.data.map((service) => ({
                ...service,
                floors: service.floors ? service.floors.split(',') : [],
                room_numbers: service.room_numbers ? service.room_numbers.split(',') : [],
            }));
            setServices(updatedServices);
        } catch (error) {
            showSnackbar('Error fetching services', 'error');
            console.error('Error fetching services:', error);
        }
    };

    const handleServiceTypeChange = (e) => {
        const selectedType = serviceCategories.find(
            (category) => category.type === e.target.value
        );
        if (selectedType) {
            setFormData({
                ...formData,
                service_type: selectedType.type,
                priority: selectedType.severity,
            });
        }
    };

    const handleChange = (e) => {
        const { name, value, options } = e.target;
        if (name === 'floors' || name === 'room_numbers') {
            const selectedOptions = Array.from(options)
                .filter((option) => option.selected)
                .map((option) => option.value);
            setFormData({ ...formData, [name]: selectedOptions });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const tenantId = localStorage.getItem('userId');
        try {
            const updatedFormData = {
                ...formData,
                tenant_id: tenantId,
            };
            await axios.post(BackendPort.getApiUrl('services'), updatedFormData);
            showSnackbar('Service request created successfully!', 'success');
            setFormData({
                service_type: '',
                description: '',
                priority: '',
                floors: [],
                room_numbers: [],
                service_date: new Date().toISOString().split('T')[0],
            });
            fetchServices();
        } catch (error) {
            showSnackbar('Error creating service request', 'error');
            console.error('Error creating service:', error.response?.data || error);
        }
    };

    const displayFloors = (floors) => {
        if (!floors) return 'N/A';
        if (Array.isArray(floors)) {
            return floors.join(', ');
        }
        return floors;
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ open: false, message: '', severity: '' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
                {/* Enhanced Header Section */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <h1 className="text-3xl md:text-4xl font-bold flex items-center">
                            <Wrench className="mr-4 h-8 w-8 md:h-10 md:w-10" />
                            Service Requests
                        </h1>
                        <button
                            onClick={() => setIsFormExpanded(!isFormExpanded)}
                            className="flex items-center justify-center bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl transition-all duration-300 text-base font-medium backdrop-blur-sm"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            {isFormExpanded ? 'Close Form' : 'New Request'}
                            <ChevronDown className={`ml-2 transform transition-transform duration-300 ${isFormExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Enhanced Form Section */}
                {isFormExpanded && (
                    <div className="p-8 bg-gray-50/50 border-b border-gray-200">
                        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Enhanced Service Type Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 block">Service Type</label>
                                    <select
                                        name="service_type"
                                        value={formData.service_type}
                                        onChange={handleServiceTypeChange}
                                        required
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                                    >
                                        <option value="">Select Type</option>
                                        {serviceCategories.map((category, index) => (
                                            <option key={index} value={category.type}>
                                                {category.icon} {category.type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Enhanced Priority Display */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 block">Priority Level</label>
                                    <input
                                        type="text"
                                        name="priority"
                                        value={formData.priority}
                                        readOnly
                                        className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-medium"
                                        placeholder="Auto-assigned priority"
                                    />
                                </div>

                                {/* Enhanced Date Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 block">Service Date</label>
                                    <input
                                        type="date"
                                        name="service_date"
                                        value={formData.service_date}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                                    />
                                </div>

                                {/* Enhanced Floor Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 block">Select Floors</label>
                                    <div className="grid grid-cols-4 gap-2 p-4 bg-white rounded-xl border border-gray-200 shadow-sm max-h-64 overflow-y-auto">
                                        {[...Array(20)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`relative cursor-pointer group`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={`floor-${i + 1}`}
                                                    value={i + 1}
                                                    checked={formData.floors.includes(String(i + 1))}
                                                    onChange={(e) => {
                                                        const value = String(i + 1);
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            floors: e.target.checked
                                                                ? [...prev.floors, value]
                                                                : prev.floors.filter(f => f !== value)
                                                        }));
                                                    }}
                                                    className="hidden"
                                                />
                                                <label
                                                    htmlFor={`floor-${i + 1}`}
                                                    className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
                                                        ${formData.floors.includes(String(i + 1))
                                                            ? 'bg-blue-500 border-blue-600 text-white'
                                                            : 'border-gray-200 hover:border-blue-400 bg-gray-50 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Enhanced Room Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 block">Select Rooms</label>
                                    <div className="grid grid-cols-3 gap-2 p-4 bg-white rounded-xl border border-gray-200 shadow-sm max-h-64 overflow-y-auto">
                                        {[...Array(50)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="relative cursor-pointer group"
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={`room-${i + 1}`}
                                                    value={`Room ${i + 1}`}
                                                    checked={formData.room_numbers.includes(`Room ${i + 1}`)}
                                                    onChange={(e) => {
                                                        const value = `Room ${i + 1}`;
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            room_numbers: e.target.checked
                                                                ? [...prev.room_numbers, value]
                                                                : prev.room_numbers.filter(r => r !== value)
                                                        }));
                                                    }}
                                                    className="hidden"
                                                />
                                                <label
                                                    htmlFor={`room-${i + 1}`}
                                                    className={`flex items-center justify-center p-2 rounded-lg border-2 text-sm transition-all duration-200
                                                        ${formData.room_numbers.includes(`Room ${i + 1}`)
                                                            ? 'bg-blue-500 border-blue-600 text-white'
                                                            : 'border-gray-200 hover:border-blue-400 bg-gray-50 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Description Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 block">Description</label>
                                <textarea
                                    name="description"
                                    placeholder="Please describe your issue in detail..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-32 bg-white shadow-sm"
                                ></textarea>
                            </div>

                            {/* Enhanced Submit Button */}
                            <button
                                type="submit"
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-medium shadow-lg hover:shadow-xl"
                            >
                                <CheckCircle2 className="h-5 w-5" />
                                Submit Service Request
                            </button>
                        </form>
                    </div>
                )}

                 {/* Enhanced Services Table */}
                <div className="p-8">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tl-lg">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tr-lg">Dates</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {services.map((service) => (
                                    <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="flex items-center text-sm font-medium text-gray-900">
                                                <span className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-lg mr-3">
                                                    <Wrench className="h-4 w-4 text-blue-600" />
                                                </span>
                                                {service.service_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                <div className="flex items-center mb-2">
                                                    <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                                        Floors: {displayFloors(service.floors)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <DoorClosed className="h-4 w-4 mr-2 text-gray-400" />
                                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                                        Rooms: {service.room_numbers.join(', ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    service.priority === 'High'
                                                        ? 'bg-red-100 text-red-800'
                                                        : service.priority === 'Medium'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}
                                            >
                                                <AlertCircle className="h-4 w-4 mr-2" />
                                                {service.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs">
                                                <p className="line-clamp-2">{service.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex flex-col space-y-2">
                                                <span className="flex items-center bg-blue-50 px-3 py-1 rounded-lg text-blue-700">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    {new Date(service.service_date).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    Created: {new Date(service.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Enhanced Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                className="mt-16"
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity} 
                    className="rounded-xl shadow-lg border border-gray-100"
                    sx={{ 
                        '& .MuiAlert-icon': {
                            fontSize: '24px'
                        },
                        '& .MuiAlert-message': {
                            fontSize: '14px',
                            fontWeight: 500
                        },
                        minWidth: '300px'
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Enhanced Empty State */}
            {services.length === 0 && !isFormExpanded && (
                <div className="text-center py-16 px-4">
                    <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto">
                        <div className="bg-blue-50 p-6 rounded-full">
                            <Wrench className="h-16 w-16 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900">No Service Requests Yet</h3>
                        <p className="text-gray-500 text-base leading-relaxed">
                            Get started by creating your first service request. Click the button below to begin.
                        </p>
                        <button
                            onClick={() => setIsFormExpanded(true)}
                            className="mt-4 inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Create First Request
                        </button>
                    </div>
                </div>
            )}

            {/* Optional Loading State */}
            {/* {isLoading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                </div>
            )} */}

            {/* Optional Error State */}
            {/* {error && (
                <div className="text-center py-16">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="bg-red-50 p-4 rounded-full">
                            <AlertCircle className="h-12 w-12 text-red-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Unable to Load Services</h3>
                        <p className="text-gray-500 max-w-sm">
                            There was an error loading your service requests. Please try again.
                        </p>
                        <button
                            onClick={fetchServices}
                            className="mt-2 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default TenantServices;