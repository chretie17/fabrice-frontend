import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  FileText 
} from 'lucide-react';
import BackendPort from '../api';

const SurveyPage = () => {
  const [surveys, setSurveys] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentSurveyIndex, setCurrentSurveyIndex] = useState(0);

  useEffect(() => {
    fetchAvailableSurveys();
  }, []);

  const fetchAvailableSurveys = async () => {
    setLoading(true);
    try {
      const response = await axios.get(BackendPort.getApiUrl('tenant/available'));
      setSurveys(response.data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = { responses };
      await axios.post(BackendPort.getApiUrl('tenant/response'), payload);
      
      if (currentSurveyIndex < surveys.length - 1) {
        setCurrentSurveyIndex(prev => prev + 1);
        setResponses({});
      } else {
        alert('All surveys completed successfully!');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('There was an error submitting the survey.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestionInput = (question) => {
    switch (question.question_type) {
      case 'text':
        return (
          <input
            type="text"
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#123579] transition-colors"
            value={responses[question.question_id] || ''}
            onChange={(e) => handleResponseChange(question.question_id, e.target.value)}
            placeholder="Your answer here"
          />
        );
      
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <label 
                key={index} 
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition"
              >
                <input
                  type="radio"
                  name={`question-${question.question_id}`}
                  value={option}
                  className="form-radio text-[#123579] focus:ring-[#123579]"
                  checked={responses[question.question_id] === option}
                  onChange={(e) => handleResponseChange(question.question_id, e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'ratings':
        return (
          <div className="flex space-x-4 justify-center">
            {[1, 2, 3, 4, 5].map((rating) => (
              <label 
                key={rating} 
                className={`cursor-pointer p-3 rounded-full transition ${
                  responses[question.question_id] === rating.toString() 
                    ? 'bg-[#123579] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.question_id}`}
                  value={rating}
                  className="hidden"
                  checked={responses[question.question_id] === rating.toString()}
                  onChange={(e) => handleResponseChange(question.question_id, e.target.value)}
                />
                {rating}
              </label>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-pulse flex items-center space-x-3">
        <FileText className="text-[#123579] w-10 h-10" />
        <span className="text-xl text-gray-600">Loading Surveys...</span>
      </div>
    </div>
  );

  if (surveys.length === 0) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
      <p className="text-xl text-gray-600">No surveys available at the moment</p>
    </div>
  );

  const currentSurvey = surveys[currentSurveyIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-[#123579] text-white p-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            {currentSurvey.survey_title}
          </h1>
          <div className="text-sm">
            Survey {currentSurveyIndex + 1} of {surveys.length}
          </div>
        </div>

        <div className="p-6">
          {currentSurvey.questions.map((question) => (
            <div key={question.question_id} className="mb-6">
              <label className="block text-gray-700 font-medium mb-3">
                {question.question_text}
              </label>
              {renderQuestionInput(question)}
            </div>
          ))}

          <div className="flex justify-between items-center mt-8">
            {currentSurveyIndex > 0 && (
              <button
                onClick={() => setCurrentSurveyIndex(prev => prev - 1)}
                className="px-4 py-2 text-[#123579] hover:bg-gray-100 rounded-lg transition"
              >
                Previous Survey
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(responses).length === 0}
              className={`flex items-center space-x-2 px-6 py-3 bg-[#123579] text-white rounded-lg transition ${
                submitting || Object.keys(responses).length === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-opacity-90'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Survey'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyPage;