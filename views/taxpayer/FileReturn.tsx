
import React, { useState, useEffect } from 'react';
import { User, TaxType, TaxConfiguration } from '../../types';
import { getTaxConfigurations, createAssessment } from '../../services/apiService';
import { useToast } from '../../context/ToastContext';

interface FileReturnProps {
  user: User;
  onFilingSuccess: () => void;
}

const FileReturn: React.FC<FileReturnProps> = ({ user, onFilingSuccess }) => {
  const [taxConfigs, setTaxConfigs] = useState<TaxConfiguration[]>([]);
  const [formData, setFormData] = useState({
    tax_type: TaxType.PERSONAL_INCOME,
    period: '',
    taxable_income: '',
  });
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchConfigs = async () => {
      setIsLoading(true);
      const configs = await getTaxConfigurations();
      setTaxConfigs(configs);
      setIsLoading(false);
    };
    fetchConfigs();
  }, []);

  useEffect(() => {
    const rateConfig = taxConfigs.find(c => c.tax_type === formData.tax_type);
    const income = parseFloat(formData.taxable_income);
    if (rateConfig && !isNaN(income)) {
      setCalculatedAmount(income * (rateConfig.rate / 100));
    } else {
      setCalculatedAmount(0);
    }
  }, [formData.taxable_income, formData.tax_type, taxConfigs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.period || !formData.taxable_income) {
      showToast("Please complete all fields.", 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    const newAssessment = await createAssessment({
        taxpayer_id: user.id,
        tax_type: formData.tax_type,
        period: formData.period,
        taxable_income: parseFloat(formData.taxable_income)
    });
    
    setIsSubmitting(false);

    if (newAssessment) {
        showToast("Your tax return has been filed successfully. An assessment has been created.", 'success');
        onFilingSuccess();
    } else {
        showToast("There was an error filing your return. Please try again.", 'error');
    }

  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">File a Tax Return / Self Assess</h2>
      <p className="mb-6 text-gray-600">
        Use this form to declare your income for a specific period. The system will automatically
        calculate your tax liability based on the current rates.
      </p>

      {isLoading ? (
        <div className="text-center p-4">Loading tax configurations...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="tax_type" className="block text-sm font-medium text-gray-700">Tax Type</label>
            <select
              id="tax_type"
              name="tax_type"
              value={formData.tax_type}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
            >
              {taxConfigs.map(config => (
                <option key={config.tax_type} value={config.tax_type}>{config.tax_type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-700">Assessment Period</label>
            <input
              type="text"
              name="period"
              id="period"
              value={formData.period}
              onChange={handleChange}
              placeholder="e.g., 2024-Q3 or July 2024"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label htmlFor="taxable_income" className="block text-sm font-medium text-gray-700">Taxable Income for the Period</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                    type="number"
                    name="taxable_income"
                    id="taxable_income"
                    value={formData.taxable_income}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                    className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-green-500 focus:ring-green-500"
                />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-md text-center border border-green-200">
            <p className="text-sm text-green-700">Your calculated tax liability is:</p>
            <p className="text-3xl font-bold text-green-900">
                ${calculatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-green-600 mt-1">
                Based on a {taxConfigs.find(c => c.tax_type === formData.tax_type)?.rate}% rate for {formData.tax_type}.
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-wait"
            >
              {isSubmitting ? 'Filing...' : 'File My Return'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FileReturn;
