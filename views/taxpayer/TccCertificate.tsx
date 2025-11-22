
import React, { forwardRef } from 'react';
import { User, TCCRequest } from '../../types';

interface TccCertificateProps {
  user: User;
  request: TCCRequest;
}

const TccCertificate = forwardRef<HTMLDivElement, TccCertificateProps>(({ user, request }, ref) => {
  const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div ref={ref} className="bg-white p-12" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'serif' }}>
      <div className="border-4 border-gray-800 p-8 h-full flex flex-col">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 tracking-wider">NATIONAL REVENUE AUTHORITY</h1>
          <p className="text-lg text-gray-600">Official Government Document</p>
        </header>

        <main className="flex-1">
          <h2 className="text-center text-3xl font-semibold underline decoration-double mb-16">
            TAX CLEARANCE CERTIFICATE
          </h2>
          
          <div className="text-lg leading-relaxed space-y-6">
            <p>This is to certify that:</p>
            <p className="text-center font-bold text-2xl my-4">{user.name}</p>
            <p>
              with Taxpayer Identification Number (TIN): <strong className="font-mono">{user.tin}</strong>, has fulfilled all tax obligations required by law up to the date of this certificate.
            </p>
            <p>
              This certificate confirms that the above-named taxpayer has no outstanding liabilities and is in good standing with the National Revenue Authority.
            </p>
          </div>

          <div className="mt-16 text-md space-y-3">
            <p><strong>Date of Issue:</strong> {issueDate}</p>
            <p><strong>Valid Until:</strong> One year from date of issue.</p>
          </div>
        </main>

        <footer className="mt-24 pt-8 border-t-2 border-gray-300 flex justify-between items-center">
          <div className="text-center">
            <p className="signature-font text-xl">Susan B. Anthony</p>
            <p className="border-t-2 border-gray-600 pt-1 mt-1 font-semibold">Commissioner General</p>
          </div>
          <div className="w-24 h-24 border-4 border-red-800 rounded-full flex items-center justify-center text-center text-red-800">
            <p className="text-xs font-bold leading-tight">OFFICIAL SEAL</p>
          </div>
        </footer>
      </div>
      <style>{`.signature-font { font-family: 'Brush Script MT', 'cursive'; }`}</style>
    </div>
  );
});

export default TccCertificate;
