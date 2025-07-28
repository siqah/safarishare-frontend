import React, { useState } from 'react';
import { Car, Upload, FileText, Calendar, User, X } from 'lucide-react';
import { useDriverStore } from '../../stores/driverStore';
import { useAuthStore } from '../../stores/authStore';

interface DriverApplicationFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const DriverApplicationForm: React.FC<DriverApplicationFormProps> = ({ onClose, onSuccess }) => {
  const { submitApplication, isLoading, error } = useDriverStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    licenseNumber: '',
    licenseExpiry: '',
    vehicleInfo: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      plateNumber: '',
      seats: 4,
    },
    documents: {
      license: null as File | null,
      registration: null as File | null,
      insurance: null as File | null,
    },
  });

  const [dragActive, setDragActive] = useState({
    license: false,
    registration: false,
    insurance: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('vehicle.')) {
      const vehicleField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vehicleInfo: {
          ...prev.vehicleInfo,
          [vehicleField]: vehicleField === 'year' || vehicleField === 'seats' ? parseInt(value) : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileUpload = (type: 'license' | 'registration' | 'insurance', file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Only image and PDF files are allowed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [type]: file,
      },
    }));
  };

  const handleDragOver = (e: React.DragEvent, type: 'license' | 'registration' | 'insurance') => {
    e.preventDefault();
    setDragActive(prev => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e: React.DragEvent, type: 'license' | 'registration' | 'insurance') => {
    e.preventDefault();
    setDragActive(prev => ({ ...prev, [type]: false }));
  };

  const handleDrop = (e: React.DragEvent, type: 'license' | 'registration' | 'insurance') => {
    e.preventDefault();
    setDragActive(prev => ({ ...prev, [type]: false }));
    
    const files = e.dataTransfer.files;
    if (files[0]) {
      handleFileUpload(type, files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.documents.license || !formData.documents.registration || !formData.documents.insurance) {
      alert('Please upload all required documents');
      return;
    }

    try {
      await submitApplication(formData as any);
      alert('Application submitted successfully! We will review it within 24-48 hours.');
      onSuccess();
    } catch (error: any) {
      alert(error.message || 'Failed to submit application');
    }
  };

  const FileUploadArea: React.FC<{ 
    type: 'license' | 'registration' | 'insurance';
    label: string;
    description: string;
  }> = ({ type, label, description }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive[type] 
            ? 'border-blue-400 bg-blue-50' 
            : formData.documents[type]
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => handleDragOver(e, type)}
        onDragLeave={(e) => handleDragLeave(e, type)}
        onDrop={(e) => handleDrop(e, type)}
      >
        {formData.documents[type] ? (
          <div className="space-y-2">
            <FileText className="w-8 h-8 text-green-600 mx-auto" />
            <p className="text-sm font-medium text-green-700">
              {formData.documents[type]!.name}
            </p>
            <p className="text-xs text-gray-500">
              {(formData.documents[type]!.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                documents: { ...prev.documents, [type]: null }
              }))}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-600">{description}</p>
            <p className="text-xs text-gray-400">
              Drop files here or{' '}
              <label className="text-blue-600 cursor-pointer hover:text-blue-800">
                browse
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(type, file);
                  }}
                />
              </label>
            </p>
            <p className="text-xs text-gray-400">Max 5MB • Images or PDF</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Car className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Become a Driver</h2>
                <p className="text-sm text-gray-600">Complete your application to start offering rides</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Driver Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Driver Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver's License Number *
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Expiry Date *
                </label>
                <input
                  type="date"
                  name="licenseExpiry"
                  value={formData.licenseExpiry}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Car className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Make *</label>
                <input
                  type="text"
                  name="vehicle.make"
                  value={formData.vehicleInfo.make}
                  onChange={handleInputChange}
                  placeholder="e.g., Toyota"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                <input
                  type="text"
                  name="vehicle.model"
                  value={formData.vehicleInfo.model}
                  onChange={handleInputChange}
                  placeholder="e.g., Camry"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                <input
                  type="number"
                  name="vehicle.year"
                  value={formData.vehicleInfo.year}
                  onChange={handleInputChange}
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                <input
                  type="text"
                  name="vehicle.color"
                  value={formData.vehicleInfo.color}
                  onChange={handleInputChange}
                  placeholder="e.g., White"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number *</label>
                <input
                  type="text"
                  name="vehicle.plateNumber"
                  value={formData.vehicleInfo.plateNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., KBY 123A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Seats *</label>
                <select
                  name="vehicle.seats"
                  value={formData.vehicleInfo.seats}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value={1}>1 seat</option>
                  <option value={2}>2 seats</option>
                  <option value={3}>3 seats</option>
                  <option value={4}>4 seats</option>
                  <option value={5}>5 seats</option>
                  <option value={6}>6 seats</option>
                  <option value={7}>7 seats</option>
                </select>
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FileUploadArea
                type="license"
                label="Driver's License"
                description="Upload a clear photo of your driver's license"
              />
              
              <FileUploadArea
                type="registration"
                label="Vehicle Registration"
                description="Upload your vehicle registration certificate"
              />
              
              <FileUploadArea
                type="insurance"
                label="Insurance Certificate"
                description="Upload valid vehicle insurance certificate"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isLoading ? 'Submitting...' : 'Submit Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverApplicationForm;