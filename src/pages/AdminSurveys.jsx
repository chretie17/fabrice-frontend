import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BackendPort from '../api';
import { Snackbar, Alert } from '@mui/material';
import dayjs from 'dayjs';
import { ChevronDown, ChevronUp } from 'lucide-react';

const AdminSurveyPage = () => {
  const [surveys, setSurveys] = useState([]);
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
  });
  const [newQuestion, setNewQuestion] = useState({
    surveyId: '',
    question_text: '',
    question_type: '',
    options: [],
  });
  const [surveyToEdit, setSurveyToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // New state for form visibility
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  // Existing methods remain the same...
  const fetchSurveys = async () => {
    try {
      const apiUrl = BackendPort.getApiUrl('survey/admin/all');
      const response = await axios.get(apiUrl);
      setSurveys(response.data);
    } catch (error) {
      setSnackbarMessage('Failed to fetch surveys.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const formatDate = (date) => {
    return dayjs(date).format('MM/DD/YYYY');
  };

  const formatDateForInput = (date) => {
    return dayjs(date).format('YYYY-MM-DD');
  };

  const handleCreateSurvey = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const apiUrl = BackendPort.getApiUrl('survey/admin/create');
      const response = await axios.post(apiUrl, newSurvey);
      setSnackbarMessage('Survey created successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setNewSurvey({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
      });
      fetchSurveys();
      setShowSurveyForm(false);
    } catch (error) {
      setSnackbarMessage('Error creating survey');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleSurveyStatus = async (surveyId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setLoadingAction(true);
    try {
      const apiUrl = BackendPort.getApiUrl('survey/admin/status');
      await axios.put(apiUrl, { surveyId, status: newStatus });
      setSnackbarMessage(`Survey ${newStatus}d successfully`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchSurveys();
    } catch (error) {
      setSnackbarMessage('Error toggling survey status');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const optionsArray = newQuestion.options
        .split(',')
        .map(option => option.trim());

      const apiUrl = BackendPort.getApiUrl('survey/admin/question');
      await axios.post(apiUrl, {
        ...newQuestion,
        options: optionsArray,
      });

      setSnackbarMessage('Question added successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setNewQuestion({ surveyId: '', question_text: '', question_type: '', options: '' });
      fetchSurveys();
      setShowQuestionForm(false);
    } catch (error) {
      setSnackbarMessage('Error adding question');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEditSurvey = (survey) => {
    setSurveyToEdit(survey);
    setNewSurvey({
      title: survey.title,
      description: survey.description,
      start_date: formatDateForInput(survey.start_date),
      end_date: formatDateForInput(survey.end_date),
    });
    setShowSurveyForm(true);
  };

  const handleUpdateSurvey = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const apiUrl = BackendPort.getApiUrl('survey/admin/update');
      await axios.put(apiUrl, { surveyId: surveyToEdit.id, ...newSurvey });
      setSnackbarMessage('Survey updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setSurveyToEdit(null);
      fetchSurveys();
      setShowSurveyForm(false);
    } catch (error) {
      setSnackbarMessage('Error updating survey');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteSurvey = async (surveyId) => {
    if (window.confirm('Are you sure you want to delete this survey?')) {
      setLoadingAction(true);
      try {
        const apiUrl = BackendPort.getApiUrl('survey/admin/delete');
        await axios.delete(apiUrl, { data: { surveyId } });
        setSnackbarMessage('Survey deleted successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        fetchSurveys();
      } catch (error) {
        setSnackbarMessage('Error deleting survey');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoadingAction(false);
      }
    }
  };

  if (loading) {
    return <div className="text-center">Loading surveys...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">Survey Management</h1>

      {/* Collapsible Survey Form */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <button 
          onClick={() => setShowSurveyForm(!showSurveyForm)}
          className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-2xl font-semibold text-gray-800">
            {surveyToEdit ? 'Update Survey' : 'Create a New Survey'}
          </h2>
          {showSurveyForm ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </button>
        
        {showSurveyForm && (
          <div className="p-6">
            <form onSubmit={surveyToEdit ? handleUpdateSurvey : handleCreateSurvey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600" htmlFor="title">
                  Survey Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full p-3 border border-gray-300 rounded-md mt-1"
                  value={newSurvey.title}
                  onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  className="w-full p-3 border border-gray-300 rounded-md mt-1"
                  value={newSurvey.description}
                  onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600" htmlFor="start_date">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    className="w-full p-3 border border-gray-300 rounded-md mt-1"
                    value={newSurvey.start_date}
                    onChange={(e) => setNewSurvey({ ...newSurvey, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600" htmlFor="end_date">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    className="w-full p-3 border border-gray-300 rounded-md mt-1"
                    value={newSurvey.end_date}
                    onChange={(e) => setNewSurvey({ ...newSurvey, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full md:w-auto bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled={loadingAction}
              >
                {surveyToEdit ? 'Update Survey' : 'Create Survey'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Collapsible Question Form */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <button 
          onClick={() => setShowQuestionForm(!showQuestionForm)}
          className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-2xl font-semibold text-gray-800">Add a Question</h2>
          {showQuestionForm ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </button>
        
        {showQuestionForm && (
          <div className="p-6">
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600" htmlFor="surveyId">
                  Survey
                </label>
                <select
                  id="surveyId"
                  className="w-full p-3 border border-gray-300 rounded-md mt-1"
                  value={newQuestion.surveyId}
                  onChange={(e) => setNewQuestion({ ...newQuestion, surveyId: e.target.value })}
                  required
                >
                  <option value="">Select Survey</option>
                  {surveys.map((survey) => (
                    <option key={survey.id} value={survey.id}>
                      {survey.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600" htmlFor="question_text">
                  Question Text
                </label>
                <input
                  type="text"
                  id="question_text"
                  className="w-full p-3 border border-gray-300 rounded-md mt-1"
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600" htmlFor="question_type">
                  Question Type
                </label>
                <select
                  id="question_type"
                  className="w-full p-3 border border-gray-300 rounded-md mt-1"
                  value={newQuestion.question_type}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="multiple_choice">Multiple Choice</option>
                </select>
              </div>

              {newQuestion.question_type === 'multiple_choice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600" htmlFor="options">
                    Options (comma separated)
                  </label>
                  <input
                    type="text"
                    id="options"
                    className="w-full p-3 border border-gray-300 rounded-md mt-1"
                    value={newQuestion.options}
                    onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full md:w-auto bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                disabled={loadingAction}
              >
                Add Question
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Survey List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50">
          <h2 className="text-2xl font-semibold text-gray-800">All Surveys</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Survey Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {surveys.map((survey) => (
                <tr key={survey.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{survey.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(survey.start_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(survey.end_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      survey.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {survey.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                    <button
                      onClick={() => handleEditSurvey(survey)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSurvey(survey.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleToggleSurveyStatus(survey.id, survey.status)}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      Toggle Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminSurveyPage;