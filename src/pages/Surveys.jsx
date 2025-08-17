import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import BackendPort from '../api';

const studentSurvey = () => {
  const [surveys, setSurveys] = useState([]);
  const [responses, setResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await axios.get(BackendPort.getApiUrl('survey/student/available'));
        setSurveys(response.data);
        // Set first survey as active by default
        if (response.data.length > 0) {
          setActiveTab(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching surveys:', error);
      }
    };

    fetchSurveys();
  }, []);

  const handleResponseChange = (questionId, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (surveyId) => {
    setSubmitting(true);
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User is not authenticated.');
      setSubmitting(false);
      return;
    }

    try {
      const formattedResponses = Object.keys(responses).map((questionId) => ({
        questionId: questionId,
        response: responses[questionId],
      }));
  
      const payload = {
        surveyId: surveyId,
        userId: userId,
        responses: formattedResponses,
      };
  
      await axios.post(BackendPort.getApiUrl('survey/student/response'), payload);
      
      alert('Survey submitted successfully!');
      // Reset responses after successful submission
      setResponses({});
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('There was an error submitting the survey.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-6 flex items-center">
          <FileText className="w-10 h-10 mr-4" />
          <h1 className="text-3xl font-bold">Surveys</h1>
        </div>

        {surveys.length > 0 ? (
          <div className="p-6">
            {/* Survey Navigation Tabs */}
            <div className="flex mb-6 border-b">
              {surveys.map((survey) => (
                <button
                  key={survey.id}
                  onClick={() => setActiveTab(survey.id)}
                  className={`px-4 py-2 -mb-px border-b-2 ${
                    activeTab === survey.id 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {survey.title}
                </button>
              ))}
            </div>

            {surveys.map((survey) => activeTab === survey.id && (
              <div key={survey.id} className="space-y-6">
                <div className="bg-gray-100 p-4 rounded-lg flex items-center">
                  <div className="flex-1">
                    <p className="text-lg font-semibold">{survey.title}</p>
                    <p className="text-gray-600">{survey.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>{new Date(survey.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      <span>{new Date(survey.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {survey.questions.map((question) => (
                    <div 
                      key={`${survey.id}-${question.id}`} 
                      className="bg-white shadow rounded-lg p-6"
                    >
                      <p className="text-lg font-medium mb-4">{question.question_text}</p>

                      {question.question_type === 'text' && (
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
                          value={responses[question.id] || ''}
                          onChange={(e) =>
                            handleResponseChange(question.id, e.target.value)
                          }
                          placeholder="Type your answer here"
                        />
                      )}

                      {question.question_type === 'multiple_choice' && (
                        <div className="space-y-2">
                          {question.options.map((option) => (
                            <label 
                              key={`${survey.id}-${question.id}-${option}`} 
                              className="flex items-center space-x-3 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option}
                                className="text-blue-600 focus:ring-blue-500 border-gray-300"
                                checked={responses[question.id] === option}
                                onChange={(e) =>
                                  handleResponseChange(question.id, e.target.value)
                                }
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.question_type === 'ratings' && (
                        <div className="flex space-x-4 justify-center">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <label 
                              key={`${survey.id}-${question.id}-rating-${rating}`} 
                              className="flex flex-col items-center cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={rating}
                                className="sr-only"
                                checked={responses[question.id] === rating.toString()}
                                onChange={(e) =>
                                  handleResponseChange(question.id, e.target.value)
                                }
                              />
                              <span 
                                className={`
                                  w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold 
                                  transition duration-200 ease-in-out
                                  ${responses[question.id] === rating.toString() 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-200 text-gray-600 hover:bg-blue-100'
                                  }
                                `}
                              >
                                {rating}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubmit(survey.id)}
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 
                    transition duration-300 ease-in-out transform hover:-translate-y-1 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 
                    flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2" />
                      Submit Survey
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xl">No surveys available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default studentSurvey;