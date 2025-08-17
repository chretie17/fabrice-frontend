import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, User, CreditCard, CheckCircle, AlertCircle, Send, X, InfoIcon } from 'lucide-react';
import CourseAccess from './courseaccess'; // adjust path if needed

const CourseEnrollment = () => {
  const [availableBatches, setAvailableBatches] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [activeTab, setActiveTab] = useState('available');
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentProof, setPaymentProof] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);
  const [showCourseAccess, setShowCourseAccess] = useState(false);

  // Get user ID from localStorage (in real app, use proper auth)
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch available batches
      const batchesResponse = await fetch('http://localhost:3000/api/enrollments/available-batches');
      const batchesData = await batchesResponse.json();
      setAvailableBatches(batchesData);

      // Fetch my enrollments
      const enrollmentsResponse = await fetch(`http://localhost:3000/api/enrollments/student/${userId}`);
      const enrollmentsData = await enrollmentsResponse.json();
      setMyEnrollments(enrollmentsData);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (batchId) => {
    try {
      setEnrolling(batchId);
      
      const response = await fetch('http://localhost:3000/api/enrollments/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: userId,
          batch_id: batchId
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Enrollment created! Now please submit your payment proof.');
        fetchData(); // Refresh data
        setActiveTab('enrolled'); // Switch to enrollments tab
      } else {
        alert(result.error || 'Enrollment failed');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Enrollment failed');
    } finally {
      setEnrolling(null);
    }
  };

  const handleSubmitPaymentProof = async () => {
    if (!paymentProof.trim()) {
      alert('Please enter your MoMo payment message');
      return;
    }

    try {
      setSubmittingProof(true);
      
      const response = await fetch('http://localhost:3000/api/enrollments/submit-payment-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollment_id: paymentModal.id,
          payment_proof: paymentProof
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Payment proof submitted successfully! Admin will verify and contact you.');
        setPaymentModal(null);
        setPaymentProof('');
        fetchData(); // Refresh data
      } else {
        alert(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting payment proof:', error);
      alert('Submission failed');
    } finally {
      setSubmittingProof(false);
    }
  };

  const getPaymentStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: AlertCircle,
          text: 'Payment Required',
          description: 'Submit payment proof to complete enrollment'
        };
      case 'submitted':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: Clock,
          text: 'Under Review',
          description: 'Payment proof submitted, waiting for verification'
        };
      case 'verified':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          text: 'Verified',
          description: 'Payment verified, enrollment confirmed'
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800',
          icon: X,
          text: 'Rejected',
          description: 'Payment proof was rejected, please resubmit'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle,
          text: 'Unknown',
          description: ''
        };
    }
  };

  const BatchCard = ({ batch, isEnrolled = false, enrollmentInfo = null }) => {
    const paymentInfo = isEnrolled ? getPaymentStatusInfo(enrollmentInfo?.payment_status) : null;
    const StatusIcon = paymentInfo?.icon;

    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{batch.course_name}</h3>
            <p className="text-sm text-gray-600">{batch.name}</p>
          </div>
          <div className="text-right">
            {isEnrolled ? (
              <div className="space-y-1">
                <div className={`flex items-center px-3 py-1 text-xs font-medium rounded-full ${paymentInfo.color}`}>
                  {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
                  {paymentInfo.text}
                </div>
                {enrollmentInfo?.status === 'enrolled' && (
                  <div className="text-sm font-medium text-green-600">
                    Enrolled
                  </div>
                )}
              </div>
            ) : (
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  Rwf {parseInt(batch.price).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  {batch.available_spots} spots left
                </div>
              </div>
            )}
          </div>
        </div>

        {batch.course_description && (
          <p className="text-gray-600 text-sm mb-4">{batch.course_description}</p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            Instructor: {batch.instructor_name}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.end_date).toLocaleDateString()}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            {batch.start_time} - {batch.end_time}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <BookOpen className="w-4 h-4 mr-2" />
            Max Students: {batch.max_students}
          </div>
        </div>

        {/* Action Buttons */}
        {isEnrolled ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{paymentInfo.description}</p>
            
            {enrollmentInfo?.payment_status === 'pending' && (
              <button
                onClick={() => setPaymentModal(enrollmentInfo)}
                className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Submit Payment Proof
              </button>
            )}
            
            {enrollmentInfo?.payment_status === 'rejected' && (
              <button
                onClick={() => setPaymentModal(enrollmentInfo)}
                className="w-full flex items-center justify-center py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Resubmit Payment Proof
              </button>
            )}

            {enrollmentInfo?.payment_status === 'verified' && (
              <button
                onClick={() => setShowCourseAccess(true)}
                className="w-full flex items-center justify-center py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Access Course
              </button>
            )}

            {enrollmentInfo?.verification_notes && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Admin Notes:</p>
                <p className="text-sm text-gray-600">{enrollmentInfo.verification_notes}</p>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => handleEnroll(batch.id)}
            disabled={enrolling === batch.id || batch.available_spots === 0}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              batch.available_spots === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : enrolling === batch.id
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {enrolling === batch.id ? 'Enrolling...' : 
             batch.available_spots === 0 ? 'Full' : 'Enroll Now'}
          </button>
        )}
      </div>
    );
  };

  // Payment Proof Modal
  const PaymentProofModal = () => {
    if (!paymentModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold">Submit Payment Proof</h3>
            <button 
              onClick={() => {
                setPaymentModal(null);
                setPaymentProof('');
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <h4 className="font-semibold text-gray-900 text-lg">{paymentModal.course_name}</h4>
              <p className="text-sm text-gray-600 mt-1">{paymentModal.batch_name}</p>
              <div className="mt-3 flex items-center">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-xl font-bold text-blue-600 ml-2">
                  Rwf {parseInt(paymentModal.price).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                <InfoIcon className="w-5 h-5 mr-2" />
                Payment Instructions
              </h5>
              <ol className="text-sm text-blue-800 space-y-2.5">
                <li className="flex items-start">
                  <span className="font-medium mr-2">1.</span>
                  <span>Send payment via Mobile Money (MoMo) to code: <span className="font-mono bg-blue-200 px-2 py-0.5 rounded">624359</span></span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">2.</span>
                  <span>Copy the entire confirmation message</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">3.</span>
                  <span>Paste it in the box below</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">4.</span>
                  <span>Click submit for admin verification</span>
                </li>
              </ol>
            </div>

           <div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    MoMo Payment Confirmation Message <span className="text-red-500">*</span>
  </label>
  <textarea
    value={paymentProof}
    onChange={(e) => setPaymentProof(e.target.value)}
    rows={6}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow placeholder:text-gray-400"
    placeholder="Paste your complete MoMo confirmation message here..."
    required
    autoFocus
    onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
  />
</div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setPaymentModal(null);
                  setPaymentProof('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPaymentProof}
                disabled={submittingProof || !paymentProof.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingProof ? 'Submitting...' : 'Submit Proof'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show Course Access if user clicked "Access Course"
  if (showCourseAccess) {
    return <CourseAccess onBack={() => setShowCourseAccess(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Course Enrollment</h1>
            <p className="text-gray-600">Browse and enroll in available courses</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('available')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Available Courses ({availableBatches.length})
            </button>
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'enrolled'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Enrollments ({myEnrollments.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'available' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Courses</h2>
            {availableBatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableBatches.map((batch) => (
                  <BatchCard key={batch.id} batch={batch} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No available courses</h3>
                <p className="text-gray-600">Check back later for new course offerings.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'enrolled' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Enrollments</h2>
            {myEnrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEnrollments.map((enrollment) => (
                <BatchCard 
                  key={enrollment.id} 
                  batch={{
                    ...enrollment,
                    course_name: enrollment.course_name,
                    name: enrollment.batch_name,
                    instructor_name: enrollment.instructor_name
                  }}
                  isEnrolled={true}
                  enrollmentInfo={enrollment}
                />
              ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments yet</h3>
                <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Browse Available Courses
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Proof Modal */}
      <PaymentProofModal />
    </div>
  );
};

export default CourseEnrollment;
