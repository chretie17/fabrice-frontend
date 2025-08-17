import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Award,
  User,
  Clock,
  Download,
  Eye,
  File,
  ExternalLink,
  Star,
  CheckCircle,
  X,
  Save,
  AlertCircle,
  MessageSquare,
  Image,
  FileImage,
  Minimize2,
  Maximize2
} from 'lucide-react';

const AssignmentViewer = ({ 
  assignmentId, 
  onClose, 
  showGrading = true,
  showSubmissions = true,
  currentUserId 
}) => {
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // File viewing modal state
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Grading modal state
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradingForm, setGradingForm] = useState({
    score: '',
    feedback: ''
  });

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentData();
    }
  }, [assignmentId]);

  const fetchAssignmentData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch assignment details
      const assignmentResponse = await fetch(`http://localhost:3000/api/courses/assignments/${assignmentId}`);
      if (!assignmentResponse.ok) throw new Error('Failed to fetch assignment');
      const assignmentData = await assignmentResponse.json();
      setAssignment(assignmentData);

      if (showSubmissions) {
        // Fetch submissions - using the correct endpoint
        const submissionsResponse = await fetch(`http://localhost:3000/api/courses/assignments/${assignmentId}/submissions`);
        if (!submissionsResponse.ok) throw new Error('Failed to fetch submissions');
        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData);
      }
    } catch (error) {
      console.error('Error fetching assignment data:', error);
      setError('Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  };

  // File handling functions
  const viewFileInline = async (filename, originalName = '') => {
    if (!filename) return;
    
    setFileLoading(true);
    setViewingFile({ filename, originalName: originalName || filename });
    setShowFileViewer(true);
    
    try {
      const ext = filename.split('.').pop().toLowerCase();
      
      if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
        // For images, just set the URL - no need to fetch content
        setFileContent(`http://localhost:3000/api/files/view/${filename}`);
      } else if (['txt', 'csv'].includes(ext)) {
        // For text files, fetch the content
        const response = await fetch(`http://localhost:3000/api/files/view/${filename}`);
        if (!response.ok) throw new Error('Failed to fetch file content');
        const content = await response.text();
        setFileContent(content);
      } else if (ext === 'pdf') {
        // For PDFs, use the URL for iframe
        setFileContent(`http://localhost:3000/api/files/view/${filename}`);
      } else {
        // For other files, show download option
        setFileContent('preview_not_available');
      }
    } catch (error) {
      console.error('Error loading file:', error);
      setFileContent('error_loading_file');
    } finally {
      setFileLoading(false);
    }
  };

  const downloadFile = (filename) => {
    if (!filename) return;
    const downloadUrl = `http://localhost:3000/api/files/download/${filename}`;
    window.open(downloadUrl, '_blank');
  };

  const isViewableFile = (filename) => {
    if (!filename) return false;
    const ext = filename.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt', 'csv'].includes(ext);
  };

  const getFileIcon = (filename) => {
    if (!filename) return <File className="h-4 w-4" />;
    const ext = filename.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      return <FileImage className="h-4 w-4 text-blue-600" />;
    } else if (ext === 'pdf') {
      return <File className="h-4 w-4 text-red-600" />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <File className="h-4 w-4 text-blue-800" />;
    } else {
      return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  const renderFileContent = () => {
    if (fileLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading file...</span>
        </div>
      );
    }

    if (fileContent === 'error_loading_file') {
      return (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">Error loading file</p>
          <button
            onClick={() => downloadFile(viewingFile?.filename)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 mx-auto"
          >
            <Download className="h-4 w-4" />
            <span>Download Instead</span>
          </button>
        </div>
      );
    }

    if (fileContent === 'preview_not_available') {
      return (
        <div className="text-center py-12">
          <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Preview not available for this file type</p>
          <button
            onClick={() => downloadFile(viewingFile?.filename)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 mx-auto"
          >
            <Download className="h-4 w-4" />
            <span>Download File</span>
          </button>
        </div>
      );
    }

    const ext = viewingFile?.filename.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      return (
        <div className="flex items-center justify-center p-4">
          <img
            src={fileContent}
            alt={viewingFile?.originalName}
            className="max-w-full max-h-[70vh] object-contain border rounded-lg shadow-sm"
            onError={(e) => {
              e.target.style.display = 'none';
              setFileContent('error_loading_file');
            }}
          />
        </div>
      );
    }

    if (ext === 'pdf') {
      return (
        <div className="h-[70vh]">
          <iframe
            src={fileContent}
            className="w-full h-full border rounded-lg"
            title={viewingFile?.originalName}
          />
        </div>
      );
    }

    if (['txt', 'csv'].includes(ext)) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg max-h-[70vh] overflow-y-auto">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
            {fileContent}
          </pre>
        </div>
      );
    }

    return null;
  };

  // Grading functions
  const openGrading = (submission) => {
    setGradingSubmission(submission);
    setGradingForm({
      score: submission.score || '',
      feedback: submission.feedback || ''
    });
    setShowGradingModal(true);
  };

  const handleGradeSubmission = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/courses/assignments/submissions/${gradingSubmission.id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: parseInt(gradingForm.score),
          feedback: gradingForm.feedback,
          graded_by: currentUserId,
          graded_date: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Failed to grade submission');
      
      await fetchAssignmentData(); // Refresh data
      setShowGradingModal(false);
      setGradingSubmission(null);
      setGradingForm({ score: '', feedback: '' });
    } catch (error) {
      console.error('Error grading submission:', error);
      setError('Failed to grade submission');
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStats = () => {
    if (submissions.length === 0) return { total: 0, graded: 0, pending: 0 };
    
    const graded = submissions.filter(s => s.score !== null).length;
    const pending = submissions.length - graded;
    
    return { total: submissions.length, graded, pending };
  };

  if (!assignment && !loading) {
    return (
      <div className="text-center py-8">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Assignment not found</p>
      </div>
    );
  }

  const stats = getSubmissionStats();

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span>{assignment?.title || 'Loading...'}</span>
          </h2>
          {assignment && (
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Award className="h-4 w-4" />
                <span>{assignment.max_points} points</span>
              </span>
              {showSubmissions && (
                <span className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{stats.total} submissions</span>
                </span>
              )}
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      ) : (
        <div className="p-6">
          {/* Assignment Details */}
          {assignment && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Assignment Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {assignment.description || 'No description provided.'}
              </p>
            </div>
          )}

          {/* Submission Statistics */}
          {showSubmissions && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-800">Total Submissions</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
                <div className="text-sm text-green-800">Graded</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-yellow-800">Pending</div>
              </div>
            </div>
          )}

          {/* Submissions List */}
          {showSubmissions && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Student Submissions</span>
              </h3>

              {submissions.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {/* Student Info and Status */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-medium text-gray-900">{submission.student_name}</h4>
                              {submission.score !== null ? (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                  {submission.score}/{assignment.max_points}
                                </span>
                              ) : (
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                                  Not Graded
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(submission.submitted_date).toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Text Submission */}
                          {submission.submission_text && (
                            <div className="mb-3 p-3 bg-white border rounded">
                              <p className="text-gray-700 whitespace-pre-wrap">{submission.submission_text}</p>
                            </div>
                          )}

                          {/* File Attachment */}
                          {submission.file_path && (
                            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {getFileIcon(submission.file_path)}
                                  <span className="text-sm font-medium text-blue-800">
                                    {submission.file_original_name || submission.file_path}
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  {isViewableFile(submission.file_path) && (
                                    <button
                                      onClick={() => viewFileInline(submission.file_path, submission.file_original_name)}
                                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 flex items-center space-x-1"
                                      title="View file inline"
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span>View</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => downloadFile(submission.file_path)}
                                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 flex items-center space-x-1"
                                    title="Download file"
                                  >
                                    <Download className="h-4 w-4" />
                                    <span>Download</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Feedback */}
                          {submission.feedback && (
                            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
                              <h5 className="font-medium text-green-800 mb-1">Instructor Feedback:</h5>
                              <p className="text-green-700 whitespace-pre-wrap">{submission.feedback}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {showGrading && (
                          <div className="ml-4">
                            <button
                              onClick={() => openGrading(submission)}
                              className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-200 flex items-center space-x-1"
                            >
                              <Star className="h-4 w-4" />
                              <span>{submission.score !== null ? 'Update Grade' : 'Grade'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* File Viewer Modal */}
      {showFileViewer && viewingFile && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isFullscreen ? 'p-0' : 'p-4'}`}>
          <div className={`bg-white rounded-lg ${isFullscreen ? 'w-full h-full' : 'w-full max-w-5xl max-h-[90vh]'} overflow-hidden`}>
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-3">
                {getFileIcon(viewingFile.filename)}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {viewingFile.originalName}
                  </h3>
                  <p className="text-sm text-gray-600">File Preview</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => downloadFile(viewingFile.filename)}
                  className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-200 flex items-center space-x-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => {
                    setShowFileViewer(false);
                    setViewingFile(null);
                    setFileContent('');
                    setIsFullscreen(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className={`${isFullscreen ? 'h-[calc(100vh-80px)]' : 'max-h-[calc(90vh-80px)]'} overflow-auto`}>
              {renderFileContent()}
            </div>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {showGradingModal && gradingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Grade Submission - {gradingSubmission.student_name}
              </h3>
              <button
                onClick={() => {
                  setShowGradingModal(false);
                  setGradingSubmission(null);
                  setGradingForm({ score: '', feedback: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Submission Preview */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Student Submission:</h4>
              
              {gradingSubmission.submission_text && (
                <div className="mb-3 p-3 bg-white rounded border">
                  <p className="text-gray-700 whitespace-pre-wrap">{gradingSubmission.submission_text}</p>
                </div>
              )}
              
              {gradingSubmission.file_path && (
                <div className="mb-3 p-3 bg-white rounded border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(gradingSubmission.file_path)}
                      <span className="text-sm font-medium text-gray-700">
                        {gradingSubmission.file_original_name || gradingSubmission.file_path}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {isViewableFile(gradingSubmission.file_path) && (
                        <button
                          onClick={() => viewFileInline(gradingSubmission.file_path, gradingSubmission.file_original_name)}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View File</span>
                        </button>
                      )}
                      <button
                        onClick={() => downloadFile(gradingSubmission.file_path)}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 flex items-center space-x-1"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-2">
                Submitted: {new Date(gradingSubmission.submitted_date).toLocaleString()}
              </p>
            </div>

            {/* Grading Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score * (Max: {assignment.max_points})
                </label>
                <input
                  type="number"
                  value={gradingForm.score}
                  onChange={(e) => setGradingForm({ ...gradingForm, score: e.target.value })}
                  min="0"
                  max={assignment.max_points}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback
                </label>
                <textarea
                  value={gradingForm.feedback}
                  onChange={(e) => setGradingForm({ ...gradingForm, feedback: e.target.value })}
                  rows={4}
                  placeholder="Provide feedback to the student..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowGradingModal(false);
                  setGradingSubmission(null);
                  setGradingForm({ score: '', feedback: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGradeSubmission}
                disabled={!gradingForm.score || loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>{loading ? 'Grading...' : 'Submit Grade'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentViewer;