import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BackendPort from '../api';
import { Snackbar, Alert } from '@mui/material';

const ManagerServices = () => {
    const [services, setServices] = useState([]);
    const [filters, setFilters] = useState({ status: '', priority: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

    useEffect(() => {
        fetchServices();
    }, [filters]);

    // Fetch services assigned to the logged-in manager
    const fetchServices = async () => {
        const managerId = localStorage.getItem('userId');
        try {
            const response = await axios.get(BackendPort.getApiUrl('services'));
            const assignedServices = response.data
                .filter(
                    (service) =>
                        service.manager_id === parseInt(managerId) &&
                        (filters.status ? service.status === filters.status : true) &&
                        (filters.priority ? service.priority === filters.priority : true)
                )
                .map((service) => ({
                    ...service,
                    floors: service.floors ? service.floors.split(',') : [],
                    room_numbers: service.room_numbers ? service.room_numbers.split(',') : [],
                }));
            setServices(assignedServices);
        } catch (error) {
            showSnackbar('Error fetching services', 'error');
            console.error('Error fetching services:', error);
        }
    };
    
    // Update a service request
    const handleUpdate = async (id, updates) => {
        try {
            await axios.put(BackendPort.getApiUrl('services'), { id, ...updates });
            showSnackbar('Service updated successfully!', 'success');
            fetchServices();
        } catch (error) {
            showSnackbar('Error updating service', 'error');
            console.error('Error updating service:', error);
        }
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // Snackbar Logic
    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ open: false, message: '', severity: '' });
    };

    // Priority color mapping
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Urgent': return 'bg-red-500';
            case 'High': return 'bg-orange-500';
            case 'Medium': return 'bg-yellow-500';
            case 'Low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="container mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
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

                {/* Header */}
                <div className="bg-[#13377C] text-white p-6">
                    <h1 className="text-3xl font-bold tracking-wide">Manager Services Dashboard</h1>
                </div>

                {/* Filters */}
                <div className="p-6 bg-gray-100 border-b">
                    <div className="flex space-x-4">
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#13377C]/50 focus:border-[#13377C] transition-all duration-300"
                        >
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <select
                            name="priority"
                            value={filters.priority}
                            onChange={handleFilterChange}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#13377C]/50 focus:border-[#13377C] transition-all duration-300"
                        >
                            <option value="">All Priority</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                        </select>
                    </div>
                </div>

                {/* Service Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Type</th>
                                <th className="py-3 px-6 text-left">Floor</th>
                                <th className="py-3 px-6 text-left">Room</th>
                                <th className="py-3 px-6 text-left">Priority</th>
                                <th className="py-3 px-6 text-left">Description</th>
                                <th className="py-3 px-6 text-left">Status</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {services.map((service) => (
                                <tr key={service.id} className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="py-3 px-6 text-left whitespace-nowrap">
                                        <span className="font-medium">{service.service_type}</span>
                                    </td>
                                    <td className="py-3 px-6 text-left">
    <span>{service.floors.join(', ')}</span>
</td>
<td className="py-3 px-6 text-left">
    <span>{service.room_numbers.join(', ')}</span>
</td>

                                    <td className="py-3 px-6 text-left">
                                        <span className={`px-3 py-1 rounded-full text-xs text-white ${getPriorityColor(service.priority)}`}>
                                            {service.priority}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-left">
                                        <span>{service.description}</span>
                                    </td>
                                    <td className="py-3 px-6 text-left">
                                        <select
                                            value={service.status}
                                            onChange={(e) =>
                                                handleUpdate(service.id, { status: e.target.value })
                                            }
                                            className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#13377C]/50 focus:border-[#13377C]"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => handleUpdate(service.id, { priority: 'High' })}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors duration-300 shadow-md hover:shadow-lg"
                                            >
                                                Set High Priority
                                            </button>
                                            <button
                                                onClick={() => handleUpdate(service.id, { resolved_by: localStorage.getItem('userId') })}
                                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md transition-colors duration-300 shadow-md hover:shadow-lg"
                                            >
                                                Mark Resolved
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {services.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p className="text-xl">No services found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerServices;