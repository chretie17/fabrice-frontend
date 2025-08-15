import React, { useState, useEffect } from 'react';
// At the top of your AdminDashboard.js file, add these imports:
import CourseManagement from './adminpages/CoursesManagement';
import AssignmentManagement from './adminpages/AssignmentManagement';
import EnrollmentManagement from './adminpages/Enrollmnet'; // Add this import
import { BarChart3, BookOpen, Calendar, CalendarArrowDown, Clock, FileText, Plus, UserCheck, Users } from 'lucide-react';

// Replace the entire AdminDashboard component with this updated version:
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [batches, setBatches] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCourses(),
        fetchBatches(),
        fetchEnrollments(),
        fetchInstructors(),
        fetchStudents()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Keep all your existing fetch functions (fetchCourses, fetchBatches, etc.)
  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/batches');
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/enrollments');
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/batches/instructors');
      if (response.ok) {
        const data = await response.json();
        setInstructors(data);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/attendance/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Keep your existing batch management functions
  const handleBatchSubmit = async () => {
    try {
      let url, method;
      
      if (modalType === 'create-batch') {
        url = 'http://localhost:3000/api/batches';
        method = 'POST';
      } else if (modalType === 'edit-batch') {
        url = `http://localhost:3000/api/batches/${selectedItem.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Batch saved successfully');
        setShowModal(false);
        setFormData({});
        fetchAllData();
      } else {
        const error = await response.json();
        alert(error.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Operation failed');
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/${type}/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Item deleted successfully');
        fetchAllData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete');
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    if (item) {
      setFormData(item);
    } else {
      setFormData({});
    }
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      enrolled: 'bg-green-100 text-green-800',
      dropped: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    { name: 'Total Courses', value: courses.length, icon: BookOpen, color: 'blue' },
    { name: 'Active Batches', value: batches.filter(b => b.status === 'ongoing' || b.status === 'upcoming').length, icon: Calendar, color: 'green' },
    { name: 'Total Enrollments', value: enrollments.length, icon: Users, color: 'purple' },
    { name: 'Instructors', value: instructors.length, icon: UserCheck, color: 'orange' }
  ];

  // Add pending verifications to stats
  const pendingVerifications = enrollments.filter(e => e.payment_status === 'submitted').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Manage courses, batches, and enrollments</p>
              </div>
              {/* Show pending verifications badge if any */}
              {pendingVerifications > 0 && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded-r-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <span className="font-medium">{pendingVerifications}</span> payment{pendingVerifications > 1 ? 's' : ''} pending verification
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'courses', label: 'Courses', icon: BookOpen },
              { id: 'assignments', label: 'Assignments', icon: FileText },
              { id: 'batches', label: 'Batches', icon: Calendar },
              { 
                id: 'enrollments', 
                label: 'Enrollments', 
                icon: Users,
                badge: pendingVerifications > 0 ? pendingVerifications : null
              }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm relative ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.badge && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats - Updated to include pending verifications */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {stats.map((stat) => (
                <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                          <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {/* Add pending verifications as a stat card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Verifications</dt>
                        <dd className="text-lg font-medium text-gray-900">{pendingVerifications}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Enrollments</h3>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {enrollments.slice(0, 5).map((enrollment, index) => (
                      <li key={enrollment.id}>
                        <div className="relative pb-8">
                          {index !== 4 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                          )}
                          <div className="relative flex space-x-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              enrollment.payment_status === 'submitted' ? 'bg-yellow-500' :
                              enrollment.payment_status === 'verified' ? 'bg-green-500' :
                              enrollment.payment_status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                            }`}>
                              <Users className="h-4 w-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5">
                              <p className="text-sm text-gray-500">
                                <span className="font-medium text-gray-900">{enrollment.student_name}</span>
                                {' '}enrolled in{' '}
                                <span className="font-medium text-gray-900">{enrollment.course_name}</span>
                                {enrollment.payment_status === 'submitted' && (
                                  <span className="ml-2 text-yellow-600 font-medium">• Payment pending verification</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-400">{formatDate(enrollment.enrolled_date)}</p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab - Using external component */}
        {activeTab === 'courses' && <CourseManagement />}

        {/* Assignments Tab - Using external component */}
        {activeTab === 'assignments' && <AssignmentManagement />}

        {/* Batches Tab - Keep existing implementation */}
        {activeTab === 'batches' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Batch Management</h2>
              <button
                onClick={() => openModal('create-batch')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Batch
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {batches.map((batch) => (
                <div key={batch.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    {getStatusBadge(batch.status)}
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{batch.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">Course: {batch.course_name}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <UserCheck className="h-4 w-4 mr-2" />
                      <span>Instructor: {batch.instructor_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Start: {formatDate(batch.start_date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Time: {batch.start_time} - {batch.end_time}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Students: {batch.current_students}/{batch.max_students}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal('edit-batch', batch)}
                      className="flex-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete('batches', batch.id)}
                      className="flex-1 text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enrollments Tab - Now using external component */}
        {activeTab === 'enrollments' && <EnrollmentManagement />}
      </div>

      {/* Batch Modal - Keep existing batch modal implementation */}
      {showModal && modalType.includes('batch') && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {modalType.includes('create') ? 'Create Batch' : 'Edit Batch'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Batch Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.course_id || ''}
                    onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Instructor</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.instructor_id || ''}
                    onChange={(e) => setFormData({...formData, instructor_id: e.target.value})}
                  >
                    <option value="">Select Instructor</option>
                    {instructors.map(instructor => (
                      <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Students</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.max_students || ''}
                    onChange={(e) => setFormData({...formData, max_students: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBatchSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {modalType.includes('create') ? 'Create' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;