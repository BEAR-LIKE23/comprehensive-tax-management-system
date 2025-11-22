
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { getAllTaxpayers } from '../../services/apiService';

interface ViewTaxpayersProps {
  user: User;
}

const ViewTaxpayers: React.FC<ViewTaxpayersProps> = ({ user }) => {
  const [taxpayers, setTaxpayers] = useState<User[]>([]);
  const [filteredTaxpayers, setFilteredTaxpayers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTaxpayers = async () => {
        setIsLoading(true);
        const data = await getAllTaxpayers();
        setTaxpayers(data);
        setFilteredTaxpayers(data);
        setIsLoading(false);
    }
    fetchTaxpayers();
  }, []);

  useEffect(() => {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = taxpayers.filter(tp => 
          tp.name.toLowerCase().includes(lowerTerm) || 
          tp.tin.toLowerCase().includes(lowerTerm) || 
          tp.email.toLowerCase().includes(lowerTerm)
      );
      setFilteredTaxpayers(filtered);
  }, [searchTerm, taxpayers]);

  const handleExport = () => {
      const headers = ['Name', 'TIN', 'Email', 'Type', 'Role'];
      const csvContent = [
          headers.join(','),
          ...filteredTaxpayers.map(tp => `"${tp.name}","${tp.tin}","${tp.email}","${tp.taxpayer_type}","${tp.role}"`)
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'taxpayers_report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Registered Taxpayers</h2>
          <div className="flex space-x-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                  <input 
                    type="text" 
                    placeholder="Search name, TIN, email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <button 
                onClick={handleExport}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center"
              >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Export
              </button>
          </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TIN</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
                <tr><td colSpan={4} className="text-center py-10">Loading taxpayers...</td></tr>
            ) : filteredTaxpayers.map((taxpayer) => (
              <tr key={taxpayer.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full" src={taxpayer.avatar_url} alt="" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{taxpayer.name}</div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{taxpayer.taxpayer_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{taxpayer.tin}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{taxpayer.email}</td>
              </tr>
            ))}
            {!isLoading && filteredTaxpayers.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 text-gray-500">No taxpayers found matching your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewTaxpayers;
