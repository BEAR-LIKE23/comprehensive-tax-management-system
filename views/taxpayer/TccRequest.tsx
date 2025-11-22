import React, { useState, useEffect, useRef } from 'react';
import { User, TccStatus, TCCRequest } from '../../types';
import { getTccRequestForUser, createTccRequest } from '../../services/apiService';
import TccCertificate from './TccCertificate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TccRequestProps {
  user: User;
}

const statusInfo: { [key in TccStatus]: { color: string, text: string, icon: React.ReactNode } } = {
  [TccStatus.APPROVED]: { color: 'green', text: 'Your TCC request has been approved. You can now download your certificate.', icon: <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  [TccStatus.PENDING]: { color: 'yellow', text: 'Your TCC request is currently pending review by a revenue officer.', icon: <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  [TccStatus.REJECTED]: { color: 'red', text: 'Your TCC request has been rejected. Please check your notifications for more details.', icon: <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  [TccStatus.NOT_REQUESTED]: { color: 'gray', text: 'You have not made any TCC requests yet. Click below to start a new request.', icon: <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
};

const TccRequest: React.FC<TccRequestProps> = ({ user }) => {
  const [request, setRequest] = useState<TCCRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRequest = async () => {
        setIsLoading(true);
        const req = await getTccRequestForUser(user.id);
        setRequest(req);
        setIsLoading(false);
    };
    fetchRequest();
  }, [user.id]);

  const handleRequestNew = async () => {
    const newReq = await createTccRequest(user.id);
    setRequest(newReq);
  }

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);
    const canvas = await html2canvas(certificateRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    const imgWidth = pdfWidth - 20;
    const imgHeight = imgWidth / ratio;
    const x = 10;
    const y = (pdfHeight - imgHeight) / 2;
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save(`TCC_${user.tin}.pdf`);
    setIsDownloading(false);
  }

  const currentStatus = request ? request.status : TccStatus.NOT_REQUESTED;
  const info = statusInfo[currentStatus];
  
  if (isLoading) {
    return <div className="text-center p-8">Loading TCC status...</div>
  }

  return (
    <>
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Tax Clearance Certificate (TCC)</h2>
        <div className={`p-8 border-2 border-dashed border-${info.color}-300 bg-${info.color}-50 rounded-lg text-center`}>
          <div className="flex justify-center mb-4">{info.icon}</div>
          <h3 className={`text-xl font-bold text-${info.color}-800 mb-2`}>Status: {currentStatus}</h3>
          <p className={`text-${info.color}-700`}>{info.text}</p>
          {currentStatus === TccStatus.APPROVED && (
            <button onClick={handleDownload} disabled={isDownloading} className="mt-6 px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-wait">
              {isDownloading ? 'Downloading...' : 'Download Certificate (PDF)'}
            </button>
          )}
          {currentStatus === TccStatus.NOT_REQUESTED && (
            <button onClick={handleRequestNew} className="mt-6 px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Request New TCC</button>
          )}
           {currentStatus === TccStatus.REJECTED && (
            <button onClick={handleRequestNew} className="mt-6 px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Request Again</button>
          )}
        </div>
      </div>
      
      {request && currentStatus === TccStatus.APPROVED && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
            <TccCertificate ref={certificateRef} user={user} request={request} />
        </div>
      )}
    </>
  );
};

export default TccRequest;
