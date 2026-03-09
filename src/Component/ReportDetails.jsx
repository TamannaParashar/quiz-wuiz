import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const ReportDetails = ({ report }) => {
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Test_Report_${report.name.replace(/\s+/g, '_')}`,
    });

    const { quizDetails, answers, codingAnswers, score, warnings } = report;
    const questions = quizDetails?.content || [];
    const codingQuestions = quizDetails?.codingQuestions || [];
    const totalQuestions = questions.length + codingQuestions.length;

    return (
        <div className="p-6 bg-slate-800/50 border-t border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Detailed Evaluation</h3>
                <button
                    onClick={() => handlePrint()}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-lg transform hover:scale-105 active:scale-95"
                >
                    <Printer className="w-5 h-5" />
                    Download PDF
                </button>
            </div>

            {/* Printable Area */}
            <div ref={componentRef} className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-xl print:bg-white print:shadow-none print:border-none print:text-black">
                {/* Header for PDF */}
                <div className="flex items-center justify-between border-b border-slate-700 pb-6 mb-6 print:border-gray-200">
                    <div className="flex items-center gap-4">
                        {report.referencePhotoUrl ? (
                            <img src={report.referencePhotoUrl} alt="Student" className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-md print:border-gray-300" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold border-2 border-slate-600 print:bg-gray-100 print:text-gray-600">N/A</div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-white print:text-black">{report.name}</h1>
                            <p className="text-slate-400 print:text-gray-600">{report.email}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-indigo-400 print:text-gray-800">{report.topic}</h2>
                        <p className="text-slate-400 print:text-gray-500">{new Date(report.createdAt).toLocaleString()}</p>
                    </div>
                </div>

                {/* Metrics Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center print:bg-gray-50 print:border-gray-200">
                        <p className="text-sm text-slate-400 font-medium mb-1 print:text-gray-500">Score</p>
                        <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 print:text-indigo-600 print:bg-none ">{score} <span className="text-xl text-slate-500 print:text-gray-400">/ {totalQuestions}</span></p>
                    </div>
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center print:bg-gray-50 print:border-gray-200">
                        <p className="text-sm text-slate-400 font-medium mb-1 print:text-gray-500">Accuracy</p>
                        <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 print:text-emerald-600 print:bg-none">
                            {totalQuestions ? Math.round((score / totalQuestions) * 100) : 0}%
                        </p>
                    </div>
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center col-span-2 print:bg-gray-50 print:border-gray-200">
                        <p className="text-sm text-slate-400 font-medium mb-1 print:text-gray-500">Status / Violations</p>
                        {warnings && warnings.length > 0 ? (
                            <p className="text-xl mt-1 font-bold text-red-500 truncate print:text-red-600"><AlertTriangle className="w-6 h-6 inline mr-2 mb-1" />{warnings.length} Violations Logged</p>
                        ) : (
                            <p className="text-xl mt-1 font-bold text-emerald-500 print:text-emerald-600"><CheckCircle className="w-6 h-6 inline mr-2 mb-1" />Clean Attempt</p>
                        )}
                    </div>
                </div>

                {warnings && warnings.length > 0 && (
                    <div className="mb-8 p-5 bg-red-900/30 border border-red-800/50 rounded-xl print:bg-red-50 print:border-red-200">
                        <h4 className="flex items-center gap-2 text-red-400 font-bold mb-3 print:text-red-800 text-lg">
                            <AlertTriangle className="w-5 h-5" /> Proctoring Behavior Violations
                        </h4>
                        <ul className="list-disc list-inside text-sm text-red-300 space-y-2 print:text-red-700 ml-2">
                            {warnings.map((w, idx) => (
                                <li key={idx} className="leading-relaxed">{w}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Q&A Section */}
                <div>
                    <h4 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-3 print:text-black print:border-gray-200">Question Breakdown</h4>
                    <div className="space-y-6">
                        {questions.map((q, qIndex) => {
                            const studentAnswerCode = answers[qIndex];
                            const correctAnswerCode = q.answer;
                            const isCorrect = studentAnswerCode === correctAnswerCode;

                            return (
                                <div key={qIndex} className={`p-6 rounded-2xl border backdrop-blur-sm print:backdrop-blur-none print:break-inside-avoid print:shadow-none print:mb-4 ${isCorrect ? 'bg-emerald-900/10 border-emerald-800/30 print:bg-emerald-50 print:border-emerald-100' : 'bg-red-900/10 border-red-800/30 print:bg-red-50 print:border-red-100'}`}>
                                    <div className="flex gap-4 items-start mb-6">
                                        <span className={`flex-shrink-0 mt-1 ${isCorrect ? 'text-emerald-400 print:text-emerald-500' : 'text-red-400 print:text-red-500'}`}>
                                            {isCorrect ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                        </span>
                                        <h5 className="font-semibold text-white text-lg leading-relaxed print:text-slate-800">{qIndex + 1}. {q.question}</h5>
                                    </div>

                                    <div className="ml-10 space-y-3">
                                        {Object.entries(q.options).map(([optCode, optText]) => {
                                            const isStudentSelected = optCode === studentAnswerCode;
                                            const isActualCorrect = optCode === correctAnswerCode;

                                            let badgeClass = "bg-slate-800/50 border-slate-700 text-slate-300 print:bg-white print:border-gray-200 print:text-gray-600";
                                            let badgeText = "";

                                            if (isActualCorrect && isStudentSelected) {
                                                badgeClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold print:bg-emerald-100 print:border-emerald-300 print:text-emerald-800";
                                                badgeText = "(Correct & Selected)";
                                            } else if (isActualCorrect && !isStudentSelected) {
                                                badgeClass = "bg-emerald-900/30 border-emerald-800/50 text-emerald-400 font-medium print:bg-emerald-50 print:border-emerald-200 print:text-emerald-700";
                                                badgeText = "(Correct Answer)";
                                            } else if (!isActualCorrect && isStudentSelected) {
                                                badgeClass = "bg-red-500/20 border-red-500/50 text-red-300 font-bold print:bg-red-100 print:border-red-300 print:text-red-800";
                                                badgeText = "(Your Answer - Incorrect)";
                                            }

                                            return (
                                                <div key={optCode} className={`p-4 rounded-xl border ${badgeClass} flex justify-between items-center transition`}>
                                                    <span><span className="font-bold mr-3">{optCode})</span> {optText}</span>
                                                    {badgeText && <span className="text-xs uppercase tracking-wider bg-black/20 px-2 py-1 rounded print:bg-transparent">{badgeText}</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {questions.length === 0 && codingQuestions.length === 0 && (
                            <p className="text-slate-500 italic p-4 text-center">No detailed question data available for this quiz.</p>
                        )}

                        {codingQuestions.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-slate-700 print:border-gray-300">
                                <h4 className="text-xl font-bold text-white mb-6 print:text-black">Coding Challenges</h4>
                                <div className="space-y-6">
                                    {codingQuestions.map((q, cqIndex) => {
                                        // Find mapped coding answer from payload. (e.g. key is the real total index)
                                        const globalIndex = questions.length + cqIndex;
                                        const studentCode = (codingAnswers && codingAnswers[globalIndex]) || "";

                                        // Because coding problems execute locally logic securely against test cases instantly on submission,
                                        // we assume if they received the point natively from `/api/addResponse` they are correct. 
                                        // But for a visual UI here, Admin can parse their code.

                                        return (
                                            <div key={cqIndex} className="p-6 rounded-2xl bg-slate-900 border border-slate-700 print:break-inside-avoid print:bg-white print:border-gray-300 print:shadow-none">
                                                <div className="mb-4">
                                                    <h5 className="font-semibold text-white text-lg print:text-slate-800">
                                                        {globalIndex + 1}. {q.title || "Coding Problem"}
                                                    </h5>
                                                </div>
                                                <div className="bg-black/50 p-4 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-200">
                                                    <span className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-2 block">Student's Submitted Code</span>
                                                    {studentCode.trim().length > 0 ? (
                                                        <pre className="text-emerald-400 font-mono text-xs whitespace-pre-wrap overflow-x-auto print:text-black">
                                                            {studentCode}
                                                        </pre>
                                                    ) : (
                                                        <span className="text-slate-500 text-sm italic">No code submitted by the student.</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDetails;
