import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Snackbar } from '@mui/material';
import { Download, Filter, RefreshCcw } from 'lucide-react';

const ReportPage = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [filtered, setFiltered] = useState(false);
  const [category, setCategory] = useState('surveys');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchReportData = async (filterByDate = false) => {
    setLoading(true);
    setReportData({});
    
    const params = { category };
    
    if (filterByDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      params.end_date = end.toISOString();
      params.type = 'date_range';
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        params.start_date = start.toISOString();
      }
    }
  
    try {
      const response = await axios.get('http://localhost:3000/api/reports', { params });
      
      if (!response.data[category] || response.data[category].length === 0) {
        setSnackbarMessage('No data found for the selected category and date range.');
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
    fetchReportData();
  }, [category]);

  // Keep the existing generatePDF function unchanged
  const generatePDF = (title) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
  
    // Enhanced Color Palette
    const colors = {
      primary: '#1A4B8D',
      secondary: '#2C3E50',
      accent: '#3498DB',
      background: '#F4F6F9'
    };
  
    // Professional Header with Advanced Styling
    const addHeader = () => {
      // Gradient Background for Header
      doc.setFillColor(colors.primary);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 20, 'F');
      
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('SYSTEM ANALYTICS REPORT', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    };
  
    // Enhanced Confidentiality Notice
    const addConfidentialityNotice = () => {
      doc.setFontSize(8);
      doc.setTextColor(100);
      
      const confidentialityText = [
        'CONFIDENTIAL DOCUMENT',
        'Strictly Private and Proprietary Information',
        'Unauthorized Use Prohibited'
      ];
  
      const startY = doc.internal.pageSize.getHeight() - 20;
      confidentialityText.forEach((line, index) => {
        doc.text(line, doc.internal.pageSize.getWidth() / 2, startY + (index * 4), { align: 'center' });
      });
    };
  
    // Detailed Metadata
    const addMetadata = () => {
      doc.setFontSize(10);
      doc.setTextColor(50);
  
      const now = new Date();
      doc.text(`Generated: ${now.toLocaleString()}`, 15, 35);
      
      if (filtered && startDate && endDate) {
        doc.text(`Date Range: ${startDate} to ${endDate}`, 15, 42);
      }
  
      doc.text(`Category: ${category.toUpperCase()}`, 15, 49);
      doc.text(`Total Records: ${reportData[category]?.length || 0}`, 15, 56);
    };
  
    // Advanced Table Styling
    const tableConfig = {
      startY: 70,
      theme: 'grid',
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: colors.accent
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255]
      }
    };
  
    // Sophisticated Watermark
    const addWatermark = () => {
      doc.setTextColor(200);
      doc.setFontSize(80);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORT', 
        doc.internal.pageSize.getWidth() / 2, 
        doc.internal.pageSize.getHeight() / 2, 
        { align: 'center', angle: -45, opacity: 0.1 }
      );
    };
  
    // Enhanced Page Numbering
    const addFooter = () => {
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Page ${i} of ${pageCount}`, 
          doc.internal.pageSize.getWidth() - 30, 
          doc.internal.pageSize.getHeight() - 10,
          { align: 'right' }
        );
      }
    };
  
    // PDF Composition
    addHeader();
    addMetadata();
    addWatermark();
  
    if (reportData[category]?.length > 0) {
      const rows = reportData[category];
      const columns = Object.keys(rows[0]);
      const body = rows.map((row) =>
        columns.map((col) => 
          typeof row[col] === 'object' 
            ? JSON.stringify(row[col], null, 2) 
            : (row[col] ?? 'N/A')
        )
      );
  
      doc.autoTable({
        ...tableConfig,
        head: [columns],
        body: body
      });
    } else {
      doc.text('No data available for the selected category.', 15, 80);
    }
  
    addConfidentialityNotice();
    addFooter();
  
    // Secure filename with timestamp
    const filename = `Analytics_Report_${category}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };


  const renderCategoryTable = (rows) => {
    if (!rows || rows.length === 0) return (
      <div className="text-center text-gray-500 p-4">
        No data available for this category
      </div>
    );

    const columns = Object.keys(rows[0]);

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-[#13367A] text-white">
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 text-left text-sm font-semibold">{col}</th>
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
                    {typeof row[col] === 'object' ? (
                      <pre className="text-xs">{JSON.stringify(row[col], null, 2)}</pre>
                    ) : (
                      row[col]
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
    <div className="max-w-6xl mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-[#13367A] mb-4">
        System Reports
      </h1>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-4">
          {/* Compact Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end mb-4">
            <div className="md:col-span-3">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-2 focus:ring-[#13367A] focus:border-transparent"
              >
                <option value="surveys">Surveys</option>
                <option value="responses">Responses</option>
                <option value="services">Services</option>
                <option value="feedback">Feedback</option>
                <option value="posts">Posts</option>
                <option value="comments">Comments</option>
              </select>
            </div>
            
            <div className="md:col-span-3">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
                className="w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-2 focus:ring-[#13367A]"
              />
            </div>
            
            <div className="md:col-span-3">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-2 focus:ring-[#13367A]"
              />
            </div>

            <div className="md:col-span-3 flex gap-2">
              <button
                onClick={() => fetchReportData(true)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#13367A] text-white text-sm rounded-md hover:bg-blue-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Filter size={16} />
                <span className="hidden md:inline">Filter</span>
              </button>
              
              <button
                onClick={() => generatePDF(filtered ? 'Date Range Report' : 'Full Report')}
                className="flex-1 px-4 py-2 bg-[#13367A] text-white text-sm rounded-md hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} />
                <span className="hidden md:inline">Export</span>
              </button>
              
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate(new Date().toISOString().split('T')[0]);
                  fetchReportData();
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCcw size={16} />
                <span className="hidden md:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-[#13367A]"></div>
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