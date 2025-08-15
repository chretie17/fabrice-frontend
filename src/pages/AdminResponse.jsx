import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ChevronDown, 
  FileSpreadsheet, 
  BarChart, 
  EyeIcon, 
  MessageSquareText, 
  User,
  Calendar
} from 'lucide-react';
import BackendPort from '../api';

const AdminSurveyResponses = () => {
  const [surveysWithResponses, setSurveysWithResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSurveys, setExpandedSurveys] = useState({});
  const [responseDisplayLimits, setResponseDisplayLimits] = useState({});
  const [filters, setFilters] = useState({
    sortBy: 'latest',
    showOnlyWithResponses: false
  });

  const RESPONSES_PER_PAGE = 3;

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const apiUrl = `${BackendPort.getApiUrl('survey/responses')}`;
        const response = await axios.get(apiUrl);
        let sortedSurveys = response.data.surveys;
        if (filters.sortBy === 'latest') {
          sortedSurveys = sortedSurveys.sort((a, b) => 
            new Date(b.survey.created_at) - new Date(a.survey.created_at)
          );
        } else if (filters.sortBy === 'oldest') {
          sortedSurveys = sortedSurveys.sort((a, b) => 
            new Date(a.survey.created_at) - new Date(b.survey.created_at)
          );
        }
        if (filters.showOnlyWithResponses) {
          sortedSurveys = sortedSurveys.filter(survey => survey.responses.length > 0);
        }
        setSurveysWithResponses(sortedSurveys);
        setLoading(false);
      } catch (error) {
        setError('Error fetching surveys and responses');
        setLoading(false);
      }
    };
    fetchResponses();
  }, [filters]);

  const toggleSurveyExpansion = (index) => {
    setExpandedSurveys(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const loadMoreResponses = (surveyIndex) => {
    setResponseDisplayLimits(prev => ({
      ...prev,
      [surveyIndex]: (prev[surveyIndex] || RESPONSES_PER_PAGE) + RESPONSES_PER_PAGE
    }));
  };

  const renderResponseBadge = (type) => {
    const badgeStyles = {
      'ratings': 'bg-yellow-100 text-yellow-800',
      'multiple-choice': 'bg-blue-100 text-blue-800',
      'text': 'bg-green-100 text-green-800'
    };
    return badgeStyles[type] || 'bg-gray-100 text-gray-800';
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <BarChart className="w-16 h-16 text-[#13377C] mb-2" />
        <span className="text-gray-600">Loading Survey Responses...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-center mx-4">
      {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="bg-[#13377C] text-white p-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <FileSpreadsheet size={24} />
                Service Request Surveys
              </h1>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {surveysWithResponses.length} Survey{surveysWithResponses.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="border-b border-gray-200 bg-gray-50">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#13377C]"
                  >
                    <option value="latest">Latest Surveys</option>
                    <option value="oldest">Oldest Surveys</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-500" />
                </div>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filters.showOnlyWithResponses}
                    onChange={(e) => handleFilterChange('showOnlyWithResponses', e.target.checked)}
                    className="form-checkbox h-4 w-4 text-[#13377C] rounded focus:ring-[#13377C]"
                  />
                  <span className="text-sm text-gray-700">Show Only with Responses</span>
                </label>
              </div>
            </div>
          </div>

          {surveysWithResponses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquareText className="mx-auto mb-2 text-gray-400" size={24} />
              <p>No surveys available for the selected filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {surveysWithResponses.map((survey, index) => (
                <div key={index} className="hover:bg-gray-50 transition-colors">
                  <div 
                    onClick={() => toggleSurveyExpansion(index)}
                    className="p-4 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {formatDate(survey.survey.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquareText className="w-4 h-4 text-[#13377C]" />
                        <span className="text-sm text-gray-600">
                          {survey.responses.length} Response{survey.responses.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-semibold text-[#13377C] mb-1">
                          {survey.survey.title}
                        </h2>
                        <p className="text-gray-600 text-sm">{survey.survey.description}</p>
                      </div>
                      <ChevronDown 
                        className={`w-6 h-6 text-[#13377C] transition-transform duration-200 ${
                          expandedSurveys[index] ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>
                  </div>

                  {expandedSurveys[index] && (
                    <div className="border-t border-gray-100 p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">Survey Details</h3>
                            <p className="text-gray-700 text-sm">{survey.survey.description}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {survey.responses.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No responses yet</p>
                          ) : (
                            <>
                              {survey.responses
                                .slice(0, (responseDisplayLimits[index] || RESPONSES_PER_PAGE))
                                .map((response, idx) => (
                                  <div 
                                    key={idx} 
                                    className="bg-gray-50 rounded-lg p-4"
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <User size={18} className="text-[#13377C]" />
                                      <span className="font-medium text-gray-900">
                                        {response.user_name}
                                      </span>
                                    </div>
                                    {response.responses.map((answer, ansIdx) => (
                                      <div 
                                        key={ansIdx} 
                                        className="mb-3 pl-3 border-l-2 border-[#13377C]"
                                      >
                                        <div className="text-sm text-gray-700 mb-1">
                                          {answer.question_text}
                                        </div>
                                        <div 
                                          className={`inline-block px-2 py-1 rounded text-xs ${
                                            renderResponseBadge(answer.question_type)
                                          }`}
                                        >
                                          {answer.response}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              
                              {survey.responses.length > (responseDisplayLimits[index] || RESPONSES_PER_PAGE) && (
                                <button 
                                  onClick={() => loadMoreResponses(index)}
                                  className="w-full flex items-center justify-center gap-2 bg-[#13377C] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                  <span>View More</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSurveyResponses;