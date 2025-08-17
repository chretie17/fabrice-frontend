import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronUp,
  Search,
  Save,
  AlertCircle,
  TrendingUp,
  Award,
  History,
  BarChart3,
  Filter,
  Download,
  Edit3,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  Calendar as CalendarIcon
} from 'lucide-react';

// Simple Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`}>
      {type === 'success' && <CheckCircle className="h-5 w-5" />}
      {type === 'error' && <XCircle className="h-5 w-5" />}
      {type === 'info' && <AlertCircle className="h-5 w-5" />}
      <span>{message}</span>
    </div>
  );
};

const AttendanceComponent = ({ 
  selectedBatch, 
  students = [], 
  userId 
}) => {
  const [activeView, setActiveView] = useState('mark'); // 'mark', 'history', 'summary'
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // History pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [historyFilters, setHistoryFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    limit: 20
  });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (selectedBatch) {
      fetchAttendanceData();
      fetchAttendanceDates();
      fetchAttendanceSummary();
      fetchAttendanceStats();
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (selectedBatch && selectedDate) {
      fetchAttendanceForDate(selectedBatch.id, selectedDate);
    }
  }, [selectedDate, selectedBatch]);

  const fetchAttendanceData = async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      await Promise.all([
        fetchAttendanceForDate(selectedBatch.id, selectedDate),
        fetchAttendanceHistory()
      ]);
    } catch (error) {
      showToast('Failed to fetch attendance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceForDate = async (batchId, date) => {
    try {
      const response = await fetch(`http://localhost:3000/api/attendance/batch/${batchId}/${date}`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      const data = await response.json();
      
      // Initialize attendance records for all students
      if (students.length > 0) {
        const records = students.map(student => {
          const existing = data.find(a => a.student_id === student.student_id || a.student_id === student.id);
          return {
            student_id: student.student_id || student.id,
            student_name: student.student_name || student.name,
            email: student.email,
            status: existing?.status || 'present',
            id: existing?.id || null
          };
        });
        setAttendanceRecords(records);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceRecords([]);
    }
  };

  const fetchAttendanceHistory = async (page = 1) => {
    if (!selectedBatch) return;
    try {
      const offset = (page - 1) * historyFilters.limit;
      let url = `http://localhost:3000/api/attendance/batch/${selectedBatch.id}/history?limit=${historyFilters.limit}&offset=${offset}`;
      
      if (historyFilters.startDate) url += `&start_date=${historyFilters.startDate}`;
      if (historyFilters.endDate) url += `&end_date=${historyFilters.endDate}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch attendance history');
      const data = await response.json();
      
      setAttendanceHistory(data.attendance || []);
      setTotalPages(Math.ceil(data.pagination.total / historyFilters.limit));
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      setAttendanceHistory([]);
    }
  };

  const fetchAttendanceDates = async () => {
    if (!selectedBatch) return;
    try {
      const response = await fetch(`http://localhost:3000/api/attendance/batch/${selectedBatch.id}/dates`);
      if (!response.ok) throw new Error('Failed to fetch attendance dates');
      const data = await response.json();
      setAttendanceDates(data);
    } catch (error) {
      console.error('Error fetching attendance dates:', error);
    }
  };

  const fetchAttendanceSummary = async () => {
    if (!selectedBatch) return;
    try {
      const response = await fetch(`http://localhost:3000/api/attendance/batch/${selectedBatch.id}/summary`);
      if (!response.ok) throw new Error('Failed to fetch attendance summary');
      const data = await response.json();
      setAttendanceSummary(data);
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    }
  };

  const fetchAttendanceStats = async () => {
    if (!selectedBatch) return;
    try {
      const response = await fetch(`http://localhost:3000/api/attendance/batch/${selectedBatch.id}/stats`);
      if (!response.ok) throw new Error('Failed to fetch attendance stats');
      const data = await response.json();
      setAttendanceStats(data);
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  const updateAttendanceStatus = (studentId, status) => {
    setAttendanceRecords(prev => prev.map(record => 
      record.student_id === studentId ? { ...record, status } : record
    ));
  };

  const handleMarkAttendance = async () => {
    if (!selectedBatch) {
      showToast('Please select a batch first', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_id: selectedBatch.id,
          date: selectedDate,
          attendance_records: attendanceRecords.map(r => ({
            student_id: r.student_id,
            status: r.status
          })),
          marked_by: userId
        }),
      });

      if (!response.ok) throw new Error('Failed to mark attendance');
      
      showToast('Attendance marked successfully!', 'success');
      
      // Refresh all data
      await fetchAttendanceData();
      await fetchAttendanceDates();
      await fetchAttendanceSummary();
      await fetchAttendanceStats();
    } catch (error) {
      console.error('Error marking attendance:', error);
      showToast('Failed to mark attendance. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStats = () => {
    if (!attendanceRecords.length) return { present: 0, absent: 0, late: 0, total: 0 };
    
    const stats = attendanceRecords.reduce((acc, record) => {
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

  const getAttendanceMessage = () => {
    const stats = getAttendanceStats();
    if (stats.total === 0) return { message: '', type: '' };
    
    const presentPercentage = (stats.present / stats.total) * 100;
    
    if (presentPercentage >= 90) {
      return { message: 'Excellent Attendance! 🎉', type: 'excellent' };
    } else if (presentPercentage >= 75) {
      return { message: 'Very Good Attendance! 👍', type: 'good' };
    } else if (presentPercentage >= 60) {
      return { message: 'Good Attendance', type: 'average' };
    } else {
      return { message: 'Poor Attendance - Needs Attention', type: 'poor' };
    }
  };

  const filteredRecords = attendanceRecords.filter(record => 
    record.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHistory = attendanceHistory.filter(record => {
    const matchesSearch = record.student_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !historyFilters.status || record.status === historyFilters.status;
    return matchesSearch && matchesStatus;
  });

  const stats = getAttendanceStats();
  const attendanceMessage = getAttendanceMessage();

  if (!selectedBatch) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Batch Selected</h3>
        <p className="text-gray-600">Please select a batch to manage attendance</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Attendance - {selectedBatch.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{selectedBatch.course_name}</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveView('mark')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeView === 'mark' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Plus className="h-4 w-4 inline mr-1" />
                Mark
              </button>
              <button
                onClick={() => setActiveView('history')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeView === 'history' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <History className="h-4 w-4 inline mr-1" />
                History
              </button>
              <button
                onClick={() => setActiveView('summary')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeView === 'summary' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-1" />
                Summary
              </button>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-lg font-bold text-blue-600">{attendanceStats.total_days || 0}</p>
            <p className="text-sm text-blue-700">Total Days</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
            <p className="text-lg font-bold text-green-600">{attendanceStats.total_present || 0}</p>
            <p className="text-sm text-green-700">Total Present</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
            <p className="text-lg font-bold text-red-600">{attendanceStats.total_absent || 0}</p>
            <p className="text-sm text-red-700">Total Absent</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
            <p className="text-lg font-bold text-yellow-600">{attendanceStats.total_late || 0}</p>
            <p className="text-sm text-yellow-700">Total Late</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <p className="text-lg font-bold text-purple-600">{attendanceStats.avg_attendance_rate || 0}%</p>
            <p className="text-sm text-purple-700">Avg Rate</p>
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Mark Attendance View */}
          {activeView === 'mark' && (
            <div className="space-y-6">
              {/* Date Selection and Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Mark Attendance</h4>
                  <div className="flex items-center space-x-3">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => fetchAttendanceForDate(selectedBatch.id, selectedDate)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Today's Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                    <p className="text-sm text-green-700">Present</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <div className="flex items-center justify-center mb-2">
                      <XCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                    <p className="text-sm text-red-700">Absent</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-6 w-6 text-yellow-500" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                    <p className="text-sm text-yellow-700">Late</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-sm text-blue-700">Total</p>
                  </div>
                </div>

                {/* Attendance Quality Message */}
                {attendanceMessage.message && (
                  <div className={`p-4 rounded-lg text-center mb-4 ${
                    attendanceMessage.type === 'excellent' ? 'bg-green-100 text-green-800 border border-green-200' :
                    attendanceMessage.type === 'good' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    attendanceMessage.type === 'average' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    <div className="flex items-center justify-center space-x-2">
                      {attendanceMessage.type === 'excellent' && <Award className="h-5 w-5" />}
                      {attendanceMessage.type === 'good' && <TrendingUp className="h-5 w-5" />}
                      {attendanceMessage.type === 'poor' && <AlertCircle className="h-5 w-5" />}
                      <span className="font-semibold">{attendanceMessage.message}</span>
                    </div>
                    <p className="text-sm mt-1">
                      Attendance Rate: {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
                    </p>
                  </div>
                )}
              </div>

              {/* Mark Attendance Form */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-medium text-gray-900">Student List</h4>
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
                    <button
                      onClick={handleMarkAttendance}
                      disabled={loading}
                      className={`px-6 py-2 rounded-md text-white font-medium flex items-center space-x-2 ${
                        loading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <Save className="h-4 w-4" />
                      <span>{loading ? 'Saving...' : 'Save Attendance'}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Quick Actions:</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setAttendanceRecords(prev => prev.map(r => ({ ...r, status: 'present' })))}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={() => setAttendanceRecords(prev => prev.map(r => ({ ...r, status: 'absent' })))}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
                    >
                      Mark All Absent
                    </button>
                    <button
                      onClick={() => setAttendanceRecords(prev => prev.map(r => ({ ...r, status: 'late' })))}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200"
                    >
                      Mark All Late
                    </button>
                  </div>
                </div>

                {/* Student List */}
                <div className="space-y-3">
                  {filteredRecords.map((record) => (
                    <div key={record.student_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {record.student_name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{record.student_name}</p>
                          <p className="text-sm text-gray-500">{record.email}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {['present', 'absent', 'late'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateAttendanceStatus(record.student_id, status)}
                            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                              record.status === status
                                ? status === 'present' ? 'bg-green-500 text-white' :
                                  status === 'absent' ? 'bg-red-500 text-white' :
                                  'bg-yellow-500 text-white'
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

                {filteredRecords.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No students found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attendance History View */}
          {activeView === 'history' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Attendance History</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={historyFilters.startDate}
                      onChange={(e) => setHistoryFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={historyFilters.endDate}
                      onChange={(e) => setHistoryFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={historyFilters.status}
                      onChange={(e) => setHistoryFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
                    <select
                      value={historyFilters.limit}
                      onChange={(e) => setHistoryFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => fetchAttendanceHistory(1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Apply Filters</span>
                  </button>
                  <div className="relative flex-1 max-w-md">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search in results..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* History Table */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marked By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredHistory.map((record) => (
                        <tr key={`${record.student_id}-${record.date}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-xs font-medium text-blue-600">
                                  {record.student_name?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{record.student_name}</div>
                                <div className="text-xs text-gray-500">{record.student_email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.status === 'present' ? 'bg-green-100 text-green-800' :
                              record.status === 'absent' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.marked_by_name || 'System'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.created_at ? new Date(record.created_at).toLocaleTimeString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredHistory.length === 0 && (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No attendance history found</p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => fetchAttendanceHistory(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => fetchAttendanceHistory(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attendance Summary View */}
          {activeView === 'summary' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-6">Attendance Summary</h4>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Days</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceSummary.map((student) => (
                      <tr key={student.student_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-xs font-medium text-blue-600">
                                {student.student_name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                              <div className="text-xs text-gray-500">{student.student_email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.total_days}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{student.present_days}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{student.absent_days}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">{student.late_days}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${
                              student.attendance_percentage >= 90 ? 'text-green-600' :
                              student.attendance_percentage >= 75 ? 'text-blue-600' :
                              student.attendance_percentage >= 60 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {student.attendance_percentage}%
                            </span>
                            <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  student.attendance_percentage >= 90 ? 'bg-green-500' :
                                  student.attendance_percentage >= 75 ? 'bg-blue-500' :
                                  student.attendance_percentage >= 60 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${student.attendance_percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.last_attendance_date ? new Date(student.last_attendance_date).toLocaleDateString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {attendanceSummary.length === 0 && (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No attendance summary available</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceComponent;