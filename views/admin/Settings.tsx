
import React, { useState, useEffect } from 'react';
import { User, TaxConfiguration, TaxType } from '../../types';
import { getTaxConfigurations, updateTaxConfigurations } from '../../services/apiService';
import { useToast } from '../../context/ToastContext';

interface SettingsProps {
  user: User;
}

interface NotificationTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    variables: string[];
}

// Mock templates with defined variables for better UX
const initialTemplates: NotificationTemplate[] = [
    { 
        id: 'assessment_created', 
        name: 'New Assessment Created', 
        subject: 'New Tax Assessment Generated - [Period]', 
        body: 'Dear [Taxpayer Name],\n\nA new tax assessment has been generated for the period [Period]. Please log in to your dashboard to review the details and make payment.\n\nRegards,\nRevenue Authority',
        variables: ['[Taxpayer Name]', '[Period]', '[Assessment ID]']
    },
    { 
        id: 'payment_received', 
        name: 'Payment Successful', 
        subject: 'Payment Receipt - [Payment ID]', 
        body: 'Dear [Taxpayer Name],\n\nWe have received your payment of [Amount]. Your transaction was successful. You can download your receipt from the "Payment History" section.\n\nThank you.',
        variables: ['[Taxpayer Name]', '[Payment ID]', '[Amount]', '[Date]']
    },
    { 
        id: 'tcc_approved', 
        name: 'TCC Approved', 
        subject: 'Tax Clearance Certificate Approved', 
        body: 'Dear [Taxpayer Name],\n\nYour request for a Tax Clearance Certificate has been approved. You can now download your certificate from the "TCC Request" page on your dashboard.\n\nRegards,\nRevenue Authority',
        variables: ['[Taxpayer Name]', '[Date]']
    },
    { 
        id: 'doc_rejected', 
        name: 'Document Rejected', 
        subject: 'Action Required: Document Rejected', 
        body: 'Dear [Taxpayer Name],\n\nYour document "[Document Name]" has been reviewed and rejected. Please check the comments in your portal and upload a valid document.\n\nRegards,\nRevenue Officer',
        variables: ['[Taxpayer Name]', '[Document Name]']
    }
];

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [configs, setConfigs] = useState<TaxConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Template State
  const [templates, setTemplates] = useState<NotificationTemplate[]>(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplates[0].id);
  const [currentTemplate, setCurrentTemplate] = useState<NotificationTemplate>(initialTemplates[0]);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    const fetchConfigs = async () => {
      setIsLoading(true);
      const data = await getTaxConfigurations();
      const allTypes = Object.values(TaxType);
      const currentConfigs = allTypes.map(type => {
        const existing = data.find(d => d.tax_type === type);
        return existing || { tax_type: type, rate: 0 };
      });
      setConfigs(currentConfigs);
      setIsLoading(false);
    };
    fetchConfigs();
  }, []);

  useEffect(() => {
      const found = templates.find(t => t.id === selectedTemplateId);
      if(found) setCurrentTemplate(found);
  }, [selectedTemplateId, templates]);

  const handleRateChange = (taxType: TaxType, rate: string) => {
    const newRate = parseFloat(rate);
    if (!isNaN(newRate) && newRate >= 0 && newRate <= 100) {
      setConfigs(prev =>
        prev.map(c => (c.tax_type === taxType ? { ...c, rate: newRate } : c))
      );
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const success = await updateTaxConfigurations(configs);
    if (success) {
      showToast('Tax rates updated successfully!', 'success');
    } else {
      showToast('Failed to update tax rates.', 'error');
    }
    setIsSaving(false);
  };

  const handleTemplateChange = (field: keyof NotificationTemplate, value: string) => {
      setCurrentTemplate(prev => ({ ...prev, [field]: value }));
  }

  const handleSaveTemplate = () => {
      setIsSavingTemplate(true);
      // Simulate API call
      setTimeout(() => {
          setTemplates(prev => prev.map(t => t.id === currentTemplate.id ? currentTemplate : t));
          setIsSavingTemplate(false);
          showToast('Notification template updated successfully.', 'success');
      }, 800);
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">System Settings</h2>
      
      <div className="space-y-8">
        {/* Tax Configuration Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Tax Configuration</h3>
          <p className="mt-1 text-sm text-gray-600">
            Define tax rates for different tax types. These rates will be used for automatic assessment calculations.
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-md space-y-4 border border-gray-200">
            {isLoading ? <p>Loading configurations...</p> : (
              configs.map(config => (
                <div key={config.tax_type} className="flex items-center justify-between">
                  <label htmlFor={config.tax_type} className="block text-sm font-medium text-gray-700 w-1/2">{config.tax_type}</label>
                  <div className="relative mt-1 rounded-md shadow-sm w-1/3">
                    <input
                      type="number"
                      name={config.tax_type}
                      id={config.tax_type}
                      className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="0.00"
                      value={config.rate}
                      onChange={(e) => handleRateChange(config.tax_type, e.target.value)}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
             <div className="pt-4 text-right">
                <button 
                  onClick={handleSaveChanges} 
                  disabled={isSaving || isLoading}
                  className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
                >
                    {isSaving ? 'Saving...' : 'Save Rates'}
                </button>
            </div>
          </div>
        </div>

        {/* Notification Templates Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Notification Templates</h3>
          <p className="mt-1 text-sm text-gray-600">
            Customize the automated email messages sent to users.
          </p>
          <div className="mt-4 p-6 bg-white rounded-md border border-gray-200 shadow-sm">
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Template</label>
                <select 
                    value={selectedTemplateId} 
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                >
                    {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                    <input 
                        type="text" 
                        value={currentTemplate.subject}
                        onChange={(e) => handleTemplateChange('subject', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
                    <textarea 
                        rows={6}
                        value={currentTemplate.body}
                        onChange={(e) => handleTemplateChange('body', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border font-mono text-sm"
                    />
                </div>
                {/* Dynamic Variables List */}
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                    <p className="text-xs font-semibold text-blue-800 mb-1">Available Placeholders:</p>
                    <div className="flex flex-wrap gap-2">
                        {currentTemplate.variables.map(v => (
                            <span key={v} className="text-xs bg-white border border-blue-200 text-blue-600 px-2 py-0.5 rounded shadow-sm font-mono">
                                {v}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Copy and paste these into the subject or body.</p>
                </div>
            </div>

             <div className="pt-4 text-right">
                <button 
                  onClick={handleSaveTemplate} 
                  disabled={isSavingTemplate}
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                >
                    {isSavingTemplate ? 'Saving...' : 'Update Template'}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
