
import React, { useState, useEffect } from 'react';
import { User, TaxAssessment, AssessmentStatus } from '../../types';
import { getAssessmentsForUser, processPayment } from '../../services/apiService';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

interface MyAssessmentsProps {
  user: User;
}

const statusColors: { [key in AssessmentStatus]: string } = {
  [AssessmentStatus.PAID]: 'bg-green-100 text-green-800',
  [AssessmentStatus.ASSESSED]: 'bg-blue-100 text-blue-800',
  [AssessmentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [AssessmentStatus.OVERDUE]: 'bg-red-100 text-red-800',
};

const MyAssessments: React.FC<MyAssessmentsProps> = ({ user }) => {
  const [userAssessments, setUserAssessments] = useState<TaxAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<TaxAssessment | null>(null);
  
  // Payment Form State
  const [paymentStep, setPaymentStep] = useState<'entry' | 'processing' | 'success'>('entry');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', holder: '' });
  
  const { showToast } = useToast();

  const fetchAssessments = async () => {
    setIsLoading(true);
    const data = await getAssessmentsForUser(user.id);
    setUserAssessments(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAssessments();
  }, [user.id]);

  const handlePayClick = (assessment: TaxAssessment) => {
    setSelectedAssessment(assessment);
    setPaymentStep('entry');
    setCardDetails({ number: '', expiry: '', cvv: '', holder: user.name });
    setIsPayModalOpen(true);
  };

  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setCardDetails(prev => ({ ...prev, [name]: value }));
  }

  const formatCardNumber = (value: string) => {
      return value.replace(/\W/g, '').replace(/(.{4})/g, '$1 ').trim();
  }

  const fillTestData = () => {
    setCardDetails({
        holder: 'Demo User',
        number: '4242424242424242',
        expiry: '12/30',
        cvv: '123'
    });
    showToast("Demo card details applied!", "info");
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment) return;
    
    // Basic Validation simulation
    if(cardDetails.number.length < 16 || cardDetails.cvv.length < 3) {
        showToast("Please enter valid card details", "error");
        return;
    }

    setPaymentStep('processing');

    // Simulate network delay
    setTimeout(async () => {
        const success = await processPayment(selectedAssessment.id, selectedAssessment.taxpayer_id, selectedAssessment.amount_due);
        
        if (success) {
            setPaymentStep('success');
            fetchAssessments();
            setTimeout(() => {
                 setIsPayModalOpen(false);
                 showToast("Payment processed successfully!", 'success');
            }, 1500);
        } else {
            setPaymentStep('entry');
            showToast("Payment failed. Please try again.", 'error');
        }
    }, 2000);
  };

  return (
    <>
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">My Tax Assessments</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable Income</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Due</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userAssessments.map((assessment: TaxAssessment) => (
                <tr key={assessment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{assessment.period}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assessment.tax_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${assessment.taxable_income?.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assessment.tax_rate_applied?.toFixed(2)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">${assessment.amount_due.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[assessment.status]}`}>
                      {assessment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {assessment.status !== AssessmentStatus.PAID && (
                      <button onClick={() => handlePayClick(assessment)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                          Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {userAssessments.length === 0 && !isLoading && (
                  <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-500">No assessments found.</td>
                  </tr>
              )}
               {isLoading && (
                  <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-500">Loading...</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title={paymentStep === 'entry' ? "Secure Payment Gateway" : "Processing Transaction"}>
        {selectedAssessment && (
            <div className="max-w-md mx-auto">
                {paymentStep === 'entry' && (
                    <form onSubmit={handleProcessPayment}>
                        {/* Order Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Summary</h4>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-600">{selectedAssessment.tax_type}</span>
                                <span className="text-gray-900 font-medium">{selectedAssessment.period}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                                <span className="text-gray-800 font-bold">Total Due</span>
                                <span className="text-2xl font-bold text-green-600">${selectedAssessment.amount_due.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Card Details */}
                        <div className="space-y-4 relative">
                            <div className="flex justify-between items-end mb-2">
                                <label className="block text-sm font-medium text-gray-700">Card Details</label>
                                <button 
                                    type="button" 
                                    onClick={fillTestData}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2 py-1 rounded border border-blue-100"
                                >
                                    Use Demo Card
                                </button>
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Cardholder Name</label>
                                <input 
                                    type="text" 
                                    name="holder"
                                    value={cardDetails.holder}
                                    onChange={handleCardInput}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                                    placeholder="Name on Card"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Card Number</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        name="number"
                                        value={formatCardNumber(cardDetails.number)}
                                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border pl-10"
                                        placeholder="0000 0000 0000 0000"
                                    />
                                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Expiry Date</label>
                                    <input 
                                        type="text" 
                                        name="expiry"
                                        value={cardDetails.expiry}
                                        onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                                        placeholder="MM/YY"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">CVV</label>
                                    <input 
                                        type="text" 
                                        name="cvv"
                                        value={cardDetails.cvv}
                                        onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                                        placeholder="123"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsPayModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 shadow-sm flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                Pay ${selectedAssessment.amount_due.toLocaleString()}
                            </button>
                        </div>
                    </form>
                )}

                {paymentStep === 'processing' && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
                        <p className="text-lg font-medium text-gray-700">Processing Payment...</p>
                        <p className="text-sm text-gray-500">Please do not close this window.</p>
                    </div>
                )}

                {paymentStep === 'success' && (
                     <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-slide-in">
                        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">Payment Successful!</h3>
                        <p className="text-gray-600 text-center">Your transaction has been completed.</p>
                    </div>
                )}
            </div>
        )}
      </Modal>
    </>
  );
};

export default MyAssessments;
