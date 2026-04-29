'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Award, Download, ArrowLeft, Trophy, Calendar, BookOpen, CheckCircle, XCircle, Search } from 'lucide-react';

export default function MyCertificates() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'passed' | 'failed'

  useEffect(() => {
    if (!user) return;

    const fetchCertificates = async () => {
      setLoading(true);
      try {
        const email = user.primaryEmailAddress.emailAddress;
        const res = await fetch(`/api/getDetails?email=${encodeURIComponent(email)}`);
        const attempts = await res.json();

        if (!attempts || attempts.length === 0) {
          setCertificates([]);
          setLoading(false);
          return;
        }

        // Fetch quiz details for each attempt in parallel
        const enriched = await Promise.all(
          attempts.map(async (attempt) => {
            try {
              const quizRes = await fetch(`/api/getTest/${attempt.quizId}`);
              const quizData = await quizRes.json();
              const totalQuestions =
                (quizData.content?.length || 0) + (quizData.codingQuestions?.length || 0);
              const percentage =
                totalQuestions > 0 ? Math.round((attempt.score / totalQuestions) * 100) : 0;
              const passPercentage = quizData.passPercentage || 70;
              const passed = percentage >= passPercentage;

              return {
                responseId: attempt._id,
                quizId: attempt.quizId,
                name: attempt.name,
                topic: quizData.topic || 'Unknown Topic',
                score: attempt.score,
                totalQuestions,
                percentage,
                passPercentage,
                passed,
                date: attempt.createdAt
                  ? new Date(attempt.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'N/A',
              };
            } catch {
              return null;
            }
          })
        );

        // Newest first; filter out any failed fetches
        setCertificates(enriched.filter(Boolean).reverse());
      } catch (err) {
        console.error('Failed to fetch certificates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user]);

  const filtered = certificates.filter((c) => {
    const matchesSearch = c.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'passed' && c.passed) ||
      (filter === 'failed' && !c.passed);
    return matchesSearch && matchesFilter;
  });

  const passedCount = certificates.filter((c) => c.passed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            id="back-home-btn"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Signed in as</p>
            <p className="text-sm text-slate-300 font-medium">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              My Certificates
            </h1>
          </div>
          <p className="text-slate-400 pl-14">
            All your quiz participation records and downloadable certificates
          </p>
        </div>

        {/* Stats Bar */}
        {!loading && certificates.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">{certificates.length}</p>
              <p className="text-xs text-slate-400 mt-1">Total Attempts</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold text-emerald-400">{passedCount}</p>
              <p className="text-xs text-slate-400 mt-1">Certificates Earned</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold text-red-400">
                {certificates.length - passedCount}
              </p>
              <p className="text-xs text-slate-400 mt-1">Needs Improvement</p>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        {!loading && certificates.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="cert-search"
                type="text"
                placeholder="Search by quiz topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'passed', 'failed'].map((f) => (
                <button
                  key={f}
                  id={`filter-${f}-btn`}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition capitalize ${
                    filter === f
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-slate-400">Fetching your certificates...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && certificates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-2">
              <BookOpen className="w-9 h-9 text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold text-white">No quiz attempts yet</h2>
            <p className="text-slate-400 max-w-sm">
              Attend a quiz to earn your first participation certificate. Good luck! 🎉
            </p>
            <button
              id="attend-quiz-btn"
              onClick={() => navigate('/attendQuiz')}
              className="mt-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-medium text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
            >
              Attend a Quiz
            </button>
          </div>
        )}

        {/* No search results */}
        {!loading && certificates.length > 0 && filtered.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <p>No certificates match your search.</p>
          </div>
        )}

        {/* Certificate Cards */}
        {!loading && filtered.length > 0 && (
          <div className="grid gap-4">
            {filtered.map((cert, index) => (
              <div
                key={cert.responseId}
                className={`group relative bg-slate-800/40 border rounded-2xl p-5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-xl ${
                  cert.passed
                    ? 'border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-emerald-500/10'
                    : 'border-slate-700/60 hover:border-slate-600'
                }`}
              >
                {/* Passed overlay glow */}
                {cert.passed && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 pointer-events-none" />
                )}

                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: icon + info */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        cert.passed
                          ? 'bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/30'
                          : 'bg-slate-700'
                      }`}
                    >
                      {cert.passed ? (
                        <Trophy className="w-6 h-6 text-white" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-white text-lg leading-tight">
                          {cert.topic}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            cert.passed
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {cert.passed ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Passed
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Not Passed
                            </>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {cert.date}
                        </span>
                        <span>
                          Score:{' '}
                          <span
                            className={`font-semibold ${
                              cert.passed ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {cert.score}/{cert.totalQuestions}
                          </span>
                        </span>
                        <span>
                          Pass mark:{' '}
                          <span className="text-slate-300">{cert.passPercentage}%</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: percentage ring + CTA */}
                  <div className="flex items-center gap-4 sm:flex-shrink-0">
                    {/* Radial progress */}
                    <div className="relative w-14 h-14">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                        <circle
                          cx="28"
                          cy="28"
                          r="22"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="text-slate-700"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="22"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 22}`}
                          strokeDashoffset={`${
                            2 * Math.PI * 22 * (1 - cert.percentage / 100)
                          }`}
                          strokeLinecap="round"
                          className={cert.passed ? 'text-emerald-400' : 'text-red-400'}
                          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className={`text-xs font-bold ${
                            cert.passed ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {cert.percentage}%
                        </span>
                      </div>
                    </div>

                    {cert.passed ? (
                      <button
                        id={`download-cert-${cert.responseId}`}
                        onClick={() => navigate(`/certificate/${cert.responseId}`)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                      >
                        <Download className="w-4 h-4" />
                        View &amp; Download
                      </button>
                    ) : (
                      <div className="px-4 py-2.5 bg-slate-700/50 rounded-xl text-xs text-slate-400 border border-slate-700 text-center">
                        <p>Score {cert.passPercentage}%</p>
                        <p>to pass</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
