import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BookOpen, Users, Calendar, Clock, Clock1 } from 'lucide-react';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({});
  const [showLessonsModal, setShowLessonsModal] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [lessonFormData, setLessonFormData] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseLessons = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setLessons(data.lessons || []);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      let url, method;
      
      if (modalType === 'create') {
        url = 'http://localhost:3000/api/courses';
        method = 'POST';
      } else if (modalType === 'edit') {
        url = `http://localhost:3000/api/courses/${selectedCourse.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Course saved successfully');
        setShowModal(false);
        setFormData({});
        fetchCourses();
      } else {
        const error = await response.json();
        alert(error.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Operation failed');
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Course deleted successfully');
        fetchCourses();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete');
    }
  };

  const handleLessonSubmit = async () => {
    try {
      const url = `http://localhost:3000/api/courses/${selectedCourse.id}/lessons`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonFormData)
      });

      if (response.ok) {
        alert('Lesson added successfully');
        setLessonFormData({});
        fetchCourseLessons(selectedCourse.id);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add lesson');
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
      alert('Failed to add lesson');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/courses/lessons/${lessonId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Lesson deleted successfully');
        fetchCourseLessons(selectedCourse.id);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete lesson');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Failed to delete lesson');
    }
  };

  const openModal = (type, course = null) => {
    setModalType(type);
    setSelectedCourse(course);
    if (course) {
      setFormData(course);
    } else {
      setFormData({});
    }
    setShowModal(true);
  };

  const openLessonsModal = (course) => {
    setSelectedCourse(course);
    fetchCourseLessons(course.id);
    setShowLessonsModal(true);
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
      draft: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Course Management</h2>
        <button
          onClick={() => openModal('create')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </button>
      </div>

      {/* Course Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
              {getStatusBadge(course.status)}
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">{course.name}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Duration: {course.duration}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Lessons: {course.lesson_count || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Assignments: {course.assignment_count || 0}
                </span>
              </div>
              <div className="text-lg font-semibold text-green-600">
                RWF {course.price || 0}
              </div>
            </div>
            
            <div className="flex space-x-2 mb-3">
              <button
                onClick={() => openModal('edit', course)}
                className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => openLessonsModal(course)}
                className="flex-1 text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Lessons
              </button>
              <button
                onClick={() => handleDelete(course.id)}
                className="flex-1 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            </div>
            
            <div className="text-xs text-gray-400">
              Created: {formatDate(course.created_at)}
            </div>
          </div>
        ))}
      </div>

      {/* Course Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {modalType === 'create' ? 'Create Course' : 'Edit Course'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course Name *</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 8 weeks, 3 months"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>

                {modalType === 'edit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.status || 'active'}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                )}
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

      {/* Lessons Modal */}
      {showLessonsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Lessons for "{selectedCourse?.name}"
                </h3>
                <button
                  onClick={() => setShowLessonsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              {/* Add Lesson Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Add New Lesson</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lesson Title *</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={lessonFormData.title || ''}
                      onChange={(e) => setLessonFormData({...lessonFormData, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                    <input
                      type="number"
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={lessonFormData.duration || ''}
                      onChange={(e) => setLessonFormData({...lessonFormData, duration: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <textarea
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={lessonFormData.content || ''}
                      onChange={(e) => setLessonFormData({...lessonFormData, content: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Video URL</label>
                    <input
                      type="url"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={lessonFormData.video_url || ''}
                      onChange={(e) => setLessonFormData({...lessonFormData, video_url: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lesson Order</label>
                    <input
                      type="number"
                      min="1"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={lessonFormData.lesson_order || ''}
                      onChange={(e) => setLessonFormData({...lessonFormData, lesson_order: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={handleLessonSubmit}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Add Lesson
                  </button>
                </div>
              </div>

              {/* Lessons List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {lessons.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No lessons added yet</p>
                ) : (
                  lessons.map((lesson) => (
                    <div key={lesson.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="text-md font-medium text-gray-900">
                            Lesson {lesson.lesson_order}: {lesson.title}
                          </h5>
                          {lesson.content && (
                            <p className="text-sm text-gray-600 mt-1">{lesson.content}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            {lesson.duration && <span>Duration: {lesson.duration} min</span>}
                            {lesson.video_url && <span>Has Video</span>}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;