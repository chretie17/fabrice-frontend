
import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, User, CreditCard, CheckCircle, AlertCircle, Send, X, InfoIcon, ArrowLeft, PlayCircle, FileText, ChevronRight, ChevronDown, Video, Book, PenTool, Award } from 'lucide-react';

// Course Access Component (embedded)
const CourseAccess = ({ onBack }) => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseContent, setCourseContent] = useState(null);
  const [studentProgress, setStudentProgress] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [assignmentSubmission, setAssignmentSubmission] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(null);

  // Get user ID from localStorage (replace with proper auth)
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/enrollments/student/${userId}`);
      const data = await response.json();
      
      // Filter only verified enrollments
      const verifiedCourses = data.filter(enrollment => 
        enrollment.payment_status === 'verified' && enrollment.status === 'enrolled'
      );
      
      setEnrolledCourses(verifiedCourses);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseContent = async (courseId, batchId) => {
    try {
      setContentLoading(true);
      
      // Fetch course details with lessons and assignments
      const courseResponse = await fetch(`http://localhost:3000/api/courses/${courseId}`);
      const courseData = await courseResponse.json();
      
      // Fetch student progress
      const progressResponse = await fetch(`http://localhost:3000/api/courses/${courseId}/progress/${userId}`);
      const progressData = await progressResponse.json();
      
      setCourseContent(courseData);
      setStudentProgress(progressData);
      setAssignments(courseData.assignments || []);
      
    } catch (error) {
      console.error('Error fetching course content:', error);
    } finally {
      setContentLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    fetchCourseContent(course.course_id, course.batch_id);
  };

  const markLessonComplete = async (lessonId) => {
    try {
      const response = await fetch('http://localhost:3000/api/courses/progress/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: userId,
          lesson_id: lessonId
        })
      });

      if (response.ok) {
        // Refresh progress
        fetchCourseContent(selectedCourse.course_id, selectedCourse.batch_id);
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const submitAssignment = async (assignmentId) => {
    try {
      setSubmittingAssignment(assignmentId);
      
      const response = await fetch('http://localhost:3000/api/courses/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: userId,
          assignment_id: assignmentId,
          submission_text: assignmentSubmission
        })
      });

      if (response.ok) {
        alert('Assignment submitted successfully!');
        setAssignmentSubmission('');
        // Refresh assignments to show submission status
        fetchCourseContent(selectedCourse.course_id, selectedCourse.batch_id);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment');
    } finally {
      setSubmittingAssignment(null);
    }
  };

  const toggleLessonExpansion = (lessonId) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  const getLessonProgress = (lessonId) => {
    return studentProgress.find(p => p.lesson_id === lessonId);
  };

  const getProgressPercentage = () => {
    if (studentProgress.length === 0) return 0;
    const completedLessons = studentProgress.filter(p => p.completed).length;
    return Math.round((completedLessons / studentProgress.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Enrollments
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mt-4">My Courses</h1>
            <p className="text-gray-600">Access your enrolled courses and track progress</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Course List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Enrolled Courses</h2>
              
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No verified courses yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrolledCourses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => handleCourseSelect(course)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedCourse?.id === course.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h3 className="font-medium text-gray-900">{course.course_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{course.batch_name}</p>
                      <div className="flex items-center mt-2 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified Access
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Course Content */}
          <div className="lg:col-span-3">
            {!selectedCourse ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Course</h3>
                <p className="text-gray-600">Choose a course from the sidebar to access its content</p>
              </div>
            ) : contentLoading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Course Header */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{courseContent?.name}</h2>
                      <p className="text-gray-600 mt-1">{courseContent?.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Progress</div>
                      <div className="text-2xl font-bold text-blue-600">{getProgressPercentage()}%</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-500" />
                      Batch: {selectedCourse.batch_name}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      Duration: {courseContent?.duration || 'N/A'}
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-2 text-gray-500" />
                      Lessons: {courseContent?.lessons?.length || 0}
                    </div>
                  </div>
                </div>

                {/* Course Tabs */}
                <div className="bg-white rounded-lg shadow-md">
                  <div className="border-b">
                    <nav className="flex">
                      <button className="px-6 py-4 border-b-2 border-blue-500 text-blue-600 font-medium">
                        <Book className="w-4 h-4 inline mr-2" />
                        Lessons
                      </button>
                      <button className="px-6 py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium">
                        <PenTool className="w-4 h-4 inline mr-2" />
                        Assignments ({assignments.length})
                      </button>
                    </nav>
                  </div>

                  {/* Lessons Content */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {courseContent?.lessons?.map((lesson, index) => {
                        const progress = getLessonProgress(lesson.id);
                        const isCompleted = progress?.completed;
                        const isExpanded = expandedLessons[lesson.id];

                        return (
                          <div key={lesson.id} className="border rounded-lg">
                            <div 
                              className={`flex items-center justify-between p-4 cursor-pointer ${
                                isCompleted ? 'bg-green-50' : 'bg-gray-50'
                              }`}
                              onClick={() => toggleLessonExpansion(lesson.id)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                  isCompleted 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-300 text-gray-600'
                                }`}>
                                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                  <p className="text-sm text-gray-600">
                                    {lesson.duration ? `${lesson.duration} min` : 'No duration set'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {lesson.video_url && <Video className="w-4 h-4 text-blue-500" />}
                                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="p-4 border-t bg-white">
                                <div className="space-y-4">
                                  {lesson.content && (
                                    <div>
                                      <h5 className="font-medium text-gray-900 mb-2">Lesson Content</h5>
                                      <div className="prose max-w-none text-gray-700">
                                        {lesson.content}
                                      </div>
                                    </div>
                                  )}

                                  {lesson.video_url && (
                                    <div>
                                      <h5 className="font-medium text-gray-900 mb-2">Video</h5>
                                      <div className="bg-gray-100 p-4 rounded-lg">
                                        <a 
                                          href={lesson.video_url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex items-center text-blue-600 hover:text-blue-700"
                                        >
                                          <PlayCircle className="w-5 h-5 mr-2" />
                                          Watch Video
                                        </a>
                                      </div>
                                    </div>
                                  )}

                                  {!isCompleted && (
                                    <button
                                      onClick={() => markLessonComplete(lesson.id)}
                                      className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Mark as Complete
                                    </button>
                                  )}

                                  {isCompleted && progress?.completed_date && (
                                    <div className="text-sm text-green-600">
                                      ✓ Completed on {new Date(progress.completed_date).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {courseContent?.lessons?.length === 0 && (
                      <div className="text-center py-8">
                        <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Lessons Available</h3>
                        <p className="text-gray-600">Lessons will appear here once they are added to the course.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignments Section */}
                {assignments.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Assignments</h3>
                    <div className="space-y-4">
                      {assignments.map((assignment) => (
                        <div key={assignment.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                            </div>
                            <div className="text-right text-sm text-gray-600">
                              <div>Max Points: {assignment.max_points}</div>
                              {assignment.due_date && (
                                <div>Due: {new Date(assignment.due_date).toLocaleDateString()}</div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Your Submission
                            </label>
                            <textarea
                              value={assignmentSubmission}
                              onChange={(e) => setAssignmentSubmission(e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter your assignment submission..."
                            />
                            <button
                              onClick={() => submitAssignment(assignment.id)}
                              disabled={submittingAssignment === assignment.id || !assignmentSubmission.trim()}
                              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                              {submittingAssignment === assignment.id ? (
                                <>
                                  <Clock className="w-4 h-4 mr-2" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
                                  Submit Assignment
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CourseAccess;