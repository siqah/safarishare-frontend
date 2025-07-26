import React, { useState } from 'react';
import { Plus, Smartphone, DollarSign, Shield, History, CreditCard } from 'lucide-react';
import { usePaymentStore } from '../stores/paymentStore';
import { useAuthStore } from '../stores/authStore';
import PaymentMethodCard from '../components/Payment/PaymentMethodCard';
import AddPaymentMethod from '../components/Payment/AddPaymentMethod';
import DriverPayouts from '../components/Payment/DriverPayouts';

const PaymentSettings: React.FC = () => {
  const { user } = useAuthStore();
  const { paymentMethods, payments, removePaymentMethod, setDefaultPaymentMethod } = usePaymentStore();
  const [showAddCard, setShowAddCard] = useState(false);
  const [activeTab, setActiveTab] = useState<'methods' | 'payouts' | 'history'>('methods');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to access payment settings.</p>
        </div>
      </div>
    );
  }

  const userPayments = payments.filter(p => p.passengerId === user.id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Settings</h1>
          <p className="text-gray-600">Manage your payment methods and view transaction history</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('methods')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'methods'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Payment Methods</span>
                </div>
              </button>
              {user.isDriver && (
                <button
                  onClick={() => setActiveTab('payouts')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'payouts'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4" />
                    <span>M-Pesa Accounts</span>
                  </div>
                </button>
              )}
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>Transaction History</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Payment Methods Tab */}
            {activeTab === 'methods' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">M-Pesa Accounts</h2>
                  <button
                    onClick={() => setShowAddCard(true)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add M-Pesa</span>
                  </button>
                </div>

                {paymentMethods.length > 0 ? (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <PaymentMethodCard
                        key={method.id}
                        paymentMethod={method}
                        onRemove={removePaymentMethod}
                        onSetDefault={setDefaultPaymentMethod}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No M-Pesa accounts</h3>
                    <p className="text-gray-600 mb-6">Add an M-Pesa account to book rides</p>
                    <button
                      onClick={() => setShowAddCard(true)}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Add your first M-Pesa account
                    </button>
                  </div>
                )}

                <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-800">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Your payment information is secure</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    We use M-Pesa's secure payment system to protect your transactions. Your phone number is encrypted and secure.
                  </p>
                </div>
              </div>
            )}

            {/* Driver Payouts Tab */}
            {activeTab === 'payouts' && user.isDriver && (
              <DriverPayouts />
            )}

            {/* Transaction History Tab */}
            {activeTab === 'history' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Transaction History</h2>
                {userPayments.length > 0 ? (
                  <div className="space-y-4">
                    {userPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Ride Payment</p>
                          <p className="text-sm text-gray-600">
                            {new Date(payment.createdAt).toLocaleDateString()} • 
                            Ride #{payment.rideId.slice(-6)}
                          </p>
                          {payment.mpesaReceiptNumber && (
                            <p className="text-xs text-green-600">
                              M-Pesa Receipt: {payment.mpesaReceiptNumber}
                            </p>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                            payment.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">KES {payment.amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">
                            + KES {payment.platformFee.toFixed(2)} service fee
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-600">Your payment history will appear here after you book rides</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add Payment Method Modal */}
        {showAddCard && (
          <AddPaymentMethod
            onClose={() => setShowAddCard(false)}
            onSuccess={() => {
              // Could show a success message here
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentSettings;