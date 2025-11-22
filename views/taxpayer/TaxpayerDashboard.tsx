
import React, { useState, useEffect } from 'react';
import { User, TaxAssessment, Document, Payment, TCCRequest } from '../../types';
import { getAssessmentsForUser, getDocumentsForUser, getPaymentsForUser, getTccRequestForUser } from '../../services/apiService';
import { BarChart } from '../../components/SimpleCharts';

interface TaxpayerDashboardProps {
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

// Helper to combine different activities into a single chronological list
const getRecentActivity = (assessments: TaxAssessment[], payments: Payment[], documents: Document[]) => {
    const activities = [
        ...assessments.map(a => ({ type: 'Assessment', date: a.period, desc: `Tax assessment for ${a.period}`, status: a.status, id: a.id })),
        ...payments.map(p => ({ type: 'Payment', date: p.payment_date, desc: `Payment of $${p.amount.toLocaleString()}`, status: 'Success', id: p.id })),
        ...documents.map(d => ({ type: 'Document', date: d.upload_date, desc: `Uploaded ${d.document_name}`, status: d.status, id: d.id }))
    ];
    // Simple sort by date string (works for ISO format)
    return activities.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);
};

const TaxpayerDashboard: React.FC<TaxpayerDashboardProps> = ({ user }) => {
    const [assessments, setAssessments] = useState<TaxAssessment[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [tccRequest, setTccRequest] = useState<TCCRequest | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [assessData, docData, payData, tccData] = await Promise.all([
                getAssessmentsForUser(user.id),
                getDocumentsForUser(user.id),
                getPaymentsForUser(user.id),
                getTccRequestForUser(user.id)
            ]);
            setAssessments(assessData);
            setDocuments(docData);
            setPayments(payData);
            setTccRequest(tccData);
            setLoading(false);
        };
        fetchData();
    }, [user.id]);
    
    // Prepare chart data
    const taxHistoryData = assessments.slice(0, 4).map(a => ({
        label: a.period,
        value: a.amount_due,
        color: a.status === 'Paid' ? '#10B981' : '#F59E0B'
    })).reverse();

    const recentActivity = getRecentActivity(assessments, payments, documents);

  return (
    <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user.name}!</h2>

        {loading ? <div className="text-center">Loading dashboard data...</div> : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Outstanding Assessments" value={assessments.filter(a => a.status !== 'Paid').length.toString()} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
                    <StatCard title="Total Paid" value={`$${payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                    <StatCard title="Uploaded Documents" value={documents.length.toString()} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>} />
                    <StatCard title="TCC Status" value={tccRequest?.status || 'Not Requested'} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">Financial Overview</h3>
                        {taxHistoryData.length > 0 ? (
                            <BarChart title="Tax Liability History" data={taxHistoryData} valuePrefix="$" height={200} />
                        ) : (
                            <div className="h-48 flex items-center justify-center text-gray-500 bg-gray-50 rounded">
                                No tax history available yet.
                            </div>
                        )}
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                        {recentActivity.length > 0 ? (
                            <ul className="space-y-4">
                                {recentActivity.map((item, idx) => (
                                    <li key={`${item.id}-${idx}`} className="flex items-start pb-4 border-b border-gray-100 last:border-0">
                                        <div className={`mt-1 rounded-full p-1.5 mr-3 ${item.type === 'Payment' ? 'bg-green-100 text-green-600' : item.type === 'Assessment' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"></circle></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{item.desc}</p>
                                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                                <span>{new Date(item.date).toLocaleDateString()}</span>
                                                <span className="mx-2">•</span>
                                                <span className={`font-semibold ${item.status === 'Paid' || item.status === 'Success' || item.status === 'Approved' ? 'text-green-600' : 'text-gray-500'}`}>{item.status}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No recent activity.</p>
                        )}
                    </div>
                </div>
            </>
        )}
    </div>
  );
};

export default TaxpayerDashboard;
