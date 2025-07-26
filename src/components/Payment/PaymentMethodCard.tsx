import React from 'react';
import { Smartphone, Trash2, Check } from 'lucide-react';
import { PaymentMethod } from '../../stores/paymentStore';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onRemove: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  onRemove,
  onSetDefault,
}) => {
  const formatPhoneNumber = (phone: string) => {
    // Format +254712345678 to +254 712 345 678
    if (phone.startsWith('+254')) {
      const number = phone.substring(4);
      return `+254 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
    return phone;
  };

  return (
    <div className={`bg-white rounded-xl p-6 border-2 transition-all ${
      paymentMethod.isDefault 
        ? 'border-green-500 bg-green-50' 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${
            paymentMethod.isDefault ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Smartphone className={`w-6 h-6 ${
              paymentMethod.isDefault ? 'text-green-600' : 'text-gray-600'
            }`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-green-600">M-Pesa</span>
              <span className="text-gray-600">{formatPhoneNumber(paymentMethod.mpesa.phoneNumber)}</span>
              {paymentMethod.isDefault && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Check className="w-3 h-3 mr-1" />
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {paymentMethod.mpesa.accountName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!paymentMethod.isDefault && (
            <button
              onClick={() => onSetDefault(paymentMethod.id)}
              className="px-3 py-1 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Set as default
            </button>
          )}
          <button
            onClick={() => onRemove(paymentMethod.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodCard;