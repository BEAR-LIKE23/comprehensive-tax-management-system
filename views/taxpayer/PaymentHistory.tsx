import React, { useState, useEffect, useRef } from 'react';
import { User, Payment, TaxAssessment } from '../../types';
import { getPaymentsForUser, getAssessmentById } from '../../services/apiService';
import Modal from '../../components/Modal';
import PaymentReceipt from './PaymentReceipt';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PaymentHistoryProps {
  user: User;
}

type EnrichedPayment = Payment & { assessment?: TaxAssessment };

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ user }) => {
  const [userPayments, setUserPayments] = useState<EnrichedPayment[]>([]);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<EnrichedPayment | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPayments = async () => {
        setIsLoading(true);
        const payments = await getPaymentsForUser(user.id);
        const enrichedPayments: EnrichedPayment[] = await Promise.all(
            payments.map(async (p) => {
                const assessment = await getAssessmentById(p.assessment_id);
                return { ...p, assessment: assessment || undefined };
            })
        );
        setUserPayments(enrichedPayments);
        setIsLoading(false);
    };
    fetchPayments();
  }, [user.id]);
  
  const handleViewReceipt = (payment: EnrichedPayment) => {
      setSelectedPayment(payment);
      setIsReceiptModalOpen(true);
  }

  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return;
    
    setIsDownloading(true);
    const canvas = await html2canvas(receiptRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`Receipt_${selectedPayment?.id}.pdf`);
    
    setIsDownloading(false);
  };

  return (
    <>
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Payment History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">For Assessment Period</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userPayments.map((payment: EnrichedPayment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${payment.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.assessment?.period || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => handleViewReceipt(payment)} className="text-green-600 hover:text-green-900">View Receipt</button>
                  </td>
                </tr>
              ))}
              {(userPayments.length === 0 && !isLoading) && (
                  <tr>
                      <td colSpan={4} className="text-center py-10 text-gray-500">No payment history found.</td>
                  </tr>
              )}
               {isLoading && (
                  <tr>
                      <td colSpan={4} className="text-center py-10 text-gray-500">Loading history...</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} title="Payment Receipt">
        {selectedPayment && selectedPayment.assessment && (
            <div className="space-y-4">
                <div className="text-center">
                    <h4 className="text-lg font-bold text-gray-800">Transaction Successful</h4>
                    <p className="text-sm text-gray-500">Thank you for your payment.</p>
                </div>
                <div className="border-t border-b py-4 space-y-2">
                    <div className="flex justify-between"><span className="text-gray-600">Payment ID:</span> <span className="font-mono text-sm">{selectedPayment.id}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Payment Date:</span> <span>{new Date(selectedPayment.payment_date).toLocaleDateString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Taxpayer Name:</span> <span>{user.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Tax Type:</span> <span>{selectedPayment.assessment.tax_type}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Assessment Period:</span> <span>{selectedPayment.assessment.period}</span></div>
                </div>
                 <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-semibold text-gray-700">Total Paid:</span>
                    <span className="text-2xl font-bold text-green-600">${selectedPayment.amount.toLocaleString()}</span>
                </div>
                 <div className="pt-4 flex justify-end space-x-3">
                    <button onClick={() => setIsReceiptModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Close</button>
                    <button onClick={handleDownloadPdf} disabled={isDownloading} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400">
                        {isDownloading ? 'Downloading...' : 'Download PDF'}
                    </button>
                </div>
            </div>
        )}
      </Modal>

      {isReceiptModalOpen && selectedPayment && selectedPayment.assessment && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
            <PaymentReceipt ref={receiptRef} user={user} payment={selectedPayment} assessment={selectedPayment.assessment} />
        </div>
      )}
    </>
  );
};

export default PaymentHistory;
