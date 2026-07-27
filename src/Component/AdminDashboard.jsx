import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, Eye, EyeOff, LogOut, AlertTriangle } from 'lucide-react';
import ReportDetails from './ReportDetails';

// ─── Admin credentials ────────────────────────────────────────────────────────
const ADMIN_USERNAME = 'portalAdmin';
const ADMIN_PASSWORD = '@thisisAdmin.65';

// ─── Sign-In Screen ───────────────────────────────────────────────────────────
const AdminSignIn = ({ onSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate a tiny delay for UX
        setTimeout(() => {
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                onSuccess();
            } else {
                setError('Invalid username or password.');
                setShake(true);
                setTimeout(() => setShake(false), 600);
            }
            setLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <div
                className={`relative w-full max-w-md transition-all duration-300 ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}
                style={{ animation: shake ? 'shake 0.4s ease' : undefined }}
            >
                {/* Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/60">

                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
                            <ShieldCheck className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
                        <p className="text-slate-400 text-sm mt-1">Sign in to access the dashboard</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-lg px-4 py-3 mb-6">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="flex flex-col gap-5">
                        {/* Username */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Username
                            </label>
                            <input
                                type="text"
                                id="admin-username"
                                autoComplete="username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                placeholder="Enter admin username"
                                className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="admin-password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter admin password"
                                    className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-lg px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Authenticating…' : 'Sign In to Admin'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-600 mt-6">
                        Quiz-Wuiz Admin Portal · Restricted Access
                    </p>
                </div>
            </div>

            {/* Shake keyframe */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-8px); }
                    40%, 80% { transform: translateX(8px); }
                }
            `}</style>
        </div>
    );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);

    const toggleRow = (idx) => {
        setExpandedRow(expandedRow === idx ? null : idx);
    };

    // Fetch reports once authenticated
    useEffect(() => {
        if (!isAdminAuthenticated) return;

        const fetchReports = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/admin/reports');
                const data = await res.json();
                setReports(data);
            } catch (err) {
                console.error('Failed to fetch reports', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [isAdminAuthenticated]);

    // Show sign-in screen if not authenticated
    if (!isAdminAuthenticated) {
        return <AdminSignIn onSuccess={() => setIsAdminAuthenticated(true)} />;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-slate-400 text-lg animate-pulse">Loading Admin Data…</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-6">
            <div className="max-w-7xl mx-auto">

                {/* Header row */}
                <div className="flex items-center justify-between mb-10">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                        <ShieldCheck className="w-9 h-9 text-emerald-400" />
                        Admin Dashboard
                    </h1>
                    <button
                        onClick={() => setIsAdminAuthenticated(false)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30 text-sm transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>

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
                                                {report.topic && report.topic !== 'Unknown Topic' ? report.topic : (report.quizDetails?.topic || 'Unknown Topic')}
                                            </span>
                                        </td>

                                        {/* DATE */}
                                        <td className="px-6 py-5 text-sm text-slate-400">
                                            {(() => {
                                                const rawDate = report.createdAt || report.quizDetails?.createdAt || (report._id ? new Date(parseInt(report._id.substring(0, 8), 16) * 1000) : null);
                                                if (!rawDate) return 'N/A';
                                                const d = new Date(rawDate);
                                                return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
                                            })()}
                                        </td>

                                        {/* SCORE */}
                                        <td className="px-6 py-5 text-lg font-bold text-white">
                                            {report.score}
                                            {report.quizDetails && (
                                                <span className="text-slate-500 text-sm ml-1">
                                                    / {(() => {
                                                        let mcqCount = 0;
                                                        if (Array.isArray(report.quizDetails.content)) mcqCount = report.quizDetails.content.length;
                                                        else if (typeof report.quizDetails.content === 'string') {
                                                            try { mcqCount = JSON.parse(report.quizDetails.content).length; } catch(e) {}
                                                        }
                                                        let codingCount = Array.isArray(report.quizDetails.codingQuestions) ? report.quizDetails.codingQuestions.length : 0;
                                                        return mcqCount + codingCount;
                                                    })()}
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