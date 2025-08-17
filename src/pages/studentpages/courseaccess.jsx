import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, User, CreditCard, CheckCircle, AlertCircle, Send, X, InfoIcon, ArrowLeft, PlayCircle, FileText, ChevronRight, ChevronDown, Video, Book, PenTool, Award, Download, Upload, Eye, Star, MessageCircle, Users, Timer,TrendingUp, BarChart3, Target } from 'lucide-react';
import StudentSubmissionViewer from './studentsubmissionviewer';

// Course Access Component (refined and enhanced)
const CourseAccess = ({ onBack }) => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseContent, setCourseContent] = useState(null);
  const [studentProgress, setStudentProgress] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [studentGrades, setStudentGrades] = useState([]);
  const [assignmentFiles, setAssignmentFiles] = useState({});
const [gradesLoading, setGradesLoading] = useState(false);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [activeTab, setActiveTab] = useState('lessons');
  const [assignmentSubmission, setAssignmentSubmission] = useState({});
  const [submittingAssignment, setSubmittingAssignment] = useState(null);

  // Get user ID from localStorage (replace with proper auth)
  const userId = localStorage.getItem('userId') || '1';

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
      
      // If there's only one course, auto-select it
      if (verifiedCourses.length === 1) {
        handleCourseSelect(verifiedCourses[0]);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };
const fetchStudentGrades = async (courseId) => {
  try {
    // Get course assignments first
    const courseResponse = await fetch(`http://localhost:3000/api/courses/${courseId}`);
    const courseData = await courseResponse.json();
    
    if (courseData.assignments && courseData.assignments.length > 0) {
      // Get grades for each assignment
      const gradesPromises = courseData.assignments.map(async (assignment) => {
        try {
          const response = await fetch(`http://localhost:3000/api/courses/assignments/${assignment.id}/student/${userId}`);
          if (response.ok) {
            const gradeData = await response.json();
            return gradeData; // This will be the object you showed
          }
          return null;
        } catch (error) {
          console.error(`Error fetching grade for assignment ${assignment.id}:`, error);
          return null;
        }
      });
      
      const grades = await Promise.all(gradesPromises);
      const validGrades = grades.filter(grade => grade !== null);
      setStudentGrades(validGrades);
    }
  } catch (error) {
    console.error('Error fetching grades:', error);
  }
};


const fetchCourseContent = async (courseId, batchId) => {
  try {
    // Add debugging
    console.log('fetchCourseContent called with:', { courseId, batchId });
    
    if (!courseId) {
      console.error('CourseId is undefined or null');
      setContentLoading(false);
      return;
    }
    
    setContentLoading(true);
    
    // Fetch course details with lessons and assignments
    const courseResponse = await fetch(`http://localhost:3000/api/courses/${courseId}`);
    
    if (!courseResponse.ok) {
      throw new Error(`HTTP error! status: ${courseResponse.status}`);
    }
    
    const courseData = await courseResponse.json();
    
    // Fetch student progress
    const progressResponse = await fetch(`http://localhost:3000/api/courses/${courseId}/progress/${userId}`);
    const progressData = await progressResponse.json();
    
    setCourseContent(courseData);
    setStudentProgress(progressData);
    setAssignments(courseData.assignments || []);
    
    // Fetch assignment submission// In fetchCourseContent function, replace the assignment submissions fetch with:
if (courseData.assignments && courseData.assignments.length > 0) {
  const submissionsPromises = courseData.assignments.map(async (assignment) => {
    try {
      const submissionResponse = await fetch(`http://localhost:3000/api/files/student/${userId}/assignment/${assignment.id}`);
      if (submissionResponse.ok) {
        const submissionData = await submissionResponse.json();
        return { assignmentId: assignment.id, submission: submissionData };
      }
      return { assignmentId: assignment.id, submission: null };
    } catch (error) {
      console.error(`Error fetching submission for assignment ${assignment.id}:`, error);
      return { assignmentId: assignment.id, submission: null };
    }
  });

  const submissions = await Promise.all(submissionsPromises);
  const submissionsMap = {};
  submissions.forEach(({ assignmentId, submission }) => {
    submissionsMap[assignmentId] = submission;
  });
  setAssignmentSubmissions(submissionsMap);
}
    
  } catch (error) {
    console.error('Error fetching course content:', error);
  } finally {
    setContentLoading(false);
  }
};

const handleCourseSelect = (course) => {
  console.log('Course selected:', course);
  
  setSelectedCourse(course);
  setActiveTab('lessons');
  
  const courseId = course.course_id;
  
  if (!courseId) {
    console.error('No course_id found in course object. Please ensure your API returns course_id:', course);
    return;
  }
  
  fetchCourseContent(courseId, course.batch_id);
  fetchStudentGrades(courseId);
};

// Helper function to get grade color
const getGradeColor = (score, maxPoints) => {
  if (!score || !maxPoints) return 'text-gray-500';
  const percentage = (score / maxPoints) * 100;
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 80) return 'text-blue-600';
  if (percentage >= 70) return 'text-yellow-600';
  if (percentage >= 60) return 'text-orange-600';
  return 'text-red-600';
};

// Add helper functions for grade calculations
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

const submitAssignmentWithFile = async (assignmentId) => {
  const submissionText = assignmentSubmission[assignmentId];
  const file = assignmentFiles[assignmentId];
  
  if (!submissionText || !submissionText.trim()) {
    alert('Please enter your assignment submission text');
    return;
  }

  try {
    setSubmittingAssignment(assignmentId);
    
    const formData = new FormData();
    formData.append('student_id', userId);
    formData.append('assignment_id', assignmentId);
    formData.append('submission_text', submissionText);
    
    if (file) {
      formData.append('file', file);
    }

    const response = await fetch('http://localhost:3000/api/files/submit', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      alert('Assignment submitted successfully!');
      setAssignmentSubmission(prev => ({
        ...prev,
        [assignmentId]: ''
      }));
      setAssignmentFiles(prev => ({
        ...prev,
        [assignmentId]: null
      }));
      // Clear file input
      const fileInput = document.querySelector(`input[data-assignment-id="${assignmentId}"]`);
      if (fileInput) fileInput.value = '';
      
      // Refresh assignments
      fetchCourseContent(selectedCourse.course_id, selectedCourse.batch_id);
    } else {
      alert(result.error || 'Failed to submit assignment');
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
    if (!courseContent?.lessons || courseContent.lessons.length === 0) return 0;
    const completedLessons = studentProgress.filter(p => p.completed).length;
    return Math.round((completedLessons / courseContent.lessons.length) * 100);
  };

  const getCompletedLessonsCount = () => {
    return studentProgress.filter(p => p.completed).length;
  };

  const getTotalLessonsCount = () => {
    return courseContent?.lessons?.length || 0;
  };

  const getAssignmentStatus = (assignmentId) => {
    const submission = assignmentSubmissions[assignmentId];
    if (!submission) return { status: 'not_submitted', text: 'Not Submitted', color: 'text-gray-500' };
    if (submission.graded_date) return { status: 'graded', text: `Graded (${submission.score}/${submission.max_points})`, color: 'text-green-600' };
    return { status: 'submitted', text: 'Submitted', color: 'text-blue-600' };
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
            <h1 className="text-3xl font-bold text-gray-900 mt-4">My Learning Dashboard</h1>
            <p className="text-gray-600">Access your enrolled courses and track your progress</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Course List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                My Courses
              </h2>
              
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm">No verified courses yet</p>
                  <button
                    onClick={onBack}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Browse Courses
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrolledCourses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => handleCourseSelect(course)}
                      className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                        selectedCourse?.id === course.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <h3 className="font-medium text-gray-900">{course.course_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{course.batch_name}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center text-xs text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Enrolled
                        </div>
                        {selectedCourse?.id === course.id && (
                          <div className="text-xs text-blue-600">
                            Selected
                          </div>
                        )}
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
                <p className="text-gray-600">Choose a course from the sidebar to access its content and track your progress</p>
              </div>
            ) : contentLoading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading course content...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Course Header */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">{courseContent?.name}</h2>
                        <p className="text-blue-100 mb-4">{courseContent?.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{selectedCourse.batch_name}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{courseContent?.duration || 'N/A'}</span>
                          </div>
                          <div className="flex items-center">
                            <Book className="w-4 h-4 mr-2" />
                            <span>{getTotalLessonsCount()} Lessons</span>
                          </div>
                          <div className="flex items-center">
                            <PenTool className="w-4 h-4 mr-2" />
                            <span>{assignments.length} Assignments</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Section */}
                  <div className="p-6 bg-gray-50 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Your Progress</h3>
                      <div className="text-2xl font-bold text-blue-600">{getProgressPercentage()}%</div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{getCompletedLessonsCount()} of {getTotalLessonsCount()} lessons completed</span>
                      <span>{getTotalLessonsCount() - getCompletedLessonsCount()} remaining</span>
                    </div>
                  </div>
                </div>

                {/* Course Navigation Tabs */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="border-b border-gray-200">
                    <nav className="flex">
                      <button 
                        onClick={() => setActiveTab('lessons')}
                        className={`px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === 'lessons'
                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Book className="w-4 h-4 inline mr-2" />
                        Lessons ({getTotalLessonsCount()})
                      </button>
                      <button 
                        onClick={() => setActiveTab('assignments')}
                        className={`px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === 'assignments'
                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <PenTool className="w-4 h-4 inline mr-2" />
                        Assignments ({assignments.length})
                      </button>
                      <button 
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === 'overview'
                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Award className="w-4 h-4 inline mr-2" />
                        Overview
                      </button>
                      <button 
  onClick={() => setActiveTab('grades')}
  className={`px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
    activeTab === 'grades'
      ? 'border-blue-500 text-blue-600 bg-blue-50'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
  }`}
>
  <Star className="w-4 h-4 inline mr-2" />
  My Grades ({studentGrades.filter(g => g.score !== null).length})
</button>
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {/* Lessons Tab */}
                    {activeTab === 'lessons' && (
                      <div className="space-y-4">
                        {courseContent?.lessons?.length > 0 ? (
                          courseContent.lessons.map((lesson, index) => {
                            const progress = getLessonProgress(lesson.id);
                            const isCompleted = progress?.completed;
                            const isExpanded = expandedLessons[lesson.id];

                            return (
                              <div key={lesson.id} className="border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md">
                                <div 
                                  className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                                    isCompleted ? 'bg-green-50 hover:bg-green-100' : 'bg-gray-50 hover:bg-gray-100'
                                  }`}
                                  onClick={() => toggleLessonExpansion(lesson.id)}
                                >
                                  <div className="flex items-center space-x-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                      isCompleted 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-gray-300 text-gray-600'
                                    }`}>
                                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                        {lesson.duration && (
                                          <span className="flex items-center">
                                            <Timer className="w-3 h-3 mr-1" />
                                            {lesson.duration} min
                                          </span>
                                        )}
                                        {lesson.video_url && (
                                          <span className="flex items-center text-blue-600">
                                            <Video className="w-3 h-3 mr-1" />
                                            Video
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {isCompleted && (
                                      <span className="text-green-600 text-sm font-medium">Completed</span>
                                    )}
                                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                  </div>
                                </div>

                                {isExpanded && (
                                  <div className="p-6 border-t bg-white">
                                    <div className="space-y-6">
                                      {lesson.content && (
                                        <div>
                                          <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Lesson Content
                                          </h5>
                                          <div className="prose max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg">
                                            {lesson.content}
                                          </div>
                                        </div>
                                      )}

                                      {lesson.video_url && (
                                        <div>
                                          <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                                            <Video className="w-4 h-4 mr-2" />
                                            Video Lesson
                                          </h5>
                                          <div className="bg-gray-100 p-6 rounded-lg border-2 border-dashed border-gray-300">
                                            <div className="text-center">
                                              <PlayCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                                              <a 
                                                href={lesson.video_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                              >
                                                <PlayCircle className="w-4 h-4 mr-2" />
                                                Watch Video
                                              </a>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      <div className="flex items-center justify-between pt-4 border-t">
                                        {!isCompleted ? (
                                          <button
                                            onClick={() => markLessonComplete(lesson.id)}
                                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                          >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Mark as Complete
                                          </button>
                                        ) : (
                                          <div className="flex items-center text-green-600">
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            <span className="text-sm">
                                              Completed on {new Date(progress.completed_date).toLocaleDateString()}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-12">
                            <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Lessons Available</h3>
                            <p className="text-gray-600">Lessons will appear here once they are added to the course.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Assignments Tab */}
                   {/* Assignments Tab */}
{activeTab === 'assignments' && (
  <div className="space-y-6">
    {assignments.length > 0 ? (
      assignments.map((assignment) => {
        const assignmentStatus = getAssignmentStatus(assignment.id);
        const existingSubmission = assignmentSubmissions[assignment.id];
        
        return (
          <div key={assignment.id} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 border-b">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg">{assignment.title}</h4>
                  <p className="text-gray-600 mt-2">{assignment.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-sm font-medium ${assignmentStatus.color}`}>
                    {assignmentStatus.text}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Max Points: {assignment.max_points}
                  </div>
                  {assignment.due_date && (
                    <div className="text-sm text-gray-600">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Use the StudentSubmissionViewer component */}
            {existingSubmission && (
  <StudentSubmissionViewer 
    submission={existingSubmission}
    assignment={assignment}
    className="mb-4"
  />
)}

                                  {/* Submission form */}
                                {/* Submission form */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    {existingSubmission ? 'Update Your Submission' : 'Your Submission'}
  </label>
  <textarea
    value={assignmentSubmission[assignment.id] || ''}
    onChange={(e) => setAssignmentSubmission(prev => ({
      ...prev,
      [assignment.id]: e.target.value
    }))}
    rows={6}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
    placeholder="Enter your assignment submission here..."
  />
  
  {/* File Upload */}
  <div className="mt-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      <Upload className="w-4 h-4 inline mr-1" />
      Attach File (Optional)
    </label>
    <input
      type="file"
      data-assignment-id={assignment.id}
      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
      onChange={(e) => setAssignmentFiles(prev => ({
        ...prev,
        [assignment.id]: e.target.files[0]
      }))}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
    {assignmentFiles[assignment.id] && (
      <div className="mt-1 text-sm text-green-600">
        Selected: {assignmentFiles[assignment.id].name}
      </div>
    )}
    <p className="text-xs text-gray-500 mt-1">
      Supported: PDF, DOC, DOCX, TXT, Images, ZIP (Max 10MB)
    </p>
  </div>

  {/* Show existing file if any */}
  {existingSubmission && (
    <div className="mb-2 mt-2">
      <div className="text-xs text-blue-600">
        Submitted on: {new Date(existingSubmission.submitted_date).toLocaleDateString()}
      </div>
      {existingSubmission.file_original_name && (
        <div className="text-sm text-green-600 flex items-center">
          <FileText className="w-4 h-4 mr-1" />
          Current file: {existingSubmission.file_original_name}
        </div>
      )}
    </div>
  )}

  <button
    onClick={() => submitAssignmentWithFile(assignment.id)}
    disabled={submittingAssignment === assignment.id || (!assignmentSubmission[assignment.id]?.trim())}
    className="mt-3 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    {submittingAssignment === assignment.id ? (
      <>
        <Clock className="w-4 h-4 mr-2 animate-spin" />
        {existingSubmission ? 'Updating...' : 'Submitting...'}
      </>
    ) : (
      <>
        <Send className="w-4 h-4 mr-2" />
        {existingSubmission ? 'Update Submission' : 'Submit Assignment'}
      </>
    )}
  </button>
</div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-12">
                            <PenTool className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Yet</h3>
                            <p className="text-gray-600">Assignments will appear here when they are added to the course.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Course Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                            <Book className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                            <div className="text-2xl font-bold text-blue-900">{getTotalLessonsCount()}</div>
                            <div className="text-blue-700 text-sm">Total Lessons</div>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                            <div className="text-2xl font-bold text-green-900">{getCompletedLessonsCount()}</div>
                            <div className="text-green-700 text-sm">Completed</div>
                          </div>
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                            <PenTool className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                            <div className="text-2xl font-bold text-orange-900">{assignments.length}</div>
                            <div className="text-orange-700 text-sm">Assignments</div>
                          </div>
                        </div>

                        {/* Progress Details */}
                        <div className="bg-white border rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Award className="w-5 h-5 mr-2 text-blue-600" />
                            Learning Progress
                          </h3>
                          
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Overall Completion</span>
                              <span className="font-semibold text-blue-600">{getProgressPercentage()}%</span>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                                style={{ width: `${getProgressPercentage()}%` }}
                              ></div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                              <div>
                                <div className="text-sm text-gray-600">Lessons Completed</div>
                                <div className="font-semibold text-green-600">
                                  {getCompletedLessonsCount()} / {getTotalLessonsCount()}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-600">Assignments Submitted</div>
                                <div className="font-semibold text-blue-600">
                                  {Object.keys(assignmentSubmissions).filter(id => assignmentSubmissions[id]).length} / {assignments.length}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Course Information */}
                        <div className="bg-white border rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <InfoIcon className="w-5 h-5 mr-2 text-blue-600" />
                            Course Information
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-gray-900">Course Details</h4>
                                <div className="mt-2 space-y-2 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    <span>{courseContent?.name}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    <span>Batch: {selectedCourse.batch_name}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>Duration: {courseContent?.duration || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-gray-900">Quick Stats</h4>
                                <div className="mt-2 space-y-2 text-sm text-gray-600">
                                  <div className="flex justify-between">
                                    <span>Total Content Items:</span>
                                    <span className="font-medium">{getTotalLessonsCount() + assignments.length}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Progress:</span>
                                    <span className="font-medium text-blue-600">{getProgressPercentage()}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Enrollment Status:</span>
                                    <span className="font-medium text-green-600">Active</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white border rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-blue-600" />
                            Recent Activity
                          </h3>
                          
                          <div className="space-y-3">
                            {studentProgress
                              .filter(p => p.completed)
                              .sort((a, b) => new Date(b.completed_date) - new Date(a.completed_date))
                              .slice(0, 5)
                              .map(progress => (
                                <div key={progress.lesson_id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">{progress.lesson_title}</div>
                                    <div className="text-sm text-gray-600">
                                      Completed on {new Date(progress.completed_date).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            
                            {studentProgress.filter(p => p.completed).length === 0 && (
                              <div className="text-center py-6 text-gray-500">
                                <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p>No completed lessons yet. Start learning!</p>
                              </div>
                            )}
                          </div>
                        </div>
                        

                        {/* Next Steps */}
                        {getProgressPercentage() < 100 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                              <ArrowLeft className="w-5 h-5 mr-2 rotate-90" />
                              What's Next?
                            </h3>
                            
                            <div className="space-y-3">
                              {/* Next incomplete lesson */}
                              {(() => {
                                const nextLesson = courseContent?.lessons?.find(lesson => 
                                  !studentProgress.find(p => p.lesson_id === lesson.id && p.completed)
                                );
                                
                                return nextLesson ? (
                                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                                    <h4 className="font-medium text-gray-900 mb-2">Continue Learning</h4>
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="text-blue-700 font-medium">{nextLesson.title}</div>
                                        <div className="text-sm text-gray-600">
                                          {nextLesson.duration ? `${nextLesson.duration} min` : 'Next lesson'}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => {
                                          setActiveTab('lessons');
                                          toggleLessonExpansion(nextLesson.id);
                                        }}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                                      >
                                        Start
                                      </button>
                                    </div>
                                  </div>
                                ) : null;
                              })()}
                              
                              {/* Pending assignments */}
                              {(() => {
                                const pendingAssignments = assignments.filter(assignment => 
                                  !assignmentSubmissions[assignment.id]
                                );
                                
                                return pendingAssignments.length > 0 ? (
                                  <div className="bg-white p-4 rounded-lg border border-orange-200">
                                    <h4 className="font-medium text-gray-900 mb-2">Pending Assignments</h4>
                                    <div className="text-orange-700 text-sm mb-2">
                                      You have {pendingAssignments.length} assignment(s) to submit
                                    </div>
                                    <button
                                      onClick={() => setActiveTab('assignments')}
                                      className="px-3 py-1 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700 transition-colors"
                                    >
                                      View Assignments
                                    </button>
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Completion Message */}
                        {getProgressPercentage() === 100 && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                            <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-green-900 mb-2">
                              Congratulations! 🎉
                            </h3>
                            <p className="text-green-700">
                              You've completed all lessons in this course. Keep up the excellent work!
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Grades Tab */}
{activeTab === 'grades' && (
  <div className="space-y-6">
    {studentGrades.map((grade) => (
      <div key={grade.id} className="bg-white border rounded-lg p-6 shadow-sm">
        <h4 className="font-semibold text-gray-900 text-lg mb-4">
          {grade.assignment_title}
        </h4>
        
        {/* Use the component to show the submission with grade */}
        <StudentSubmissionViewer 
          submission={{
            ...grade,
            submitted_date: grade.submitted_date,
            graded_date: grade.graded_date,
            score: grade.score,
            feedback: grade.feedback,
            submission_text: grade.submission_text,
            file_original_name: grade.file_original_name,
            file_path: grade.file_path
          }}
          assignment={{ max_points: grade.max_points }}
        />
      </div>
    ))}
  </div>
)}
</div>                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAccess;