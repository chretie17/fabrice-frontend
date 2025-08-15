import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BackendPort from '../api';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('text');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingQuestionId, setUpdatingQuestionId] = useState(null);
  const [updatedQuestionText, setUpdatedQuestionText] = useState('');
  const [updatedOptions, setUpdatedOptions] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(BackendPort.getApiUrl('survey/questions'));
      setQuestions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      const questionData = {
        question_text: newQuestionText,
        question_type: questionType,
        options: questionType === 'multiple_choice' ? options : [],
      };

      await axios.post(BackendPort.getApiUrl('/admin/question'), questionData);
      setNewQuestionText('');
      setOptions([]);
      fetchQuestions();
    } catch (error) {
      console.error('Error creating question:', error);
    }
  };

  const handleUpdateQuestion = async (questionId) => {
    try {
      const updatedData = {
        questionId,
        question_text: updatedQuestionText,
        question_type: questionType,
        options: updatedOptions,
      };

      await axios.put(BackendPort.getApiUrl('survey/admin/question'), updatedData);
      setUpdatingQuestionId(null);
      setUpdatedQuestionText('');
      setUpdatedOptions([]);
      fetchQuestions();
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await axios.delete(BackendPort.getApiUrl(`survey/admin/question/${questionId}`));
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl border border-gray-200">
        <div className="bg-[#13377C] text-white p-6 rounded-t-2xl flex items-center">
          <Plus className="mr-3" />
          <h1 className="text-2xl font-bold">Question Management</h1>
        </div>

        <div className="p-6 space-y-8">
          {/* Add New Question Section */}
          <section>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Add a New Question</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter question text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13377C]/50 focus:outline-none"
                />
                <select
                  onChange={(e) => setQuestionType(e.target.value)}
                  value={questionType}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="text">Text</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="ratings">Ratings</option>
                </select>
                {questionType === 'multiple_choice' && (
                  <input
                    type="text"
                    placeholder="Enter options (comma separated)"
                    value={options.join(', ')}
                    onChange={(e) => setOptions(e.target.value.split(',').map(option => option.trim()))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                )}
                <button
                  onClick={handleCreateQuestion}
                  className="w-full bg-[#13377C] text-white p-3 rounded-lg hover:bg-[#0e2a63] transition-colors flex items-center justify-center"
                >
                  <Plus className="mr-2" /> Create Question
                </button>
              </div>
            </div>
          </section>

          {/* Existing Questions Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Existing Questions</h2>
            {loading ? (
              <p className="text-center text-gray-500">Loading questions...</p>
            ) : questions.length === 0 ? (
              <p className="text-center text-gray-500">No questions available.</p>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div 
                    key={question.question_id} 
                    className="bg-gray-50 border border-gray-200 rounded-xl p-5"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">{question.survey_title}</h3>
                      {updatingQuestionId === question.question_id ? (
                        <button
                          onClick={() => setUpdatingQuestionId(null)}
                          className="text-red-500 hover:text-red-700 flex items-center"
                        >
                          <XCircle className="mr-1" /> Cancel
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setUpdatingQuestionId(question.question_id);
                            setUpdatedQuestionText(question.question_text);
                            setUpdatedOptions(question.options);
                          }}
                          className="text-blue-500 hover:text-blue-700 flex items-center"
                        >
                          <Edit className="mr-1" /> Edit
                        </button>
                      )}
                    </div>
                    <p className="text-gray-500 mb-2">{question.survey_description}</p>

                    {updatingQuestionId === question.question_id ? (
                      <div className="space-y-4 mt-4">
                        <input
                          type="text"
                          value={updatedQuestionText}
                          onChange={(e) => setUpdatedQuestionText(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                        <select
                          onChange={(e) => setQuestionType(e.target.value)}
                          value={questionType}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        >
                          <option value="text">Text</option>
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="ratings">Ratings</option>
                        </select>
                        {questionType === 'multiple_choice' && (
                          <input
                            type="text"
                            placeholder="Enter options (comma separated)"
                            value={updatedOptions.join(', ')}
                            onChange={(e) => setUpdatedOptions(e.target.value.split(',').map(option => option.trim()))}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                          />
                        )}
                        <button
                          onClick={() => handleUpdateQuestion(question.question_id)}
                          className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 flex items-center justify-center"
                        >
                          <CheckCircle className="mr-2" /> Update Question
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">{question.question_text}</p>
                        <p className="text-sm text-gray-600 mb-2">Type: {question.question_type}</p>
                        {question.options && question.options.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {question.options.map((option, index) => (
                              <li key={index} className="text-sm text-gray-500">• {option}</li>
                            ))}
                          </ul>
                        )}
                        <div className="mt-4 flex space-x-4">
                          <button
                            onClick={() => handleDeleteQuestion(question.question_id)}
                            className="flex-1 bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 flex items-center justify-center"
                          >
                            <Trash2 className="mr-2" /> Delete
                          </button>
                          <button
                            onClick={() => {
                              setUpdatingQuestionId(question.question_id);
                              setUpdatedQuestionText(question.question_text);
                              setUpdatedOptions(question.options);
                            }}
                            className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 flex items-center justify-center"
                          >
                            <Edit className="mr-2" /> Edit
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default QuestionManagement;