import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  FileText,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  User
} from 'lucide-react';

const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState({
    action: '',
    notes: ''
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    filterEnrollments();
  }, [enrollments, filterStatus, filterPaymentStatus]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/enrollments');
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      } else {
        console.error('Failed to fetch enrollments');
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEnrollments = () => {
    let filtered = enrollments;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(enrollment => enrollment.status === filterStatus);
    }

    if (filterPaymentStatus !== 'all') {
      filtered = filtered.filter(enrollment => enrollment.payment_status === filterPaymentStatus);
    }

    setFilteredEnrollments(filtered);
  };

  const handleVerifyPayment = async () => {
    if (!selectedEnrollment || !verificationData.action) {
      alert('Please select an action (verify or reject)');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/enrollments/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollment_id: selectedEnrollment.id,
          verified_by: 1, // You should get this from the logged-in admin's session
          action: verificationData.action,
          notes: verificationData.notes
        })
      });

      if (response.ok) {
        alert(`Payment ${verificationData.action === 'verify' ? 'verified' : 'rejected'} successfully`);
        setShowVerificationModal(false);
        setSelectedEnrollment(null);
        setVerificationData({ action: '', notes: '' });
        fetchEnrollments();
      } else {
        const error = await response.json();
        alert(error.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Verification failed');
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      enrolled: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      dropped: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };

    const style = statusStyles[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle };
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusStyles = {
      pending: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
      submitted: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FileText },
      verified: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };

    const style = statusStyles[paymentStatus] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle };
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {paymentStatus?.charAt(0).toUpperCase() + paymentStatus?.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openVerificationModal = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowVerificationModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingVerifications = enrollments.filter(e => e.payment_status === 'submitted').length;
  const totalEnrollments = enrollments.length;
  const verifiedEnrollments = enrollments.filter(e => e.payment_status === 'verified').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Enrollment Management</h2>
          <p className="text-sm text-gray-600">Manage student enrollments and verify payments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Enrollments</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalEnrollments}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Verification</dt>
                  <dd className="text-lg font-medium text-gray-900">{pendingVerifications}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Verified Enrollments</dt>
                  <dd className="text-lg font-medium text-gray-900">{verifiedEnrollments}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="enrolled">Enrolled</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Payment Statuses</option>
              <option value="pending">Payment Pending</option>
              <option value="submitted">Payment Submitted</option>
              <option value="verified">Payment Verified</option>
              <option value="rejected">Payment Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course & Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{enrollment.student_name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {enrollment.email}
                        </div>
                        {enrollment.phone_number && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {enrollment.phone_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{enrollment.course_name}</div>
                    <div className="text-sm text-gray-500">{enrollment.batch_name}</div>
                    {enrollment.price && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Rwf {enrollment.price}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(enrollment.status)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPaymentStatusBadge(enrollment.payment_status)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Enrolled: {formatDate(enrollment.enrolled_date)}</span>
                    </div>
                    {enrollment.payment_submitted_date && (
                      <div className="flex items-center mt-1">
                        <FileText className="h-3 w-3 mr-1" />
                        <span>Payment: {formatDate(enrollment.payment_submitted_date)}</span>
                      </div>
                    )}
                    {enrollment.verification_date && (
                      <div className="flex items-center mt-1">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        <span>Verified: {formatDate(enrollment.verification_date)}</span>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {enrollment.payment_status === 'submitted' && (
                      <button
                        onClick={() => openVerificationModal(enrollment)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Verify Payment
                      </button>
                    )}
                    {enrollment.payment_status === 'verified' && enrollment.verified_by_name && (
                      <div className="text-xs text-gray-500">
                        Verified by: {enrollment.verified_by_name}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEnrollments.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No enrollments found</h3>
            <p className="mt-1 text-sm text-gray-500">No enrollments match the current filters.</p>
          </div>
        )}
      </div>

      {/* Payment Verification Modal */}
      {showVerificationModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Verify Payment - {selectedEnrollment.student_name}
              </h3>
              
              <div className="space-y-4">
                {/* Enrollment Details */}
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Enrollment Details</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Course:</strong> {selectedEnrollment.course_name}</p>
                    <p><strong>Batch:</strong> {selectedEnrollment.batch_name}</p>
                    <p><strong>Price:</strong> Rwf {selectedEnrollment.price}</p>
                    <p><strong>Payment Submitted:</strong> {formatDate(selectedEnrollment.payment_submitted_date)}</p>
                  </div>
                </div>

                {/* Payment Proof */}
                {selectedEnrollment.payment_proof && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Proof</label>
                    <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                      <p className="text-sm text-gray-600">{selectedEnrollment.payment_proof}</p>
                    </div>
                  </div>
                )}

                {/* Verification Action */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="action"
                        value="verify"
                        checked={verificationData.action === 'verify'}
                        onChange={(e) => setVerificationData({...verificationData, action: e.target.value})}
                        className="mr-2"
                      />
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm">Verify Payment</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="action"
                        value="reject"
                        checked={verificationData.action === 'reject'}
                        onChange={(e) => setVerificationData({...verificationData, action: e.target.value})}
                        className="mr-2"
                      />
                      <XCircle className="h-4 w-4 text-red-600 mr-1" />
                      <span className="text-sm">Reject Payment</span>
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    value={verificationData.notes}
                    onChange={(e) => setVerificationData({...verificationData, notes: e.target.value})}
                    placeholder="Add any notes about the verification..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationModal(false);
                    setSelectedEnrollment(null);
                    setVerificationData({ action: '', notes: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyPayment}
                  disabled={!verificationData.action}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                    verificationData.action 
                      ? verificationData.action === 'verify'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {verificationData.action === 'verify' ? 'Verify Payment' : 
                   verificationData.action === 'reject' ? 'Reject Payment' : 'Select Action'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentManagement;