import React, { useState } from 'react';
import { Car, User, X } from 'lucide-react';
import { useDriverStore } from '../../stores/driverStore';
import { useAuth } from '@clerk/clerk-react';

interface DriverApplicationFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const DriverApplicationForm: React.FC<DriverApplicationFormProps> = ({ onClose, onSuccess }) => {
  const { submitApplication, isLoading, error } = useDriverStore();
  const { getToken } = useAuth();

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
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await submitApplication(formData as any, () => getToken());
      alert('Application submitted successfully! We will review it within 24-48 hours.');
      onSuccess();
    } catch (error: any) {
      alert(error.message || 'Failed to submit application');
    }
  };

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
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., A1234567"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Expiry
                </label>
                <input
                  type="date"
                  name="licenseExpiry"
                  value={formData.licenseExpiry}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Make
                </label>
                <input
                  type="text"
                  name="vehicle.make"
                  value={formData.vehicleInfo.make}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  name="vehicle.model"
                  value={formData.vehicleInfo.model}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  name="vehicle.year"
                  value={formData.vehicleInfo.year}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  min={2000}
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  name="vehicle.color"
                  value={formData.vehicleInfo.color}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plate Number
                </label>
                <input
                  type="text"
                  name="vehicle.plateNumber"
                  value={formData.vehicleInfo.plateNumber}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seats
                </label>
                <input
                  type="number"
                  name="vehicle.seats"
                  value={formData.vehicleInfo.seats}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  min={1}
                  max={8}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverApplicationForm;