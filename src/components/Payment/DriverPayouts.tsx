import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
import { usePaymentStore } from '../../stores/paymentStore';
import { useAuthStore } from '../../stores/authStore';

const DriverPayouts: React.FC = () => {
  const { user } = useAuthStore();
  const { payments, driverAccounts, createDriverAccount, getDriverAccount, isLoading } = usePaymentStore();
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState({
    mpesaPhoneNumber: '',
    accountName: '',
  });

  if (!user) return null;

  const driverAccount = getDriverAccount(user.id);
  const driverPayments = payments.filter(p => p.driverId === user.id && p.status === 'succeeded');
  
  const totalEarnings = driverPayments.reduce((sum, payment) => sum + payment.driverPayout, 0);
  const thisMonthEarnings = driverPayments
    .filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, payment) => sum + payment.driverPayout, 0);

  const handleSetupPayouts = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!setupData.mpesaPhoneNumber || !setupData.accountName) {
      alert('Please fill in all fields');
      return;
    }

    // Validate Kenyan phone number format
    const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
    if (!phoneRegex.test(setupData.mpesaPhoneNumber.replace(/\s/g, ''))) {
      alert('Please enter a valid Kenyan phone number');
      return;
    }

    // Format phone number
    let formattedPhone = setupData.mpesaPhoneNumber.replace(/\s/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('254')) {
      formattedPhone = '+' + formattedPhone;
    } else if (!formattedPhone.startsWith('+254')) {
      formattedPhone = '+254' + formattedPhone;
    }

    try {
      await createDriverAccount(user.id, formattedPhone, setupData.accountName);
      setShowSetup(false);
      alert('M-Pesa payout account created! Please complete verification to start receiving payments.');
    } catch (error) {
      console.error('Failed to setup payouts:', error);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+254')) {
      const number = phone.substring(4);
      return `+254 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
    return phone;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Driver Payouts</h1>
        <p className="text-gray-600">Manage your earnings and M-Pesa payout settings</p>
      </div>

      {/* Account Status */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">M-Pesa Account Status</h2>
        {driverAccount ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {driverAccount.isVerified ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">
                    {driverAccount.isVerified ? 'Account Verified' : 'Verification Required'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    M-Pesa: {formatPhoneNumber(driverAccount.mpesaPhoneNumber)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Account: {driverAccount.accountName}
                  </p>
                </div>
              </div>
              {!driverAccount.isVerified && (
                <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  <Smartphone className="w-4 h-4" />
                  <span>Verify Account</span>
                </button>
              )}
            </div>
            
            {driverAccount.requirements.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Required Actions:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {driverAccount.requirements.map((req, index) => (
                    <li key={index}>• {req.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            {!showSetup ? (
              <>
                <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Setup M-Pesa Payouts</h3>
                <p className="text-gray-600 mb-6">
                  Connect your M-Pesa account to start receiving payments from rides
                </p>
                <button
                  onClick={() => setShowSetup(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Setup M-Pesa Payouts
                </button>
              </>
            ) : (
              <form onSubmit={handleSetupPayouts} className="max-w-md mx-auto space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Setup M-Pesa Account</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={setupData.accountName}
                    onChange={(e) => setSetupData({ ...setupData, accountName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    M-Pesa Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0712345678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={setupData.mpesaPhoneNumber}
                    onChange={(e) => setSetupData({ ...setupData, mpesaPhoneNumber: e.target.value })}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowSetup(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Setting up...' : 'Setup Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">KES {totalEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">This Month</p>
              <p className="text-2xl font-bold text-gray-900">KES {thisMonthEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed Rides</p>
              <p className="text-2xl font-bold text-gray-900">{driverPayments.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent M-Pesa Payments</h2>
        {driverPayments.length > 0 ? (
          <div className="space-y-4">
            {driverPayments.slice(0, 10).map((payment) => (
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
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">+KES {payment.driverPayout.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    Platform fee: KES {payment.platformFee.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No payments yet. Start offering rides to earn money!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverPayouts;