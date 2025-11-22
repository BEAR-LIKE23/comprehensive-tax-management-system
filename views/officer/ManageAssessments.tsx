
import React, { useState, useEffect } from 'react';
import { User, TaxAssessment, AssessmentStatus, TaxType, TaxConfiguration } from '../../types';
import { getAllAssessments, getAllTaxpayers, createAssessment, getTaxConfigurations } from '../../services/apiService';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

interface ManageAssessmentsProps {
  user: User;
}

const statusColors: { [key in AssessmentStatus]: string } = {
  [AssessmentStatus.PAID]: 'bg-green-100 text-green-800',
  [AssessmentStatus.ASSESSED]: 'bg-blue-100 text-blue-800',
  [AssessmentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [AssessmentStatus.OVERDUE]: 'bg-red-100 text-red-800',
};

const ManageAssessments: React.FC<ManageAssessmentsProps> = ({ user }) => {
  const [assessments, setAssessments] = useState<TaxAssessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<TaxAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taxpayers, setTaxpayers] = useState<User[]>([]);
  const [taxConfigs, setTaxConfigs] = useState<TaxConfiguration[]>([]);
  const [newAssessment, setNewAssessment] = useState({
    taxpayer_id: '',
    tax_type: TaxType.PERSONAL_INCOME,
    taxable_income: '',
    period: ''
  });
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  const fetchInitialData = async () => {
    setIsLoading(true);
    const [asmnts, tps, configs] = await Promise.all([ getAllAssessments(), getAllTaxpayers(), getTaxConfigurations() ]);
    setAssessments(asmnts);
    setFilteredAssessments(asmnts);
    setTaxpayers(tps);
    setTaxConfigs(configs);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = assessments.filter(a => 
          a.profiles?.name.toLowerCase().includes(lowerTerm) || 
          a.profiles?.tin.toLowerCase().includes(lowerTerm) || 
          a.period.toLowerCase().includes(lowerTerm) ||
          a.status.toLowerCase().includes(lowerTerm)
      );
      setFilteredAssessments(filtered);
  }, [searchTerm, assessments]);
  
  useEffect(() => {
    const rateConfig = taxConfigs.find(c => c.tax_type === newAssessment.tax_type);
    const income = parseFloat(newAssessment.taxable_income);
    if(rateConfig && !isNaN(income)) {
      setCalculatedAmount(income * (rateConfig.rate / 100));
    } else {
      setCalculatedAmount(0);
    }
  }, [newAssessment.taxable_income, newAssessment.tax_type, taxConfigs]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAssessment(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssessment.taxpayer_id || !newAssessment.taxable_income || !newAssessment.period) {
      showToast("Please fill all fields", 'error');
      return;
    }

    const created = await createAssessment({
      taxpayer_id: newAssessment.taxpayer_id,
      tax_type: newAssessment.tax_type,
      taxable_income: parseFloat(newAssessment.taxable_income),
      period: newAssessment.period,
    });
    
    if (created) {
        const updatedList = [created, ...assessments];
        setAssessments(updatedList);
        showToast("Assessment created successfully", 'success');
    } else {
        showToast("Failed to create assessment", 'error');
    }
    setIsModalOpen(false);
    setNewAssessment({ taxpayer_id: '', tax_type: TaxType.PERSONAL_INCOME, taxable_income: '', period: '' });
  };

  const handleExport = () => {
      const headers = ['Taxpayer', 'TIN', 'Period', 'Tax Type', 'Taxable Income', 'Amount Due', 'Status', 'Due Date'];
      const csvContent = [
          headers.join(','),
          ...filteredAssessments.map(a => `"${a.profiles?.name || 'N/A'}","${a.profiles?.tin || 'N/A'}","${a.period}","${a.tax_type}","${a.taxable_income}","${a.amount_due}","${a.status}","${a.due_date}"`)
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'assessments_report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <>
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Manage Assessments</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                  <input 
                    type="text" 
                    placeholder="Search name, TIN, status..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <div className="flex gap-2">
                <button onClick={handleExport} className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center justify-center">
                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                   Export
                </button>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center whitespace-nowrap">
                    + New Assessment
                </button>
             </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxpayer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                  <tr><td colSpan={4} className="text-center py-10">Loading assessments...</td></tr>
              ) : filteredAssessments.map((assessment) => (
                <tr key={assessment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{assessment.profiles?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assessment.period}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${assessment.amount_due.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[assessment.status]}`}>
                      {assessment.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredAssessments.length === 0 && (
                   <tr><td colSpan={4} className="text-center py-10 text-gray-500">No assessments found matching your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Tax Assessment">
        <form onSubmit={handleCreateAssessment} className="space-y-4">
          <div>
            <label htmlFor="taxpayer_id" className="block text-sm font-medium text-gray-700">Taxpayer</label>
            <select id="taxpayer_id" name="taxpayer_id" value={newAssessment.taxpayer_id} onChange={handleInputChange} required className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
              <option value="" disabled>Select a taxpayer</option>
              {taxpayers.map(tp => <option key={tp.id} value={tp.id}>{tp.name} ({tp.tin})</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="tax_type" className="block text-sm font-medium text-gray-700">Tax Type</label>
            <select id="tax_type" name="tax_type" value={newAssessment.tax_type} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
              {Object.values(TaxType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="taxable_income" className="block text-sm font-medium text-gray-700">Taxable Income</label>
            <input type="number" name="taxable_income" id="taxable_income" value={newAssessment.taxable_income} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
          </div>
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-700">Period (e.g., 2024-Q2)</label>
            <input type="text" name="period" id="period" value={newAssessment.period} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
          </div>

          <div className="bg-gray-100 p-3 rounded-md text-center">
            <p className="text-sm text-gray-600">Calculated Amount Due</p>
            <p className="text-2xl font-bold text-green-600">${calculatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Create</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ManageAssessments;
