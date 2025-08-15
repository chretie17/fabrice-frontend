import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, Calendar, Users, Eye } from 'lucide-react';

const AssignmentManagement = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({});
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseAssignments(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourse(data[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseAssignments = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/courses/assignments/${assignmentId}/submissions`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      let url, method;
      
      if (modalType === 'create') {
        url = `http://localhost:3000/api/courses/${selectedCourse}/assignments`;
        method = 'POST';
      } else if (modalType === 'edit') {
        url = `http://localhost:3000/api/courses/assignments/${selectedAssignment.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Assignment saved successfully');
        setShowModal(false);
        setFormData({});
        fetchCourseAssignments(selectedCourse);
      } else {
        const error = await response.json();
        alert(error.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Operation failed');
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/courses/assignments/${assignmentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Assignment deleted successfully');
        fetchCourseAssignments(selectedCourse);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete');
    }
  };

  const openModal = (type, assignment = null) => {
    setModalType(type);
    setSelectedAssignment(assignment);
    if (assignment) {
      setFormData({
        ...assignment,
        due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({});
    }
    setShowModal(true);
  };

  const openSubmissionsModal = (assignment) => {
    setSelectedAssignment(assignment);
    fetchSubmissions(assignment.id);
    setShowSubmissionsModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSubmissionDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSelectedCourseName = () => {
    const course = courses.find(c => c.id.toString() === selectedCourse);
    return course ? course.name : '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Assignment Management</h2>
          <p className="text-sm text-gray-600">Create and manage course assignments</p>
        </div>
        <button
          onClick={() => openModal('create')}
          disabled={!selectedCourse}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Assignment
        </button>
      </div>

      {/* Course Selection */}
      {courses.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="block w-full sm:w-64 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Assignments List */}
      {selectedCourse ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Assignments for "{getSelectedCourseName()}"
          </h3>
          
          {assignments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No assignments created yet for this course</p>
              <button
                onClick={() => openModal('create')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Assignment
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openSubmissionsModal(assignment)}
                        className="text-green-600 hover:text-green-800"
                        title="View Submissions"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openModal('edit', assignment)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Assignment"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Assignment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{assignment.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{assignment.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Due: {formatDate(assignment.due_date)}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Max Points: {assignment.max_points}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    Created: {formatDate(assignment.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Please select a course to view and manage assignments</p>
        </div>
      )}

      {/* Assignment Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {modalType === 'create' ? 'Create Assignment' : 'Edit Assignment'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assignment Title *</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Provide detailed instructions for the assignment..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="datetime-local"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.due_date || ''}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maximum Points</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.max_points || '100'}
                    onChange={(e) => setFormData({...formData, max_points: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {modalType === 'create' ? 'Create' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {showSubmissionsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-5xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Submissions for "{selectedAssignment?.title}"
                  </h3>
                  <p className="text-sm text-gray-600">
                    Due: {formatDate(selectedAssignment?.due_date)} | Max Points: {selectedAssignment?.max_points}
                  </p>
                </div>
                <button
                  onClick={() => setShowSubmissionsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No submissions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">
                        Total Submissions: {submissions.length}
                      </p>
                    </div>
                    
                    {submissions.map((submission) => (
                      <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="text-md font-medium text-gray-900">
                              {submission.student_name}
                            </h5>
                            <p className="text-sm text-gray-600">{submission.student_email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              Submitted: {formatSubmissionDate(submission.submitted_date)}
                            </p>
                            {submission.points_earned !== null && (
                              <p className="text-sm font-medium text-green-600">
                                Score: {submission.points_earned}/{selectedAssignment?.max_points}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {submission.submission_text && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Submission Text:</p>
                            <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                              {submission.submission_text}
                            </div>
                          </div>
                        )}
                        
                        {submission.file_path && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">File Attachment:</p>
                            <a
                              href={submission.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View Submitted File
                            </a>
                          </div>
                        )}
                        
                        {submission.feedback && (
                          <div className="bg-blue-50 p-3 rounded">
                            <p className="text-sm font-medium text-blue-900 mb-1">Instructor Feedback:</p>
                            <p className="text-sm text-blue-800">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;