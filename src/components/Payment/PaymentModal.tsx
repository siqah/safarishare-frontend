import React, { useState } from 'react';
import { Smartphone, Lock, DollarSign, User, Clock } from 'lucide-react';
import { usePaymentStore } from '../../stores/paymentStore';
import { useAuthStore } from '../../stores/authStore';
import { Ride } from '../../stores/rideStore';

interface PaymentModalProps {
  ride: Ride;
  seats: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ ride, seats, onClose, onSuccess }) => {
  const { user } = useAuthStore();
  const { paymentMethods, createPayment, processPayment, isLoading } = usePaymentStore();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    paymentMethods.find(pm => pm.isDefault)?.id || paymentMethods[0]?.id || ''
  );

  const totalAmount = ride.pricePerSeat * seats;
  const platformFee = Math.round(totalAmount * 0.05 * 100) / 100;

  const handlePayment = async () => {
    if (!user || !selectedPaymentMethod) return;

    try {
      const paymentId = await createPayment(ride._id, totalAmount, user._id, ride.driverId._id);
      const success = await processPayment(paymentId, selectedPaymentMethod);
      
      if (success) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const selectedMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethod);

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+254')) {
      const number = phone.substring(4);
      return `+254 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
    return phone;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Ride Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Ride Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Route:</span>
              <span className="font-medium">{ride.fromLocation} → {ride.toLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time:</span>
              <span className="font-medium">{ride.departureDate} at {ride.departureTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Driver:</span>
              <span className="font-medium">{ride.driverId.firstName} {ride.driverId.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Seats:</span>
              <span className="font-medium">{seats}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
          {paymentMethods.length > 0 ? (
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentMethod === method.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedPaymentMethod === method.id}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <Smartphone className="w-5 h-5 text-green-600 mr-3" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-green-600">M-Pesa</span>
                      <span className="text-gray-600">{formatPhoneNumber(method.mpesa.phoneNumber)}</span>
                      {method.isDefault && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {method.mpesa.accountName}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No M-Pesa accounts available. Please add an M-Pesa account first.
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Ride cost ({seats} seat{seats > 1 ? 's' : ''})</span>
              <span>KES {ride.pricePerSeat} × {seats} = KES {totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service fee</span>
              <span>KES {platformFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>KES {(totalAmount + platformFee).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
          <div className="flex items-center space-x-2 text-sm text-green-800">
            <Lock className="w-4 h-4" />
            <span>Your payment is secured by M-Pesa's encryption</span>
          </div>
        </div>

        {/* Payment Instructions */}
        {selectedMethod && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Payment Instructions:</p>
              <p>1. You will receive an M-Pesa STK push notification</p>
              <p>2. Enter your M-Pesa PIN to complete the payment</p>
              <p>3. You will receive a confirmation SMS from M-Pesa</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isLoading || !selectedPaymentMethod || paymentMethods.length === 0}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <span>Processing M-Pesa...</span>
            ) : (
              <>
                <Smartphone className="w-4 h-4" />
                <span>Pay KES {(totalAmount + platformFee).toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;