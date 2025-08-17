import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Clock, 
  Calendar, 
  AlertCircle,
  Eye,
  Award
} from 'lucide-react';
import AssignmentViewer from './AssignmentViewer'; // Import the new component

const CourseManagement = ({ selectedBatch, onClose }) => {
  const [activeTab, setActiveTab] = useState('lessons');
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal states
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showAssignmentViewer, setShowAssignmentViewer] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  
  // Form states
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    video_url: '',
    lesson_order: 1,
    duration: 0
  });
  
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    due_date: '',
    max_points: 100
  });

  const userId = localStorage.getItem('userId') || '1';

  useEffect(() => {
    if (selectedBatch) {
      fetchCourseData();
    }
  }, [selectedBatch]);

  const fetchCourseData = async () => {
    setLoading(true);
    setError('');
    try {
      const courseResponse = await fetch(`http://localhost:3000/api/courses/${selectedBatch.course_id}`);
      if (!courseResponse.ok) throw new Error('Failed to fetch course details');
      const courseData = await courseResponse.json();
      
      setLessons(courseData.lessons || []);
      setAssignments(courseData.assignments || []);
    } catch (error) {
      console.error('Error fetching course data:', error);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  // Lesson Management
  const handleSaveLesson = async () => {
    setLoading(true);
    try {
      const url = editingLesson 
        ? `http://localhost:3000/api/courses/lessons/${editingLesson.id}`
        : `http://localhost:3000/api/courses/${selectedBatch.course_id}/lessons`;
      
      const method = editingLesson ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonForm),
      });

      if (!response.ok) throw new Error('Failed to save lesson');
      
      await fetchCourseData();
      setShowLessonModal(false);
      setEditingLesson(null);
      setLessonForm({ title: '', content: '', video_url: '', lesson_order: 1, duration: 0 });
    } catch (error) {
      console.error('Error saving lesson:', error);
      setError('Failed to save lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/courses/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete lesson');
      await fetchCourseData();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setError('Failed to delete lesson');
    }
  };

  // Assignment Management
  const handleSaveAssignment = async () => {
    setLoading(true);
    try {
      const url = editingAssignment 
        ? `http://localhost:3000/api/courses/assignments/${editingAssignment.id}`
        : `http://localhost:3000/api/courses/${selectedBatch.course_id}/assignments`;
      
      const method = editingAssignment ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentForm),
      });

      if (!response.ok) throw new Error('Failed to save assignment');
      
      await fetchCourseData();
      setShowAssignmentModal(false);
      setEditingAssignment(null);
      setAssignmentForm({ title: '', description: '', due_date: '', max_points: 100 });
    } catch (error) {
      console.error('Error saving assignment:', error);
      setError('Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/courses/assignments/${assignmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete assignment');
      await fetchCourseData();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setError('Failed to delete assignment');
    }
  };

  const openEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      content: lesson.content || '',
      video_url: lesson.video_url || '',
      lesson_order: lesson.lesson_order,
      duration: lesson.duration || 0
    });
    setShowLessonModal(true);
  };

  const openEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      title: assignment.title,
      description: assignment.description || '',
      due_date: assignment.due_date ? assignment.due_date.split('T')[0] : '',
      max_points: assignment.max_points
    });
    setShowAssignmentModal(true);
  };

  const openAssignmentViewer = (assignmentId) => {
    setSelectedAssignmentId(assignmentId);
    setShowAssignmentViewer(true);
  };

  if (!selectedBatch) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Please select a batch to manage course content</p>
      </div>
    );
  }

  // Show Assignment Viewer if selected
  if (showAssignmentViewer && selectedAssignmentId) {
    return (
      <AssignmentViewer
        assignmentId={selectedAssignmentId}
        onClose={() => {
          setShowAssignmentViewer(false);
          setSelectedAssignmentId(null);
        }}
        showGrading={true}
        showSubmissions={true}
        currentUserId={userId}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Course Management</h2>
          <p className="text-gray-600">{selectedBatch.name} - {selectedBatch.course_name}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex px-6">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`py-4 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'lessons'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Lessons ({lessons.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-4 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'assignments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Assignments ({assignments.length})</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'lessons' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Course Lessons</h3>
              <button
                onClick={() => setShowLessonModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Lesson</span>
              </button>
            </div>

            <div className="space-y-3">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          Lesson {lesson.lesson_order}
                        </span>
                        <h4 className="font-medium">{lesson.title}</h4>
                      </div>
                      {lesson.content && (
                        <p className="text-sm text-gray-600 mb-2">{lesson.content}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {lesson.duration && (
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{lesson.duration} min</span>
                          </span>
                        )}
                        {lesson.video_url && (
                          <span className="text-blue-600">Has Video</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditLesson(lesson)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Course Assignments</h3>
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Assignment</span>
              </button>
            </div>

            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{assignment.title}</h4>
                      {assignment.description && (
                        <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Award className="h-4 w-4" />
                          <span>{assignment.max_points} points</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openAssignmentViewer(assignment.id)}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200 flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View & Grade</span>
                      </button>
                      <button
                        onClick={() => openEditAssignment(assignment)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </h3>
              <button
                onClick={() => {
                  setShowLessonModal(false);
                  setEditingLesson(null);
                  setLessonForm({ title: '', content: '', video_url: '', lesson_order: 1, duration: 0 });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL
                </label>
                <input
                  type="url"
                  value={lessonForm.video_url}
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lesson Order
                  </label>
                  <input
                    type="number"
                    value={lessonForm.lesson_order}
                    onChange={(e) => setLessonForm({ ...lessonForm, lesson_order: parseInt(e.target.value) })}
                    min="1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) })}
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowLessonModal(false);
                  setEditingLesson(null);
                  setLessonForm({ title: '', content: '', video_url: '', lesson_order: 1, duration: 0 });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLesson}
                disabled={!lessonForm.title || loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Lesson'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
              </h3>
              <button
                onClick={() => {
                  setShowAssignmentModal(false);
                  setEditingAssignment(null);
                  setAssignmentForm({ title: '', description: '', due_date: '', max_points: 100 });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={assignmentForm.due_date}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Points
                  </label>
                  <input
                    type="number"
                    value={assignmentForm.max_points}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, max_points: parseInt(e.target.value) })}
                    min="1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignmentModal(false);
                  setEditingAssignment(null);
                  setAssignmentForm({ title: '', description: '', due_date: '', max_points: 100 });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAssignment}
                disabled={!assignmentForm.title || loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Assignment'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;