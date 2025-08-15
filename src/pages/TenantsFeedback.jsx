import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Star, 
  MessageCircle, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Building2,
  Clock,
  ThumbsUp,
  Sparkles,
  MessagesSquare
} from 'lucide-react';
import BackendPort from '../api';

// Enhanced Toast Component
const Toast = ({ message, type, onClose }) => {
  return (
    <div 
      className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg transition-all duration-300 transform animate-slide-in-right
        ${type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gradient-to-r from-red-500 to-red-600 text-white'}`}
    >
      <div className="flex justify-between items-center">
        <span className="flex items-center">
          {type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
          {message}
        </span>
        <button 
          onClick={onClose} 
          className="ml-4 hover:bg-white/20 rounded-full p-1 transition-colors duration-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const EmptyState = ({ onNewFeedback }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 animate-fade-in">
    <div className="relative">
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-75 blur-lg animate-pulse"></div>
      <div className="relative bg-white p-8 rounded-full">
        <MessagesSquare className="w-20 h-20 text-blue-600" />
      </div>
    </div>
    <h3 className="mt-8 text-2xl font-bold text-gray-900 text-center">
      Welcome to Our Feedback Portal
    </h3>
    <p className="mt-4 text-lg text-gray-600 text-center max-w-md">
      No services have been requested yet. Once you receive a service, you can share your valuable feedback here.
    </p>
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center">
        <ThumbsUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
        <h4 className="font-semibold text-blue-900">Rate Services</h4>
        <p className="text-sm text-blue-700 mt-2">Share your experience with our services</p>
      </div>
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl text-center">
        <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
        <h4 className="font-semibold text-purple-900">Provide Comments</h4>
        <p className="text-sm text-purple-700 mt-2">Help us understand your needs better</p>
      </div>
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl text-center">
        <Sparkles className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
        <h4 className="font-semibold text-indigo-900">Improve Together</h4>
        <p className="text-sm text-indigo-700 mt-2">Your feedback shapes our service</p>
      </div>
    </div>
    <button
      onClick={onNewFeedback}
      className="mt-8 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl
        hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-1 transition-all duration-300
        shadow-lg hover:shadow-xl font-medium text-lg flex items-center"
    >
      <MessageCircle className="w-5 h-5 mr-2" />
      Request a Service
    </button>
  </div>
);

const FeedbackPage = () => {
  const [services, setServices] = useState([]);
  const [feedback, setFeedback] = useState({
    service_id: '',
    rating: '',
    comments: ''
  });
  const [tenantFeedbacks, setTenantFeedbacks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [hoverRating, setHoverRating] = useState(0);

  // Enhanced rating descriptions with emojis
  const ratingDescriptions = {
    1: '😟 Very Unsatisfactory - Serious Concerns',
    2: '😕 Below Expectations - Needs Improvement',
    3: '😐 Average - Some Aspects Need Work',
    4: '😊 Good - Mostly Meets Expectations',
    5: '😃 Excellent - Outstanding Service'
  };

  const showToast = (type, message) => {
    setToastType(type);
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const tenantId = localStorage.getItem('userId');
        const apiUrl = BackendPort.getApiUrl(`feedback/${tenantId}`);
        const response = await axios.get(apiUrl);
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
        showToast('error', 'Unable to fetch services. Please try again later.');
      }
    };

    const fetchTenantFeedbacks = async () => {
      try {
        const tenantId = localStorage.getItem('userId');
        const apiUrl = BackendPort.getApiUrl(`feedback/user/${tenantId}`);
        const response = await axios.get(apiUrl);
        setTenantFeedbacks(response.data);
      } catch (error) {
        console.error('Error fetching tenant feedbacks:', error);
        showToast('error', 'Unable to fetch your previous feedback. Please try again later.');
      }
    };

    fetchServices();
    fetchTenantFeedbacks();
  }, []);

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedback((prevFeedback) => ({
      ...prevFeedback,
      [name]: value
    }));
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.service_id || !feedback.rating || !feedback.comments) {
      showToast('error', 'Please fill out all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = BackendPort.getApiUrl('feedback');
      const response = await axios.post(apiUrl, {
        userId: localStorage.getItem('userId'),
        ...feedback
      });

      showToast('success', response.data.message);
      
      // Refresh tenant feedbacks after successful submission
      const tenantId = localStorage.getItem('userId');
      const fetchFeedbackUrl = BackendPort.getApiUrl(`feedback/user/${tenantId}`);
      const updatedFeedbacks = await axios.get(fetchFeedbackUrl);
      setTenantFeedbacks(updatedFeedbacks.data);

      setFeedback({
        service_id: '',
        rating: '',
        comments: ''
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast('error', 'Error submitting feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star 
        key={index} 
        className={`w-6 h-6 transition-all duration-200 ${
          index < rating 
            ? 'text-yellow-500 transform scale-110' 
            : 'text-gray-300'
        }`} 
        fill={index < rating ? '#FFC107' : 'none'}
      />
    ));
  };

  // If there are no services, show the empty state
  if (services.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <EmptyState onNewFeedback={() => {/* Handle new feedback request */}} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType}
          onClose={() => setToastMessage(null)} 
        />
      )}
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-lg">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold">Service Feedback</h1>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Services Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-blue-600" />
                Active Services
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div 
                    key={service.id} 
                    className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200
                      hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-blue-900 text-lg mb-2">
                          {service.service_type}
                        </h3>
                        <div className="flex items-center text-blue-700 text-sm">
                          <Building2 className="w-4 h-4 mr-2" />
                          Location: {service.location || 'Not specified'}
                        </div>
                        <div className="flex items-center text-blue-700 text-sm mt-2">
                          <Clock className="w-4 h-4 mr-2" />
                          Status: {service.status}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium
                        ${service.priority === 'High' 
                          ? 'bg-red-100 text-red-800' 
                          : service.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                        }`}>
                        {service.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Feedback Form */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                Provide Feedback
              </h2>
              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="space-y-6">
                    {/* Service Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Service
                      </label>
                      <select
                        name="service_id"
                        value={feedback.service_id}
                        onChange={handleFeedbackChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                          focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                      >
                        <option value="">Choose a Service</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.service_type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Rating Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Rate Your Experience
                      </label>
                      <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                           <label 
                              key={rating} 
                              className="cursor-pointer transform transition-transform duration-200 hover:scale-110"
                              onMouseEnter={() => setHoverRating(rating)}
                              onMouseLeave={() => setHoverRating(0)}
                            >
                              <input
                                type="radio"
                                name="rating"
                                value={rating}
                                checked={feedback.rating === rating.toString()}
                                onChange={handleFeedbackChange}
                                className="sr-only"
                              />
                              <Star 
                                className={`w-8 h-8 transition-all duration-200 ${
                                  (hoverRating > 0 ? rating <= hoverRating : rating <= parseInt(feedback.rating)) 
                                    ? 'text-yellow-500 scale-110' 
                                    : 'text-gray-300 hover:text-yellow-400'
                                }`}
                                fill={
                                  (hoverRating > 0 ? rating <= hoverRating : rating <= parseInt(feedback.rating)) 
                                    ? '#FFC107' 
                                    : 'none'
                                }
                              />
                            </label>
                          ))}
                        </div>
                        {(feedback.rating || hoverRating > 0) && (
                          <span className="text-sm text-gray-600 mt-2 md:mt-0 animate-fade-in">
                            {ratingDescriptions[hoverRating || parseInt(feedback.rating)]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Comments
                      </label>
                      <textarea
                        name="comments"
                        value={feedback.comments}
                        onChange={handleFeedbackChange}
                        rows="4"
                        placeholder="Share your detailed feedback..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                          focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all 
                          duration-200 resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl 
                        hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform 
                        hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Submit Feedback
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </section>

            {/* Previous Feedbacks Section */}
            <section className="mt-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <MessageCircle className="w-6 h-6 mr-3 text-purple-600" />
                Your Previous Feedbacks
              </h2>
              {tenantFeedbacks.length > 0 ? (
                <div className="space-y-6">
                  {tenantFeedbacks.map((feedback) => (
                    <div 
                      key={feedback.id} 
                      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300
                        transform hover:-translate-y-1 border border-gray-100"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {feedback.service_type}
                          </h3>
                          <div className="flex items-center space-x-2 mb-4">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {new Date(feedback.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex">{renderStars(feedback.rating)}</div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {ratingDescriptions[feedback.rating]}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mt-4 border-t pt-4">{feedback.comments}</p>
                      
                      {feedback.response && (
                        <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                          <div className="flex items-center mb-2">
                            <MessagesSquare className="w-4 h-4 text-blue-600 mr-2" />
                            <strong className="text-sm text-blue-800">Admin Response</strong>
                          </div>
                          <p className="text-blue-700 text-sm">{feedback.response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-xl text-center border border-purple-100">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                  <h3 className="text-xl font-semibold text-purple-900 mb-2">
                    No Feedback History
                  </h3>
                  <p className="text-purple-700 mb-4 max-w-md mx-auto">
                    You haven't provided any feedback yet. Your insights help us improve our services!
                  </p>
                  <div className="inline-flex items-center justify-center space-x-2 text-sm text-purple-600">
                    <Sparkles className="w-4 h-4" />
                    <span>Be the first to share your experience</span>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;