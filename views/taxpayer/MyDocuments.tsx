
import React, { useState, useEffect } from 'react';
import { User, Document, DocumentStatus } from '../../types';
import { getDocumentsForUser, uploadDocument, getPublicFileUrl } from '../../services/apiService';
import { useToast } from '../../context/ToastContext';

interface MyDocumentsProps {
  user: User;
}

const statusColors: { [key in DocumentStatus]: string } = {
  [DocumentStatus.APPROVED]: 'bg-green-100 text-green-800',
  [DocumentStatus.PENDING_REVIEW]: 'bg-yellow-100 text-yellow-800',
  [DocumentStatus.REJECTED]: 'bg-red-100 text-red-800',
};

const MyDocuments: React.FC<MyDocumentsProps> = ({ user }) => {
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('Tax Return');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchDocuments = async () => {
    setIsLoading(true);
    const docs = await getDocumentsForUser(user.id);
    setUserDocuments(docs);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, [user.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a file to upload.', 'error');
      return;
    }
    setIsUploading(true);
    
    try {
        const { data: newDoc, error } = await uploadDocument(file, user.id, docType);
        if (newDoc) {
          setUserDocuments(prev => [...prev, newDoc]);
          showToast('Document uploaded successfully.', 'success');
        } else if (error) {
          // Display the specific RLS error or database error to the user
          showToast(`Upload failed: ${error}`, 'error');
        }
    } catch (error) {
        console.error("Upload failed:", error);
        showToast("Upload failed. Please try again.", 'error');
    } finally {
        setFile(null);
        (document.getElementById('file-upload') as HTMLInputElement).value = '';
        setIsUploading(false);
    }
  };

  const handleViewDocument = (filePath: string) => {
    const url = getPublicFileUrl(filePath);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      showToast('Could not retrieve document URL. Please try again.', 'error');
    }
  };

  return (
    <>
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Upload New Document</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="doc-type" className="block text-sm font-medium text-gray-700">Document Type</label>
            <select 
              id="doc-type" 
              name="doc-type" 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md">
              <option>Tax Return</option>
              <option>Income Statement</option>
              <option>Business License</option>
              <option>National ID / Passport</option>
              <option>Proof of Address (Utility Bill)</option>
              <option>Certificate of Incorporation</option>
              <option>VAT Registration Certificate</option>
              <option>Audited Financial Statements</option>
              <option>Tax Clearance Certificate (Previous)</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload File</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                    <span>{file ? file.name : 'Upload a file'}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                  </label>
                  {!file && <p className="pl-1">or drag and drop</p>}
                </div>
                <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <button type="submit" disabled={!file || isUploading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed">
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">My Uploaded Documents</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userDocuments.map((doc: Document) => (
                <tr key={doc.id}>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 hover:text-green-900 cursor-pointer"
                    onClick={() => handleViewDocument(doc.file_url)}
                    title="Click to view document"
                  >
                    {doc.document_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(doc.upload_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[doc.status]}`}>{doc.status}</span>
                  </td>
                </tr>
              ))}
               {(userDocuments.length === 0 && !isLoading) && (
                <tr>
                    <td colSpan={3} className="text-center py-10 text-gray-500">No documents uploaded yet.</td>
                </tr>
            )}
             {isLoading && (
                <tr>
                    <td colSpan={3} className="text-center py-10 text-gray-500">Loading documents...</td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default MyDocuments;
