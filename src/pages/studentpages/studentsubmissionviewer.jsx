// StudentSubmissionViewer.js
import React, { useState } from 'react';
import { Eye, FileText, CheckCircle, Calendar, Star, Download, X, ExternalLink } from 'lucide-react';

const StudentSubmissionViewer = ({ submission, assignment, className = "" }) => {
  const [showFileModal, setShowFileModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Handle file viewing in modal
  const handleViewFile = async (submission) => {
    if (!submission.file_path) {
      alert('No file attached to this submission');
      return;
    }
    
    try {
      const fileUrl = `http://localhost:3000/api/files/view/${submission.file_path}`;
      const ext = submission.file_original_name.split('.').pop().toLowerCase();
      
      // Set modal content based on file type
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
        setModalContent({
          type: 'image',
          url: fileUrl,
          filename: submission.file_original_name
        });
      } else if (ext === 'pdf') {
        setModalContent({
          type: 'pdf',
          url: fileUrl,
          filename: submission.file_original_name
        });
      } else if (['txt', 'csv', 'json', 'html', 'xml'].includes(ext)) {
        // For text files, fetch the content
        const response = await fetch(fileUrl);
        const textContent = await response.text();
        setModalContent({
          type: 'text',
          content: textContent,
          filename: submission.file_original_name
        });
      } else {
        // For other files, show info and download option
        setModalContent({
          type: 'other',
          url: `http://localhost:3000/api/files/download/${submission.file_path}`,
          filename: submission.file_original_name,
          extension: ext
        });
      }
      
      setShowFileModal(true);
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Error opening file');
    }
  };

  // File Preview Modal Component
  const FileModal = () => {
    if (!showFileModal || !modalContent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] w-full flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              {modalContent.filename}
            </h3>
            <div className="flex items-center space-x-2">
              {modalContent.type !== 'text' && (
                <a
                  href={modalContent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open in New Tab
                </a>
              )}
              <button
                onClick={() => setShowFileModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-auto p-4">
            {modalContent.type === 'image' && (
              <div className="flex justify-center">
                <img 
                  src={modalContent.url} 
                  alt={modalContent.filename}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              </div>
            )}

            {modalContent.type === 'pdf' && (
              <div className="w-full h-[70vh]">
                <iframe
                  src={modalContent.url}
                  className="w-full h-full border rounded-lg"
                  title={modalContent.filename}
                />
              </div>
            )}

            {modalContent.type === 'text' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono max-h-96 overflow-auto">
                  {modalContent.content}
                </pre>
              </div>
            )}

            {modalContent.type === 'other' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">
                  {modalContent.extension === 'doc' || modalContent.extension === 'docx' ? '📝' : 
                   modalContent.extension === 'zip' ? '📦' : 
                   modalContent.extension === 'xlsx' || modalContent.extension === 'xls' ? '📊' : '📎'}
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {modalContent.filename}
                </h4>
                <p className="text-gray-600 mb-6">
                  This file type cannot be previewed directly. You can download it to view the content.
                </p>
                <a
                  href={modalContent.url}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Get file icon based on extension
  const getFileIcon = (filename) => {
    if (!filename) return '📎';
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc': case 'docx': return '📝';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return '🖼️';
      case 'zip': case 'rar': return '📦';
      case 'txt': return '📃';
      case 'xlsx': case 'xls': return '📊';
      case 'ppt': case 'pptx': return '📊';
      default: return '📎';
    }
  };

  // Get grade color based on percentage
  const getGradeColor = (score, maxPoints) => {
    if (!score || !maxPoints) return 'text-gray-500';
    const percentage = (score / maxPoints) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get file size (you can extend this to show actual file size from backend)
  const getFileSize = (filename) => {
    // This is a placeholder - you'd get actual file size from your backend
    return 'Unknown size';
  };

  if (!submission) {
    return (
      <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="text-center text-gray-500">
          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No submission yet</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h5 className="font-medium text-blue-900 flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            Your Submission
          </h5>
          <div className="flex items-center space-x-2">
            {submission.score !== null && (
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Graded
              </div>
            )}
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              Submitted
            </div>
          </div>
        </div>
        
        {/* Submission Text */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Submission Text:
          </label>
          <div className="p-3 bg-white border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm whitespace-pre-wrap">
              {submission.submission_text}
            </p>
          </div>
        </div>
        
        {/* File Attachment */}
        {submission.file_original_name && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-blue-800 mb-2">
              📎 Attached File:
            </label>
            <div className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getFileIcon(submission.file_original_name)}</span>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {submission.file_original_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getFileSize(submission.file_original_name)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleViewFile(submission)}
                className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </button>
            </div>
          </div>
        )}
        
        {/* Grade Display */}
        {submission.score !== null && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h6 className="font-medium text-green-800 flex items-center">
                <Star className="w-4 h-4 mr-1" />
                Your Grade
              </h6>
              <div className="text-right">
                <div className={`text-lg font-bold ${getGradeColor(submission.score, assignment?.max_points)}`}>
                  {submission.score}/{assignment?.max_points}
                </div>
                <div className={`text-sm ${getGradeColor(submission.score, assignment?.max_points)}`}>
                  {Math.round((submission.score / assignment?.max_points) * 100)}%
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  (submission.score / assignment?.max_points) >= 0.9 ? 'bg-green-500' :
                  (submission.score / assignment?.max_points) >= 0.8 ? 'bg-blue-500' :
                  (submission.score / assignment?.max_points) >= 0.7 ? 'bg-yellow-500' :
                  (submission.score / assignment?.max_points) >= 0.6 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${(submission.score / assignment?.max_points) * 100}%` }}
              ></div>
            </div>
            
            {/* Feedback */}
            {submission.feedback && (
              <div className="mt-2 p-2 bg-white border border-green-200 rounded">
                <div className="text-sm font-medium text-green-800 mb-1">Instructor Feedback:</div>
                <div className="text-green-700 text-sm">{submission.feedback}</div>
              </div>
            )}
            
            <div className="text-green-600 text-xs mt-2">
              Graded on: {new Date(submission.graded_date).toLocaleDateString()}
            </div>
          </div>
        )}
        
        {/* Submission Metadata */}
        <div className="flex justify-between items-center text-xs text-blue-600 pt-3 border-t border-blue-200">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            Submitted: {new Date(submission.submitted_date).toLocaleDateString()} 
            at {new Date(submission.submitted_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
          <div className="flex items-center space-x-3">
            {submission.file_original_name && (
              <div className="flex items-center text-green-600">
                <FileText className="w-3 h-3 mr-1" />
                File attached
              </div>
            )}
            {submission.score === null && (
              <div className="text-yellow-600">
                Awaiting grade
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      <FileModal />
    </>
  );
};

export default StudentSubmissionViewer;