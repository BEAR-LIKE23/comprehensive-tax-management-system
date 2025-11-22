
import React, { useState, useEffect } from 'react';
import { User, TaxAssessment, AssessmentStatus, Notification } from '../../types';
import { getAllUsers, getAllAssessments, getNotificationsForUser } from '../../services/apiService';
import { BarChart, DistributionChart } from '../../components/SimpleCharts';

interface AdminDashboardProps {
  user: User;
  onNavigate: (view: string) => void;
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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onNavigate }) => {
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalAssessments, setTotalAssessments] = useState(0);
    const [assessments, setAssessments] = useState<TaxAssessment[]>([]);
    const [recentActivity, setRecentActivity] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [users, allAssessments] = await Promise.all([
                getAllUsers(),
                getAllAssessments()
            ]);
            setTotalUsers(users.length);
            setTotalAssessments(allAssessments.length);
            setAssessments(allAssessments);
            
            const revenue = allAssessments
                .filter(a => a.status === AssessmentStatus.PAID)
                .reduce((sum, a) => sum + a.amount_due, 0);
            setTotalRevenue(revenue);

            // Fetch admin specific notifications to serve as activity log
            const activity = await getNotificationsForUser(user.id);
            setRecentActivity(activity.slice(0, 5));

            setLoading(false);
        }
        fetchData();
    }, [user.id]);

    // Prepare data for charts
    const assessmentStatusData = [
        { label: 'Paid', value: assessments.filter(a => a.status === AssessmentStatus.PAID).length, color: '#10B981' },
        { label: 'Assessed', value: assessments.filter(a => a.status === AssessmentStatus.ASSESSED).length, color: '#3B82F6' },
        { label: 'Pending', value: assessments.filter(a => a.status === AssessmentStatus.PENDING).length, color: '#F59E0B' },
        { label: 'Overdue', value: assessments.filter(a => a.status === AssessmentStatus.OVERDUE).length, color: '#EF4444' },
    ];

    // Mock monthly revenue data
    const revenueData = [
        { label: 'Jan', value: totalRevenue * 0.1, color: '#10B981' },
        { label: 'Feb', value: totalRevenue * 0.15, color: '#10B981' },
        { label: 'Mar', value: totalRevenue * 0.12, color: '#10B981' },
        { label: 'Apr', value: totalRevenue * 0.25, color: '#10B981' },
        { label: 'May', value: totalRevenue * 0.18, color: '#10B981' },
        { label: 'Jun', value: totalRevenue * 0.2, color: '#059669' },
    ];

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Administrator Dashboard</h2>
            
            {loading ? <div>Loading dashboard...</div> : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Total Users" value={totalUsers.toString()} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                        <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
                        <StatCard title="Total Assessments" value={totalAssessments.toString()} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3m0-10V6a2 2 0 012-2h2a2 2 0 012 2v1m-6 10h6" /></svg>} />
                        <StatCard title="System Health" value="98%" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                         <div className="lg:col-span-2">
                            <BarChart title="Revenue Overview (YTD)" data={revenueData} valuePrefix="$" />
                        </div>
                        <div className="lg:col-span-1">
                            <DistributionChart title="Assessment Status" data={assessmentStatusData} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                         {/* Quick Links */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800">Quick Links</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <button 
                                    onClick={() => onNavigate('Manage Users')}
                                    className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center transition-colors"
                                 >
                                    <div className="bg-green-100 p-3 rounded-full text-green-600 mb-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                    </div>
                                    <span className="font-medium text-gray-700">Register Staff</span>
                                 </button>
                                 <button 
                                    onClick={() => onNavigate('System Reports')}
                                    className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center transition-colors"
                                 >
                                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 mb-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <span className="font-medium text-gray-700">Generate Report</span>
                                 </button>
                                 <button 
                                    onClick={() => onNavigate('Settings')}
                                    className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center transition-colors"
                                 >
                                    <div className="bg-purple-100 p-3 rounded-full text-purple-600 mb-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <span className="font-medium text-gray-700">System Settings</span>
                                 </button>
                            </div>
                        </div>
                        
                        {/* Recent System Activity Feed */}
                        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent System Activity</h3>
                            {recentActivity.length > 0 ? (
                                <ul className="space-y-4">
                                    {recentActivity.map((notif, idx) => (
                                        <li key={idx} className="border-b border-gray-100 pb-2 last:border-0">
                                            <p className="text-sm font-medium text-gray-800">{notif.title}</p>
                                            <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                                            <span className="text-[10px] text-gray-400">{new Date(notif.date).toLocaleString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-sm">No recent system alerts.</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
