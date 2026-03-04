import React, { useState, useEffect } from 'react';
import { useUser, RedirectToSignIn } from '@clerk/clerk-react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ReportDetails from './ReportDetails';

const AdminDashboard = () => {
    const { user, isLoaded, isSignedIn } = useUser();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null);

    const toggleRow = (idx) => {
        setExpandedRow(expandedRow === idx ? null : idx);
    };

    // In a real app, you would check if user email is in an admin list.
    // For now, we will just allow any signed-in user to see it for testing purposes, 
    // or you can restrict it.

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/admin/reports');
                const data = await res.json();
                setReports(data);
            } catch (err) {
                console.error('Failed to fetch reports', err);
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded && isSignedIn) {
            fetchReports();
        }
    }, [isLoaded, isSignedIn]);

    if (!isLoaded || loading) return <div className="p-8 text-center text-gray-500 text-lg">Loading Admin Data...</div>;

    if (!isSignedIn) {
        return <RedirectToSignIn />;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-6">
            <div className="max-w-7xl mx-auto">

                <h1 className="text-4xl font-bold tracking-tight mb-10 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Admin Dashboard
                </h1>

                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">

                    <table className="min-w-full divide-y divide-slate-800">

                        {/* TABLE HEADER */}
                        <thead className="bg-slate-950">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Student</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Test Topic</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Score</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Violations</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-800">
                            {reports.map((report, idx) => (
                                <React.Fragment key={idx}>
                                    <tr
                                        onClick={() => toggleRow(idx)}
                                        className={`cursor-pointer hover:bg-slate-800 transition ${report.warnings?.length > 0
                                                ? "bg-red-900/10 hover:bg-red-900/20"
                                                : ""
                                            }`}
                                    >

                                        {/* STUDENT */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center">
                                                <div className="mr-4 text-slate-400">
                                                    {expandedRow === idx ? (
                                                        <ChevronUp className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5" />
                                                    )}
                                                </div>

                                                <div className="flex-shrink-0 h-11 w-11">
                                                    {report.referencePhotoUrl ? (
                                                        <img
                                                            className="h-11 w-11 rounded-full object-cover border-2 border-emerald-400"
                                                            src={report.referencePhotoUrl}
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <div className="h-11 w-11 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                                                            N/A
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-white">
                                                        {report.name}
                                                    </div>
                                                    <div className="text-sm text-slate-400">
                                                        {report.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* TOPIC */}
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                                {report.topic}
                                            </span>
                                        </td>

                                        {/* DATE */}
                                        <td className="px-6 py-5 text-sm text-slate-400">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </td>

                                        {/* SCORE */}
                                        <td className="px-6 py-5 text-lg font-bold text-white">
                                            {report.score}
                                            {report.quizDetails?.content?.length && (
                                                <span className="text-slate-500 text-sm ml-1">
                                                    / {report.quizDetails.content.length}
                                                </span>
                                            )}
                                        </td>

                                        {/* WARNINGS */}
                                        <td className="px-6 py-5">
                                            {report.warnings?.length > 0 ? (
                                                <span className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded">
                                                    {report.warnings.length} Violation(s)
                                                </span>
                                            ) : (
                                                <span className="text-emerald-400 flex items-center gap-2 text-sm">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                                    Clean
                                                </span>
                                            )}
                                        </td>

                                    </tr>

                                    {expandedRow === idx && (
                                        <tr>
                                            <td colSpan="5" className="border-t border-slate-800">
                                                <ReportDetails report={report} />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}

                            {reports.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-12 text-center text-slate-400"
                                    >
                                        No reports found
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
