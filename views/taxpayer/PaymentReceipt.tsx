import React, { forwardRef } from 'react';
import { User, Payment, TaxAssessment } from '../../types';

interface PaymentReceiptProps {
  user: User;
  payment: Payment;
  assessment: TaxAssessment;
}

const PaymentReceipt = forwardRef<HTMLDivElement, PaymentReceiptProps>(({ user, payment, assessment }, ref) => {
  return (
    <div ref={ref} className="bg-white" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'sans-serif' }}>
      <div className="p-12">
        <header className="flex justify-between items-center pb-8 border-b-2 border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Payment Receipt</h1>
            <p className="text-gray-500">National Revenue Authority</p>
          </div>
          <div className="text-right">
            <p className="font-bold">Receipt #{payment.id.substring(4, 12)}</p>
            <p className="text-gray-600">Date: {new Date(payment.payment_date).toLocaleDateString()}</p>
          </div>
        </header>

        <section className="mt-10 grid grid-cols-2 gap-10">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Billed To</h2>
            <p className="font-bold text-lg text-gray-800">{user.name}</p>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-600">TIN: {user.tin}</p>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Paid</h2>
            <p className="text-5xl font-bold text-green-600">${payment.amount.toLocaleString()}</p>
          </div>
        </section>

        <section className="mt-12">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Payment Details</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-600">Description</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Period</th>
                <th className="p-3 text-sm font-semibold text-gray-600 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">{assessment.tax_type}</td>
                <td className="p-3">{assessment.period}</td>
                <td className="p-3 text-right">${assessment.amount_due.toLocaleString()}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="p-3 font-bold text-right text-gray-800">Total</td>
                <td className="p-3 font-bold text-right text-gray-800">${payment.amount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        <footer className="mt-20 pt-8 border-t-2 text-center text-gray-500 text-sm">
          <p>Thank you for your payment. This is an official receipt for your tax records.</p>
          <p>&copy; {new Date().getFullYear()} National Revenue Authority. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
});

export default PaymentReceipt;
