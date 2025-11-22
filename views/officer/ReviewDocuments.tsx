
import React, { useState, useEffect } from 'react';
import { User, Document, DocumentStatus } from '../../types';
import { getAllDocuments, updateDocumentStatus, getPublicFileUrl } from '../../services/apiService';
import { useToast } from '../../context/ToastContext';

interface ReviewDocumentsProps {
  user: User;
}

const statusColors: { [key in DocumentStatus]: string } = {
  [DocumentStatus.APPROVED]: 'bg-green-100 text-green-800',
  [DocumentStatus.PENDING_REVIEW]: 'bg-yellow-100 text-yellow-800',
  [DocumentStatus.REJECTED]: 'bg-red-100 text-red-800',
};

const ReviewDocuments: React.FC<ReviewDocumentsProps> = ({ }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<DocumentStatus>(DocumentStatus.PENDING_REVIEW);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDocs = async () => {
        setIsLoading(true);
        const allDocs = await getAllDocuments();
        setDocuments(allDocs);
        setIsLoading(false);
    }
    fetchDocs();
  }, []);

  const handleStatusChange = async (docId: string, newStatus: DocumentStatus) => {
    const updatedDoc = await updateDocumentStatus(docId, newStatus);
    if(updatedDoc) {
        setDocuments(prevDocs => prevDocs.map(doc => doc.id === docId ? updatedDoc : doc));
        showToast(`Document marked as ${newStatus}`, 'success');
    } else {
        showToast('Failed to update document status. Please check permissions.', 'error');
    }
  };

  const handleViewDocument = (filePath: string) => {
    const url = getPublicFileUrl(filePath);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      showToast('Could not retrieve document URL.', 'error');
    }
  };

  const filteredDocuments = documents.filter(d => d.status === filter);

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Review Documents</h2>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setFilter(DocumentStatus.PENDING_REVIEW)} className={`${filter === DocumentStatus.PENDING_REVIEW ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            Pending Review
          </button>
          <button onClick={() => setFilter(DocumentStatus.APPROVED)} className={`${filter === DocumentStatus.APPROVED ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            Approved
          </button>
          <button onClick={() => setFilter(DocumentStatus.REJECTED)} className={`${filter === DocumentStatus.REJECTED ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            Rejected
          </button>
        </nav>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxpayer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {filter === DocumentStatus.PENDING_REVIEW && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10">Loading...</td></tr>
            ) : filteredDocuments.map((doc) => (
              <tr key={doc.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.profiles?.name || 'N/A'}</td>
                <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-green-600 hover:text-green-800 hover:underline cursor-pointer font-medium"
                    onClick={() => handleViewDocument(doc.file_url)}
                    title="View Document"
                >
                    {doc.document_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(doc.upload_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[doc.status]}`}>{doc.status}</span>
                </td>
                {filter === DocumentStatus.PENDING_REVIEW && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => handleStatusChange(doc.id, DocumentStatus.APPROVED)} className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md transition-colors">Approve</button>
                    <button onClick={() => handleStatusChange(doc.id, DocumentStatus.REJECTED)} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md transition-colors">Reject</button>
                  </td>
                )}
              </tr>
            ))}
            {!isLoading && filteredDocuments.length === 0 && (
              <tr>
                <td colSpan={filter === DocumentStatus.PENDING_REVIEW ? 5 : 4} className="text-center py-10 text-gray-500">
                  No documents found with this status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewDocuments;
