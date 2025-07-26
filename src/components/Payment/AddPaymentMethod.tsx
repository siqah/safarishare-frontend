import React, { useState } from 'react';
import { Smartphone, User, Phone } from 'lucide-react';
import { usePaymentStore } from '../../stores/paymentStore';

interface AddPaymentMethodProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddPaymentMethod: React.FC<AddPaymentMethodProps> = ({ onClose, onSuccess }) => {
  const { addPaymentMethod, isLoading } = usePaymentStore();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    accountName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.phoneNumber || !formData.accountName) {
      alert('Please fill in all fields');
      return;
    }

    // Validate Kenyan phone number format
    const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
      alert('Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678)');
      return;
    }

    // Format phone number to standard format
    let formattedPhone = formData.phoneNumber.replace(/\s/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('254')) {
      formattedPhone = '+' + formattedPhone;
    } else if (!formattedPhone.startsWith('+254')) {
      formattedPhone = '+254' + formattedPhone;
    }

    const paymentMethod = {
      type: 'mpesa' as const,
      mpesa: {
        phoneNumber: formattedPhone,
        accountName: formData.accountName,
      },
      isDefault: false,
    };

    addPaymentMethod(paymentMethod);
    onSuccess();
    onClose();
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as XXX XXX XXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add M-Pesa Account</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-800">
            <Smartphone className="w-5 h-5" />
            <span className="font-medium">M-Pesa Payment</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Add your M-Pesa phone number to pay for rides securely
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                required
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              M-Pesa Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                required
                placeholder="0712 345 678"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formatPhoneNumber(formData.phoneNumber)}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\s/g, '') })}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter your M-Pesa registered phone number (e.g., 0712345678)
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Smartphone className="w-4 h-4" />
              <span>Payments are processed securely through M-Pesa</span>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Adding...' : 'Add M-Pesa Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentMethod;