import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Clock,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  Plus,
  Eye,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  AlertCircle,
  Award,
  TrendingUp,
  Settings
} from 'lucide-react';

// Import the CourseManagement component - make sure the path is correct
import CourseManagement from './InstructorCourses'; // Fixed import path

const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');

  // Get instructor ID from localStorage
  const userId = localStorage.getItem('userId') || '1';

  useEffect(() => {
    fetchInstructorData();
  }, []);

  const fetchInstructorData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        fetchBatches(),
        fetchCourses()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/batches');
      if (!response.ok) throw new Error('Failed to fetch batches');
      const data = await response.json();
      // Filter batches for this instructor
      const instructorBatches = data.filter(batch => batch.instructor_id === parseInt(userId));
      setBatches(instructorBatches);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchBatchStudents = async (batchId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/enrollments/batch/${batchId}/students`);
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAttendance = async (batchId, date) => {
    try {
      const response = await fetch(`http://localhost:3000/api/attendance/batch/${batchId}/${date}`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      const data = await response.json();
      setAttendanceData(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const markAttendance = async (attendanceRecords) => {
    try {
      const response = await fetch('http://localhost:3000/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batch_id: selectedBatch.id,
          date: selectedDate,
          attendance_records: attendanceRecords,
          marked_by: userId
        }),
      });

      if (!response.ok) throw new Error('Failed to mark attendance');
      await fetchAttendance(selectedBatch.id, selectedDate);
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError('Failed to mark attendance');
    }
  };

  const fetchAssignments = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/courses/${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch assignments');
      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/courses/assignments/${assignmentId}/submissions`);
      if (!response.ok) throw new Error('Failed to fetch submissions');
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);
    fetchBatchStudents(batch.id);
    fetchAttendance(batch.id, selectedDate);
    
    // Find course for this batch and fetch assignments
    const course = courses.find(c => c.name === batch.course_name);
    if (course) {
      fetchAssignments(course.id);
    }
  };

  const filteredStudents = students.filter(student => 
    student.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAttendanceStats = () => {
    if (!attendanceData.length) return { present: 0, absent: 0, late: 0, total: 0 };
    
    const stats = attendanceData.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      acc.total++;
      return acc;
    }, {});

    return {
      present: stats.present || 0,
      absent: stats.absent || 0,
      late: stats.late || 0,
      total: stats.total || 0
    };
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Batches</p>
              <p className="text-2xl font-bold text-gray-900">{batches.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {batches.reduce((total, batch) => total + (batch.current_students || 0), 0)}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ongoing Batches</p>
              <p className="text-2xl font-bold text-gray-900">
                {batches.filter(b => b.status === 'ongoing').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Batches */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">My Batches</h3>
        <div className="space-y-4">
          {batches.map((batch) => (
            <div key={batch.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                 onClick={() => handleBatchSelect(batch)}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{batch.name}</h4>
                  <p className="text-sm text-gray-600">{batch.course_name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">{batch.current_students}/{batch.max_students}</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    batch.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    batch.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {batch.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AttendanceTab = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const attendanceStats = getAttendanceStats();

    useEffect(() => {
      if (selectedBatch && students.length > 0) {
        const records = students.map(student => {
          const existing = attendanceData.find(a => a.student_id === student.student_id);
          return {
            student_id: student.student_id,
            student_name: student.student_name,
            status: existing?.status || 'present'
          };
        });
        setAttendanceRecords(records);
      }
    }, [selectedBatch, students, attendanceData]);

    const updateAttendanceStatus = (studentId, status) => {
      setAttendanceRecords(prev => prev.map(record => 
        record.student_id === studentId ? { ...record, status } : record
      ));
    };

    const handleMarkAttendance = () => {
      markAttendance(attendanceRecords);
    };

    if (!selectedBatch) {
      return (
        <div className="text-center py-8">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please select a batch to mark attendance</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Batch and Date Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Attendance for {selectedBatch.name}</h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                fetchAttendance(selectedBatch.id, e.target.value);
              }}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          {/* Attendance Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
              <p className="text-sm text-green-700">Present</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
              <p className="text-sm text-red-700">Absent</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</p>
              <p className="text-sm text-yellow-700">Late</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{attendanceStats.total}</p>
              <p className="text-sm text-blue-700">Total</p>
            </div>
          </div>
        </div>

        {/* Attendance List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Mark Attendance</h4>
            <button
              onClick={handleMarkAttendance}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Save Attendance</span>
            </button>
          </div>

          <div className="space-y-3">
            {attendanceRecords.map((record) => (
              <div key={record.student_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{record.student_name}</p>
                </div>
                <div className="flex space-x-2">
                  {['present', 'absent', 'late'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateAttendanceStatus(record.student_id, status)}
                      className={`px-3 py-1 rounded-full text-sm capitalize ${
                        record.status === status
                          ? status === 'present' ? 'bg-green-100 text-green-800' :
                            status === 'absent' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };


  const StudentsTab = () => (
    <div className="space-y-6">
      {selectedBatch ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Students in {selectedBatch.name}</h3>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrolled Date
                  </th>

                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {student.student_name?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.student_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.status === 'enrolled' ? 'bg-green-100 text-green-800' :
                        student.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.enrolled_date ? new Date(student.enrolled_date).toLocaleDateString() : '-'}
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please select a batch to view students</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
              <p className="text-gray-600">Manage your courses, batches, and students</p>
            </div>
            {selectedBatch && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Selected Batch</p>
                <p className="font-medium">{selectedBatch.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="overview">Overview</option>
              <option value="course-management">Course Management</option>
              <option value="attendance">Attendance</option>
              <option value="students">Students</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'course-management', name: 'Course Management', icon: BookOpen }, // Added Course Management tab
                { id: 'attendance', name: 'Attendance', icon: UserCheck },
                { id: 'students', name: 'Students', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'course-management' && ( // Added Course Management tab content
          <CourseManagement 
            selectedBatch={selectedBatch}
            onClose={() => setActiveTab('overview')}
          />
        )}
        {activeTab === 'attendance' && <AttendanceTab />}
        {activeTab === 'students' && <StudentsTab />}
      </div>
    </div>
  );
};

export default InstructorDashboard;