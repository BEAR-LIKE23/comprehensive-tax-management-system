
import React, { useState, useEffect } from 'react';
import { User, TCCRequest, TccStatus } from '../../types';
import { getAllTccRequests, updateTccRequestStatus } from '../../services/apiService';
import { useToast } from '../../context/ToastContext';

interface ReviewTccProps {
  user: User;
}

const statusColors: { [key in TccStatus]: string } = {
  [TccStatus.APPROVED]: 'bg-green-100 text-green-800',
  [TccStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [TccStatus.REJECTED]: 'bg-red-100 text-red-800',
  [TccStatus.NOT_REQUESTED]: 'bg-gray-100 text-gray-800',
};

const ReviewTcc: React.FC<ReviewTccProps> = ({ }) => {
  const [requests, setRequests] = useState<TCCRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<TccStatus>(TccStatus.PENDING);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
        setIsLoading(true);
        const allRequests = await getAllTccRequests();
        setRequests(allRequests);
        setIsLoading(false);
    }
    fetchRequests();
  }, []);

  const handleStatusChange = async (reqId: string, newStatus: TccStatus, userId: string) => {
    const updatedReq = await updateTccRequestStatus(reqId, newStatus, userId);
    if(updatedReq) {
        setRequests(prev => prev.map(req => req.id === reqId ? updatedReq : req));
        showToast(`TCC Request ${newStatus}`, 'success');
    } else {
        showToast('Failed to update TCC status.', 'error');
    }
  };

  const filteredRequests = requests.filter(r => r.status === filter);

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Review TCC Requests</h2>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setFilter(TccStatus.PENDING)} className={`${filter === TccStatus.PENDING ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            Pending
          </button>
          <button onClick={() => setFilter(TccStatus.APPROVED)} className={`${filter === TccStatus.APPROVED ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            Approved
          </button>
          <button onClick={() => setFilter(TccStatus.REJECTED)} className={`${filter === TccStatus.REJECTED ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            Rejected
          </button>
        </nav>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxpayer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {filter === TccStatus.PENDING && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
                <tr><td colSpan={4} className="text-center py-10">Loading...</td></tr>
            ) : filteredRequests.map((req) => (
              <tr key={req.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.profiles?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.request_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[req.status]}`}>{req.status}</span>
                </td>
                {filter === TccStatus.PENDING && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => handleStatusChange(req.id, TccStatus.APPROVED, req.taxpayer_id)} className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md transition-colors">Approve</button>
                    <button onClick={() => handleStatusChange(req.id, TccStatus.REJECTED, req.taxpayer_id)} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md transition-colors">Reject</button>
                  </td>
                )}
              </tr>
            ))}
            {!isLoading && filteredRequests.length === 0 && (
              <tr>
                <td colSpan={filter === TccStatus.PENDING ? 4 : 3} className="text-center py-10 text-gray-500">
                  No TCC requests found with this status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewTcc;
