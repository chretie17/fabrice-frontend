import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Snackbar } from '@mui/material';
import { Calendar, Download, Filter, MessageSquare, RefreshCcw, Tag, User, BookOpen, TrendingUp, BarChart3 } from 'lucide-react';

// Import your logo
import Logo from '../assets/logo.png';
import Logo2 from '../assets/logo.png';

const ReportPage = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [filtered, setFiltered] = useState(false);
  const [category, setCategory] = useState('academic');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [categories, setCategories] = useState([]);

  // Fetch available categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/reports/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchReportData = async (filterByDate = false) => {
    setLoading(true);
    setReportData({});
    
    const params = { category };
    
    // Only add date filtering parameters if explicitly requested
    if (filterByDate && startDate && endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      params.end_date = end.toISOString();
      params.type = 'date_range';
      
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      params.start_date = start.toISOString();
    }

    try {
      const response = await axios.get('http://localhost:3000/api/reports/generate', { params });
      
      if (!response.data[category] || response.data[category].length === 0) {
        const message = filterByDate 
          ? 'No data found for the selected category and date range.'
          : 'No data found for the selected category.';
        setSnackbarMessage(message);
        setSnackbarOpen(true);
      }
      
      setReportData(response.data);
      setFiltered(filterByDate);
    } catch (error) {
      console.error('Error fetching report:', error);
      setSnackbarMessage('Failed to fetch report. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(false);
  }, [category]);

  // Enhanced PDF generation with logo
  // Enhanced PDF generation with dual logos and refined layout
// Enhanced PDF generation with dual logos and refined layout
const generatePDF = async (title) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Color Palette
  const colors = {
    primary: '#13367A',
    text: '#2C3E50',
    light: '#F8F9FA'
  };

  // Helper function to add logos
  const addLogos = async () => {
    try {
      // Load Logo 1
      const img1 = new Image();
      img1.crossOrigin = 'anonymous';
      
      // Load Logo 2  
      const img2 = new Image();
      img2.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        let loadedCount = 0;
        const checkComplete = () => {
          loadedCount++;
          if (loadedCount === 2) resolve();
        };
        
        img1.onload = () => {
          try {
            const canvas1 = document.createElement('canvas');
            const ctx1 = canvas1.getContext('2d');
            canvas1.width = img1.width;
            canvas1.height = img1.height;
            ctx1.drawImage(img1, 0, 0);
            const dataURL1 = canvas1.toDataURL('image/png');
            // Left logo
            doc.addImage(dataURL1, 'PNG', 15, 8, 25, 15);
          } catch (error) {
            console.warn('Could not add logo 1:', error);
          }
          checkComplete();
        };
        
        img2.onload = () => {
          try {
            const canvas2 = document.createElement('canvas');
            const ctx2 = canvas2.getContext('2d');
            canvas2.width = img2.width;
            canvas2.height = img2.height;
            ctx2.drawImage(img2, 0, 0);
            const dataURL2 = canvas2.toDataURL('image/png');
            // Right logo
            doc.addImage(dataURL2, 'PNG', doc.internal.pageSize.getWidth() - 40, 8, 25, 15);
          } catch (error) {
            console.warn('Could not add logo 2:', error);
          }
          checkComplete();
        };
        
        img1.onerror = () => {
          console.warn('Could not load logo 1');
          checkComplete();
        };
        
        img2.onerror = () => {
          console.warn('Could not load logo 2');
          checkComplete();
        };
        
        img1.src = Logo;
        img2.src = Logo2;
      });
    } catch (error) {
      console.warn('Error loading logos:', error);
    }
  };

  // Professional Header with centered title
  const addHeader = async () => {
    // Add logos first
    await addLogos();
    
    // Main Title - LUZ TECHNOLOGY (centered, large)
    doc.setFontSize(22);
    doc.setTextColor(colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('LUZ TECHNOLOGY', doc.internal.pageSize.getWidth() / 2, 18, { align: 'center' });
    
    // Subtitle - Report type (centered, smaller)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    const categoryTitle = getCategoryDisplayName(category).toUpperCase();
    doc.text(categoryTitle, doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
    
    // Line separator
    doc.setDrawColor(colors.primary);
    doc.setLineWidth(0.5);
    doc.line(15, 30, doc.internal.pageSize.getWidth() - 15, 30);
  };

  // Metadata section - now to be used after table
  const addMetadataAfterTable = (startY) => {
    doc.setFontSize(10);
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'normal');

    const now = new Date();
    let yPosition = startY;
    
    doc.text(`Generated By: ADMIN`, 15, yPosition);
    yPosition += 6;
    
    doc.text(`Generated: ${now.toLocaleString()}`, 15, yPosition);
    yPosition += 6;
    
    if (filtered && startDate && endDate) {
      doc.text(`Date Range: ${startDate} to ${endDate}`, 15, yPosition);
      yPosition += 6;
    }

    doc.text(`Category: ${getCategoryDisplayName(category)}`, 15, yPosition);
    yPosition += 6;
    
    doc.text(`Total Records: ${reportData[category]?.length || 0}`, 15, yPosition);
  };

  // Table configuration
  const getTableConfig = (startY) => ({
    startY: startY,
    theme: 'grid',
    headStyles: {
      fillColor: [19, 54, 122], // colors.primary in RGB
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [44, 62, 80]
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    margin: { left: 15, right: 15 },
    tableWidth: 'auto'
  });

  // Confidentiality footer
  const addConfidentialityNotice = () => {
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    
    const confidentialityText = [
      'CONFIDENTIAL DOCUMENT - STRICTLY PRIVATE AND PROPRIETARY INFORMATION',
      'This document contains confidential and proprietary information. Unauthorized use, disclosure, or distribution is prohibited.',
      '© LUZ TECHNOLOGY - All Rights Reserved'
    ];

    let startY = pageHeight - 15;
    confidentialityText.forEach((line, index) => {
      doc.text(line, doc.internal.pageSize.getWidth() / 2, startY + (index * 3), { align: 'center' });
    });
  };

  // Page numbering
  const addPageNumbers = () => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount}`, 
        doc.internal.pageSize.getWidth() - 20, 
        doc.internal.pageSize.getHeight() - 25,
        { align: 'right' }
      );
    }
  };

  // Main PDF composition
  await addHeader();
  
  // Start table right after header
  const tableStartY = 45;

  if (reportData[category]?.length > 0) {
    const rows = reportData[category];
    
    // Add table title
    doc.setFontSize(12);
    doc.setTextColor(colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(`${getCategoryDisplayName(category)} Data`, 15, tableStartY - 5);
    
    if (category === 'posts') {
      // Handle posts data for PDF - flatten the structure
      const flattenedData = [];
      rows.forEach(topic => {
        flattenedData.push({
          'Record Type': 'Topic',
          'Title': topic.topic_title,
          'Description': topic.topic_description || 'N/A',
          'Creator': topic.topic_creator,
          'Created': topic.topic_created_at,
          'Status': `${topic.topic_status} (${topic.topic_priority})`
        });
        
        topic.posts?.forEach(post => {
          flattenedData.push({
            'Record Type': 'Post',
            'Title': '↳ ' + (post.post_content?.substring(0, 40) + '...' || 'N/A'),
            'Description': post.post_content || 'N/A',
            'Creator': post.post_author,
            'Created': post.post_created_at,
            'Status': post.post_visibility
          });
        });
      });
      
      const columns = Object.keys(flattenedData[0] || {});
      const body = flattenedData.map(row => 
        columns.map(col => String(row[col] || 'N/A'))
      );

      doc.autoTable({
        ...getTableConfig(tableStartY),
        head: [columns],
        body: body
      });
    } else {
      // Handle regular data
      const columns = Object.keys(rows[0]);
      const body = rows.map((row) =>
        columns.map((col) => {
          if (typeof row[col] === 'object' && row[col] !== null) {
            return JSON.stringify(row[col]).substring(0, 40) + '...';
          }
          return String(row[col] ?? 'N/A');
        })
      );

      doc.autoTable({
        ...getTableConfig(tableStartY),
        head: [columns.map(col => col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))],
        body: body
      });
    }
    
    // Add metadata after the table
    const finalY = doc.lastAutoTable?.finalY || tableStartY + 20;
    addMetadataAfterTable(finalY + 10);
    
  } else {
    doc.setFontSize(12);
    doc.setTextColor(colors.text);
    doc.text('No data available for the selected category.', 15, tableStartY + 10);
    
    // Add metadata after "no data" message
    addMetadataAfterTable(tableStartY + 25);
  }

  addConfidentialityNotice();
  addPageNumbers();

  // Generate filename
  const filename = `LUZ_Report_${category}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

  // Helper function to get display names for categories
  const getCategoryDisplayName = (cat) => {
    const displayNames = {
      academic: 'Academic Overview (Courses, Batches, Enrollments)',
      performance: 'Student Performance (Progress, Assignments, Attendance)',
      analytics: 'Learning Analytics (Lessons, Assignment Analytics)',
      surveys: 'Surveys',
      responses: 'Survey Responses',
      feedback: 'Student Feedback',
      posts: 'Forum Posts'
    };
    return displayNames[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  // Helper function to get icons for categories
  const getCategoryIcon = (cat) => {
    const icons = {
      academic: <BookOpen size={16} />,
      performance: <TrendingUp size={16} />,
      analytics: <BarChart3 size={16} />,
      surveys: <MessageSquare size={16} />,
      responses: <MessageSquare size={16} />,
      feedback: <MessageSquare size={16} />,
      posts: <MessageSquare size={16} />
    };
    return icons[cat] || <BarChart3 size={16} />;
  };

  const renderPostsTable = (topics) => {
    if (!topics || topics.length === 0) return (
      <div className="text-center text-gray-500 p-4">
        No topics available
      </div>
    );

    return (
      <div className="space-y-6">
        {topics.map((topic) => (
          <div key={topic.topic_id} className="bg-white border rounded-lg shadow-sm">
            {/* Topic Header */}
            <div className="bg-gradient-to-r from-[#13367A] to-blue-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{topic.topic_title}</h3>
                  <p className="text-blue-100 text-sm mt-1">{topic.topic_description}</p>
                </div>
                <div className="text-right text-sm">
                  <div className="flex items-center gap-2 text-blue-100">
                    <User size={14} />
                    <span>{topic.topic_creator}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-100 mt-1">
                    <Calendar size={14} />
                    <span>{topic.topic_created_at}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Tag size={14} />
                    <span className={`px-2 py-1 rounded text-xs ${
                      topic.topic_priority === 'pinned' 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-blue-500 text-white'
                    }`}>
                      {topic.topic_priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      topic.topic_status === 'active' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}>
                      {topic.topic_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Section */}
            <div className="p-4">
              {topic.posts && topic.posts.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 flex items-center gap-2">
                    <MessageSquare size={16} />
                    Posts ({topic.posts.length})
                  </h4>
                  {topic.posts.map((post) => (
                    <div key={post.post_id} className="border-l-4 border-blue-200 bg-gray-50 p-3 rounded-r">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User size={14} />
                          <span className="font-medium">{post.post_author}</span>
                          <span>•</span>
                          <span>{post.post_created_at}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            post.post_visibility === 'visible' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {post.post_visibility}
                          </span>
                        </div>
                      </div>
                      <div className="text-gray-800">
                        {post.post_content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded">
                  <MessageSquare size={24} className="mx-auto mb-2 text-gray-400" />
                  <p>No posts in this topic yet</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCategoryTable = (rows) => {
    if (!rows || rows.length === 0) return (
      <div className="text-center text-gray-500 p-4">
        No data available for this category
      </div>
    );

    // Special handling for posts category (nested structure)
    if (category === 'posts') {
      return renderPostsTable(rows);
    }

    // Regular table for other categories
    const columns = Object.keys(rows[0]);

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-[#13367A] text-white">
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 text-left text-sm font-semibold">
                  {col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr 
                key={index} 
                className={`border-b hover:bg-blue-50 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
              >
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2 text-sm">
                    {typeof row[col] === 'object' && row[col] !== null ? (
                      <pre className="text-xs max-w-xs overflow-hidden">
                        {JSON.stringify(row[col], null, 2)}
                      </pre>
                    ) : (
                      <span className="truncate block max-w-xs">
                        {String(row[col] ?? 'N/A')}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-100 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <img src={Logo} alt="Logo" className="h-10 w-auto" />
        <h1 className="text-2xl md:text-3xl font-bold text-[#13367A]">
          Study Analytics Reports
        </h1>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-4">
          {/* Enhanced Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end mb-4">
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Category
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-2 focus:ring-[#13367A] focus:border-transparent"
              >
                <optgroup label="📚 Study Reports">
                  <option value="academic">📊 Academic Overview</option>
                  <option value="performance">📈 Student Performance</option>
                  <option value="analytics">🔍 Learning Analytics</option>
                </optgroup>
                <optgroup label="💬 Communication Reports">
                  <option value="surveys">📋 Surveys</option>
                  <option value="responses">✅ Survey Responses</option>
                  <option value="feedback">💭 Student Feedback</option>
                  <option value="posts">🗨️ Forum Posts</option>
                </optgroup>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-2 focus:ring-[#13367A]"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-2 focus:ring-[#13367A]"
              />
            </div>

            <div className="md:col-span-4 flex gap-2">
              <button
                onClick={() => fetchReportData(true)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#13367A] text-white text-sm rounded-md hover:bg-blue-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Filter size={16} />
                Filter
              </button>
              
              <button
                onClick={() => generatePDF(filtered ? 'Date Range Report' : 'Full Report')}
                disabled={!reportData[category] || reportData[category].length === 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Export PDF
              </button>
              
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate(new Date().toISOString().split('T')[0]);
                  fetchReportData(false);
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCcw size={16} />
                Reset
              </button>
            </div>
          </div>

          {/* Category Description and Summary */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-[#13367A]">
            <div className="flex items-center gap-2 mb-2">
              {getCategoryIcon(category)}
              <h3 className="font-semibold text-[#13367A]">
                {getCategoryDisplayName(category)}
              </h3>
            </div>
            {reportData.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                {Object.entries(reportData.summary).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-[#13367A]">
                      {typeof value === 'number' ? value.toFixed(0) : value}
                    </div>
                    <div className="text-sm text-gray-600">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#13367A]"></div>
              <span className="ml-3 text-gray-600">Loading report data...</span>
            </div>
          )}

          {/* Report Table */}
          {!loading && renderCategoryTable(reportData[category] || [])}
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
};

export default ReportPage;