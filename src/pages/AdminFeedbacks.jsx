import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BackendPort from '../api';
import { Star, MessageCircle, Send, Clock, CheckCircle, User, Calendar, BarChart, ChevronDown, ChevronUp } from 'lucide-react';
import ReactApexChart from 'react-apexcharts';

const AdminFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState('');
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const apiUrl = BackendPort.getApiUrl('feedback');
        const response = await axios.get(apiUrl);
        setFeedbacks(response.data);
        setFilteredFeedbacks(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        alert('Error fetching feedbacks');
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  useEffect(() => {
    filterFeedbacks();
  }, [selectedRating, feedbacks]);

  const filterFeedbacks = () => {
    if (!selectedRating) {
      setFilteredFeedbacks(feedbacks);
      return;
    }
    const filtered = feedbacks.filter(feedback => feedback.rating === parseInt(selectedRating));
    setFilteredFeedbacks(filtered);
  };

  const handleResponseChange = (feedbackId, value) => {
    setResponses(prev => ({
      ...prev,
      [feedbackId]: value
    }));
  };

  const handleSubmitResponse = async (feedbackId) => {
    const response = responses[feedbackId];
    if (!response) {
      alert('Please provide a response.');
      return;
    }

    try {
      const apiUrl = BackendPort.getApiUrl(`feedback/response/${feedbackId}`);
      await axios.post(apiUrl, { response });
      
      setFeedbacks(prevFeedbacks =>
        prevFeedbacks.map(feedback =>
          feedback.id === feedbackId ? { ...feedback, response } : feedback
        )
      );
      
      setResponses(prev => {
        const newResponses = { ...prev };
        delete newResponses[feedbackId];
        return newResponses;
      });
      
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Error submitting response');
    }
  };

  const renderStars = (rating, interactive = false) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={interactive ? 20 : 16}
        className={`${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
          ${interactive && "cursor-pointer hover:scale-110 transition-transform"}`}
        onClick={interactive ? () => setSelectedRating((index + 1).toString()) : undefined}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '50%',
        borderRadius: 6,
        dataLabels: {
          position: 'bottom'
        }
      }
    },
    colors: ['#13377C'],
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        colors: ['#fff']
      },
      formatter: function (val) {
        return val + " Stars";
      },
      offsetX: 0
    },
    xaxis: {
      categories: filteredFeedbacks.map(item => item.service_type),
      labels: {
        style: {
          colors: '#333',
          fontSize: '14px'
        }
      },
      axisBorder: {
        show: false
      },
      max: 5
    },
    yaxis: {
      labels: {
        style: {
          colors: '#333',
          fontSize: '14px'
        }
      }
    },
    grid: {
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: false
        }
      }
    },
    title: {
      text: 'Service Ratings Overview',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#333'
      }
    },
    tooltip: {
      y: {
        title: {
          formatter: (seriesName) => 'Rating'
        }
      }
    }
  };

  const chartSeries = [{
    name: 'Rating',
    data: filteredFeedbacks.map(item => item.rating)
  }];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Feedback List Section */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="bg-[#13377C] text-white p-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <MessageCircle size={24} />
                Feedback Management
              </h1>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {filteredFeedbacks.length} Feedback{filteredFeedbacks.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600">Filter by rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(selectedRating === rating.toString() ? '' : rating.toString())}
                      className={`p-1 rounded ${parseInt(selectedRating) >= rating ? 'bg-[#13377C]/10' : ''}`}
                    >
                      <Star
                        size={20}
                        className={`${parseInt(selectedRating) >= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'} 
                        hover:text-yellow-400 hover:fill-yellow-400 transition-colors`}
                      />
                    </button>
                  ))}
                  {selectedRating && (
                    <button
                      onClick={() => setSelectedRating('')}
                      className="text-sm text-gray-500 hover:text-gray-700 ml-2"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowCharts(!showCharts)}
                className="flex items-center gap-2 px-4 py-2 bg-[#13377C] text-white rounded-lg hover:bg-[#0e2a63] transition-colors"
              >
                <BarChart size={18} />
                {showCharts ? 'Hide Charts' : 'Show Charts'}
                {showCharts ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>

          {/* Charts Section */}
          {showCharts && (
            <div className="border-b border-gray-200">
              <div className="p-6">
                <ReactApexChart
                  options={chartOptions}
                  series={chartSeries}
                  type="bar"
                  height={350}
                />
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Clock className="animate-spin mr-2" />
              <span className="text-gray-600">Loading feedbacks...</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((feedback) => (
                  <div key={feedback.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Left Column - Feedback Details */}
                      <div className="md:col-span-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User size={18} className="text-gray-400" />
                            <span className="font-medium text-gray-700">
                              {feedback.tenant_name || 'Anonymous'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {formatDate(feedback.created_at)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">
                            {feedback.service_type}
                          </span>
                          <div className="flex">
                            {renderStars(feedback.rating)}
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-700 text-sm">{feedback.comments}</p>
                        </div>

                        {feedback.response && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle size={16} className="text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Admin Response</span>
                            </div>
                            <p className="text-gray-700 text-sm">{feedback.response}</p>
                          </div>
                        )}
                      </div>

                      {/* Right Column - Response Area */}
                      <div className="md:col-span-1">
                        <div className="space-y-2">
                          <textarea
                            className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#13377C]/30 focus:outline-none resize-none"
                            placeholder="Type your response..."
                            value={responses[feedback.id] || ''}
                            onChange={(e) => handleResponseChange(feedback.id, e.target.value)}
                            rows="4"
                          />
                          <button
                            onClick={() => handleSubmitResponse(feedback.id)}
                            className="w-full px-3 py-2 bg-[#13377C] text-white text-sm rounded-lg hover:bg-[#0e2a63] transition-colors flex items-center justify-center gap-2"
                          >
                            <Send size={16} />
                            Send Response
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="mx-auto mb-2 text-gray-400" size={24} />
                  <p>No feedbacks available for the selected filter.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackPage;