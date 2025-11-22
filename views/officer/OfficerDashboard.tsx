
import React, { useState, useEffect } from 'react';
import { User, Document, TaxAssessment, AssessmentStatus, DocumentStatus } from '../../types';
import { getAllDocuments, getAllAssessments } from '../../services/apiService';
import { BarChart, DistributionChart } from '../../components/SimpleCharts';

interface OfficerDashboardProps {
  user: User;
}

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="bg-green-500 rounded-full p-3 text-white mr-4">
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const OfficerDashboard: React.FC<OfficerDashboardProps> = ({ user }) => {
  const [documentsForReview, setDocumentsForReview] = useState<Document[]>([]);
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [assessments, setAssessments] = useState<TaxAssessment[]>([]);
  const [docStats, setDocStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchData = async () => {
          setLoading(true);
          const [docs, allAssessments] = await Promise.all([
              getAllDocuments(),
              getAllAssessments()
          ]);
          setDocumentsForReview(docs.filter(d => d.status === DocumentStatus.PENDING_REVIEW));
          setAssessments(allAssessments);
          setTotalAssessments(allAssessments.length);
          
          setDocStats({
              pending: docs.filter(d => d.status === DocumentStatus.PENDING_REVIEW).length,
              approved: docs.filter(d => d.status === DocumentStatus.APPROVED).length,
              rejected: docs.filter(d => d.status === DocumentStatus.REJECTED).length,
          });
          
          setLoading(false);
      }
      fetchData();
  }, []);

  const assessmentData = [
      { label: 'Paid', value: assessments.filter(a => a.status === AssessmentStatus.PAID).length, color: '#10B981' },
      { label: 'Pending', value: assessments.filter(a => a.status === AssessmentStatus.PENDING).length + assessments.filter(a => a.status === AssessmentStatus.ASSESSED).length, color: '#3B82F6' },
      { label: 'Overdue', value: assessments.filter(a => a.status === AssessmentStatus.OVERDUE).length, color: '#EF4444' },
  ];

  const documentData = [
      { label: 'Pending', value: docStats.pending, color: '#F59E0B' },
      { label: 'Approved', value: docStats.approved, color: '#10B981' },
      { label: 'Rejected', value: docStats.rejected, color: '#EF4444' },
  ];

  return (
    <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome, Officer {user.name}!</h2>

        {loading ? <div>Loading stats...</div> : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Documents for Review" value={documentsForReview.length.toString()} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} />
                    <StatCard title="Total Assessments" value={totalAssessments.toString()} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3m0-10V6a2 2 0 012-2h2a2 2 0 012 2v1m-6 10h6" /></svg>} />
                    <StatCard title="Approved Docs" value={docStats.approved.toString()} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                    <StatCard title="Collection Rate" value="92%" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                     <BarChart title="Workload: Document Status" data={documentData} height={180} />
                     <DistributionChart title="Assessment Breakdown" data={assessmentData} />
                </div>
            </>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Immediate Actions Required</h3>
            {loading ? <div>Loading tasks...</div> : (
                <ul className="divide-y divide-gray-200">
                    {documentsForReview.slice(0, 5).map(doc => (
                        <li key={doc.id} className="py-3 flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="bg-yellow-100 rounded-full p-2 mr-3">
                                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Review {doc.document_name}</p>
                                    <p className="text-xs text-gray-500">Uploaded by {doc.profiles?.name} on {new Date(doc.upload_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-green-600 cursor-pointer hover:text-green-800">Review Now</span>
                        </li>
                    ))}
                    {documentsForReview.length === 0 && <p className="text-gray-500 text-center py-4">No pending documents for review.</p>}
                </ul>
            )}
        </div>
    </div>
  );
};

export default OfficerDashboard;
