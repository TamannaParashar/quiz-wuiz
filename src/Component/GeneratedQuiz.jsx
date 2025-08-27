import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function GeneratedQuiz() {
    const location = useLocation();
    const navigate = useNavigate();
    const quizContent = location.state?.quizContent;
  return (
    <div className='bg-gray-900 overflow-hidden'>
      <h1 className='text-emerald-500 text-center text-3xl m-4' style={{textShadow:'2px 2px 2px white'}}>Generated Quiz</h1>
      <pre className="block text-white whitespace-pre-wrap bg-gray-800">{quizContent}</pre>
      <button className='rounded-lg p-3 bg-emerald-500 m-4' onClick={()=>navigate('/createQuiz')}>Go Back</button>
    </div>
  )
}
