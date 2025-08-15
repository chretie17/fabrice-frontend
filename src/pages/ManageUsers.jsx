import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BackendPort from '../api';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { PlusCircle, X, Users, Edit2, UserX, UserCheck, Trash2, Menu } from 'lucide-react';

const Alert = React.forwardRef((props, ref) => {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', role: 'tenant' });
    const [editingUser, setEditingUser] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showActions, setShowActions] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(BackendPort.getApiUrl('users'));
            setUsers(response.data);
        } catch (error) {
            showSnackbar('Error fetching users.', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ open: false, message: '', severity: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await axios.put(BackendPort.getApiUrl(`users/${editingUser.id}`), formData);
                showSnackbar('User updated successfully!', 'success');
            } else {
                await axios.post(BackendPort.getApiUrl('users'), formData);
                showSnackbar('User added successfully!', 'success');
            }
            resetForm();
            fetchUsers();
        } catch (error) {
            showSnackbar('Error saving user.', 'error');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', username: '', email: '', password: '', role: 'student' });
        setEditingUser(null);
        setShowForm(false);
    };

    const toggleActions = (userId) => {
        setShowActions(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(BackendPort.getApiUrl(`users/${id}`));
            showSnackbar('User deleted successfully!', 'success');
            fetchUsers();
        } catch (error) {
            showSnackbar('Error deleting user.', 'error');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({ name: user.name, username: user.username, email: user.email, password: '', role: user.role });
        setShowForm(true);
    };

    const handleBlockUser = async (id) => {
        try {
            await axios.put(BackendPort.getApiUrl(`users/${id}/block`));
            showSnackbar('User blocked successfully!', 'success');
            fetchUsers();
        } catch (error) {
            showSnackbar('Error blocking user.', 'error');
        }
    };

    const handleUnblockUser = async (id) => {
        try {
            await axios.put(BackendPort.getApiUrl(`users/${id}/unblock`));
            showSnackbar('User unblocked successfully!', 'success');
            fetchUsers();
        } catch (error) {
            showSnackbar('Error unblocking user.', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div className="flex items-center space-x-3">
                            <Users size={24} className="text-[#123679]" />
                            <h1 className="text-xl sm:text-2xl font-bold text-[#123679]">Manage Users</h1>
                        </div>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#123679] hover:bg-[#0f2d66] text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                                <PlusCircle size={20} />
                                <span>Add User</span>
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <div className="mb-6 bg-gray-50 rounded-lg p-3 sm:p-6 relative">
                            <button
                                onClick={resetForm}
                                className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-[#123679]">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-[#123679] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-[#123679] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-[#123679] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required={!editingUser}
                                            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-[#123679] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-[#123679] focus:border-transparent"
                                        >
                                            <option value="student">Student</option>
                                            <option value="instructor">Instructor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-[#123679] hover:bg-[#0f2d66] text-white rounded-lg"
                                    >
                                        {editingUser ? 'Update User' : 'Add User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Name</th>
                                    <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                                    <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                    <th className="hidden lg:table-cell px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{user.name}</td>
                                        <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-900">{user.username}</td>
                                        <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-900">{user.email}</td>
                                        <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-900">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#123679] bg-opacity-10 text-[#123679]">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.is_blocked 
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {user.is_blocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-2 sm:px-4 py-3 text-sm relative">
                                            <div className="sm:hidden">
                                                <button
                                                    onClick={() => toggleActions(user.id)}
                                                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                                >
                                                    <Menu size={18} />
                                                </button>
                                                {showActions[user.id] && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => {
                                                                    handleEdit(user);
                                                                    toggleActions(user.id);
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    user.is_blocked ? handleUnblockUser(user.id) : handleBlockUser(user.id);
                                                                    toggleActions(user.id);
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                {user.is_blocked ? 'Unblock' : 'Block'}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleDelete(user.id);
                                                                    toggleActions(user.id);
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="hidden sm:flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-1 text-[#123679] hover:bg-[#123679] hover:bg-opacity-10 rounded"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                {user.is_blocked ? (
                                                    <button
                                                    onClick={() => handleUnblockUser(user.id)}
                                                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                    title="Unblock"
                                                >
                                                    <UserCheck size={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleBlockUser(user.id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    title="Block"
                                                >
                                                    <UserX size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                {snackbar.message}
            </Alert>
        </Snackbar>
    </div>
);
};

export default ManageUsers;