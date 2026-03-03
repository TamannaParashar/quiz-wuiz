import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function GeneratedQuiz() {
  const location = useLocation()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const quizContent = location.state?.quizContent
  const quizId = location.state?.quizId
  const quizTitle = location.state?.quizTitle || 'Quiz'

  const parsedQuiz = quizContent ? JSON.parse(quizContent) : null
  const shareableLink = `${window.location.origin}/quiz-test/${quizId}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!parsedQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-slate-300 mb-6">No quiz data found</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const totalQuestions = parsedQuiz.questions.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-slate-700 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-center flex-1">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                {quizTitle}
              </span>
            </h1>
            <div className="w-16" />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="text-slate-400">
              <span className="font-semibold text-white">{totalQuestions}</span> questions
            </div>
            <div className="h-1.5 flex-1 mx-4 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Questions Grid */}
        <div className="space-y-6 mb-12">
          {parsedQuiz.questions.map((q, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700 hover:border-slate-600 rounded-2xl p-8 transition transform hover:scale-[1.02]"
            >
              {/* Question Header */}
              <div className="mb-8">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <h2 className="text-lg font-semibold text-slate-100 leading-relaxed">
                      {q.question}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {Object.entries(q.options).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-start gap-4 p-4 bg-slate-700/30 border border-slate-600 rounded-xl hover:border-slate-500 hover:bg-slate-700/50 transition"
                  >
                    <div className="w-8 h-8 min-w-fit rounded-lg bg-slate-600/50 flex items-center justify-center text-sm font-semibold text-slate-300 group-hover:bg-slate-500">
                      {key}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed pt-1">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Correct Answer Badge */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-xl">
                <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Correct Answer</p>
                  <p className="text-emerald-200 font-semibold">{q.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleCopyLink}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition transform ${
              copied
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
            } text-white`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? 'Link Copied!' : 'Copy Shareable Link'}
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
            </svg>
            Home
          </button>
        </div>
      </div>
    </div>
  )
}