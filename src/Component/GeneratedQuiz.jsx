import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ReactMarkDown from 'react-markdown'

export default function GeneratedQuiz() {
    const location = useLocation();
    const navigate = useNavigate();
    const quizContent = location.state?.quizContent;
  return (
    <div className='bg-gray-900 overflow-hidden'>
      <h1 className='text-emerald-500 text-center text-3xl m-4' style={{textShadow:'2px 2px 2px white'}}>Generated Quiz</h1>
      <div className='block text-white bg-gray-800 m-3'>
      <ReactMarkDown components={{
            p: ({ children }) => <p className="mb-3">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-emerald-400">{children}</strong>,
            ul: ({ children }) => <ul className="list-disc list-inside ml-4 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside ml-4 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="block my-1">{children}</li>,

          }}>{quizContent}</ReactMarkDown>
      </div>
      <button className='rounded-lg p-3 bg-emerald-500 m-4' onClick={()=>navigate('/createQuiz')}>Go Back</button>
    </div>
  )
}
