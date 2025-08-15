import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BackendPort from '../api';
import { Snackbar, Alert } from '@mui/material';
import { AlertTriangle, CheckCircle2, User2, Trophy } from 'lucide-react';

const AdminServices = () => {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [managers, setManagers] = useState([]);
    const [filters, setFilters] = useState({ floor: '', status: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

    useEffect(() => {
        fetchServices();
        fetchManagers();
    }, []);

    // Apply filters whenever services or filters change
    useEffect(() => {
        filterServices();
    }, [services, filters]);

    const filterServices = () => {
        let filtered = [...services];

        // Filter by floor
        if (filters.floor) {
            filtered = filtered.filter(service => {
                const floors = service.floors.split(',').map(f => f.trim());
                return floors.includes(filters.floor.toString());
            });
        }

        // Filter by status
        if (filters.status) {
            filtered = filtered.filter(service => service.status === filters.status);
        }

        setFilteredServices(filtered);
    };

    const fetchServices = async () => {
        try {
            const response = await axios.get(BackendPort.getApiUrl('services'));
            const updatedServices = response.data.map((service) => ({
                ...service,
                floors: service.floors ? service.floors : '',
                room_numbers: service.room_numbers ? service.room_numbers : '',
            }));
            setServices(updatedServices);
        } catch (error) {
            showSnackbar('Error fetching services', 'error');
            console.error('Error fetching services:', error);
        }
    };

    const fetchManagers = async () => {
        try {
            const response = await axios.get(BackendPort.getApiUrl('users'));
            setManagers(response.data.filter((user) => user.role === 'manager'));
        } catch (error) {
            showSnackbar('Error fetching managers', 'error');
            console.error('Error fetching managers:', error);
        }
    };

    const handleUpdate = async (id, updates) => {
        try {
            if (updates.resolved_by) {
                updates.status = 'Completed';
            }
            await axios.put(BackendPort.getApiUrl('services'), { id, ...updates });
            showSnackbar('Service updated successfully!', 'success');
            fetchServices();
        } catch (error) {
            showSnackbar('Error updating service', 'error');
            console.error('Error updating service:', error);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ open: false, message: '', severity: '' });
    };

    const ServiceCard = ({ service }) => (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                    <span className="text-sm text-gray-600">Type:</span>
                    <p className="font-medium">{service.service_type}</p>
                </div>
                <div>
                    <span className="text-sm text-gray-600">Floor:</span>
                    <p className="font-medium">Floor {service.floors}</p>
                </div>
                <div>
                    <span className="text-sm text-gray-600">Room:</span>
                    <p className="font-medium">{service.room_numbers}</p>
                </div>
                <div>
                    <span className="text-sm text-gray-600">Priority:</span>
                    <p className="font-medium">{service.priority}</p>
                </div>
            </div>
            <div className="mb-3">
                <span className="text-sm text-gray-600">Description:</span>
                <p className="font-medium">{service.description}</p>
            </div>
            <div className="space-y-3">
                <div>
                    <span className="text-sm text-gray-600">Status:</span>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                            service.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            service.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {service.status}
                        </span>
                    </div>
                </div>
                <div>
                    <span className="text-sm text-gray-600">Assigned Manager:</span>
                    <select
                        value={service.manager_id || ''}
                        onChange={(e) => handleUpdate(service.id, { manager_id: e.target.value })}
                        className="w-full mt-1 border-2 border-[#13377C]/30 rounded-lg p-2 focus:ring-2 focus:ring-[#13377C]/50"
                    >
                        <option value="">Unassigned</option>
                        {managers.map((manager) => (
                            <option key={manager.id} value={manager.id}>
                                {manager.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => handleUpdate(service.id, { priority: 'High' })}
                        className="p-2 text-[#13377C] hover:bg-[#13377C]/10 rounded-lg transition-colors"
                        title="Set High Priority"
                    >
                        <Trophy size={20} />
                    </button>
                    <button
                        onClick={() => handleUpdate(service.id, { resolved_by: localStorage.getItem('userId') })}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Mark Resolved"
                    >
                        <CheckCircle2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-[#13377C] text-white p-4 rounded-b-lg shadow-lg">
                    <h1 className="text-2xl font-bold tracking-tight">Admin Services Dashboard</h1>
                </div>

                {/* Filters */}
                <div className="mt-4 flex gap-4 px-4">
                    <select
                        name="floor"
                        value={filters.floor}
                        onChange={handleFilterChange}
                        className="flex-1 border-2 border-[#13377C]/30 rounded-lg p-2 focus:ring-2 focus:ring-[#13377C]/50 transition-all"
                    >
                        <option value="">All Floors</option>
                        {[...Array(20)].map((_, i) => (
                            <option key={i} value={i + 1}>Floor {i + 1}</option>
                        ))}
                    </select>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="flex-1 border-2 border-[#13377C]/30 rounded-lg p-2 focus:ring-2 focus:ring-[#13377C]/50 transition-all"
                    >
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                {/* Content */}
                <div className="mt-4 px-4">
                    {/* Desktop Table */}
                    <div className="hidden lg:block bg-white rounded-lg shadow-md">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Floor</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Room</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Priority</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Description</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Manager</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredServices.map((service) => (
                                    <tr key={service.id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">{service.service_type}</td>
                                        <td className="px-4 py-3 text-sm">{service.floors}</td>
                                        <td className="px-4 py-3 text-sm">{service.room_numbers}</td>
                                        <td className="px-4 py-3 text-sm">{service.priority}</td>
                                        <td className="px-4 py-3 text-sm">{service.description}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 rounded-full text-sm ${
                                                service.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                service.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {service.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={service.manager_id || ''}
                                                onChange={(e) => handleUpdate(service.id, { manager_id: e.target.value })}
                                                className="w-full border rounded p-1 text-sm focus:ring-2 focus:ring-[#13377C]/50"
                                            >
                                                <option value="">Unassigned</option>
                                                {managers.map((manager) => (
                                                    <option key={manager.id} value={manager.id}>
                                                        {manager.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdate(service.id, { priority: 'High' })}
                                                    className="p-2 text-[#13377C] hover:bg-[#13377C]/10 rounded-lg transition-colors group relative"
                                                >
                                                    <Trophy size={20} />
                                                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Set High Priority
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => handleUpdate(service.id, { resolved_by: localStorage.getItem('userId') })}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors group relative"
                                                >
                                                    <CheckCircle2 size={20} />
                                                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Mark Resolved
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="lg:hidden space-y-4">
                        {filteredServices.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                </div>

                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </div>
        </div>
    );
};

export default AdminServices;