import React, { useEffect } from 'react';
import { Car, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useDriverStore } from '../../stores/driverStore';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@clerk/clerk-react';

const DriverStatus: React.FC = () => {
  const { application, isLoading, getApplication } = useDriverStore();
  const { getToken } = useAuth();

  useEffect(() => {
    getApplication(() => getToken());
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const getStatusIcon = () => {
    switch (application.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (application.status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (application.status) {
      case 'pending':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${getStatusColor()}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Car className="w-4 h-4 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Driver Application</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              application.status === 'approved' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {getStatusText()}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            {application.status === 'pending' && 
              'Your driver application is being reviewed. This usually takes 24-48 hours.'
            }
            {application.status === 'approved' && 
              'Congratulations! Your driver application has been approved. You can now offer rides.'
            }
            {application.status === 'rejected' && 
              'Your driver application was rejected. Please see the notes below and reapply if needed.'
            }
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Vehicle:</span>
              <span className="font-medium">
                {application.vehicleInfo.year} {application.vehicleInfo.make} {application.vehicleInfo.model}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Plate Number:</span>
              <span className="font-medium">{application.vehicleInfo.plateNumber}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Available Seats:</span>
              <span className="font-medium">{application.vehicleInfo.seats}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Submitted:</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(application.submittedAt!), { addSuffix: true })}
              </span>
            </div>

            {application.reviewedAt && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Reviewed:</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(application.reviewedAt), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>

          {application.reviewNotes && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-1">Review Notes:</p>
              <p className="text-sm text-gray-600">{application.reviewNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverStatus;