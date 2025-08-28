import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ReactMarkDown from 'react-markdown'
import { Check } from 'lucide-react';

export default function GeneratedQuiz() {
    const location = useLocation();
    const navigate = useNavigate();
    const [tick,setTick] = useState("");
    const quizContent = location.state?.quizContent;
    const quizId = location.state?.quizId;
    const shareableLink = `${window.location.origin}/quiz-test/${quizId}`;
    const handleCopyLink=()=>{
        navigator.clipboard.writeText(shareableLink)
        setTick("✅");
        setTimeout(() => {
            setTick("")
        }, 2000);
    }

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
      <div className='flex justify-center'>
      <div className='text-white m-5 flex'>
        <button className='rounded-lg bg-gradient-to-r from-emarald-500 to-blue-500 p-3' onClick={handleCopyLink}>Copy Link</button>
        <p>{tick}</p>
      </div>
      <div className='text-white m-5 flex'>
      <button className='rounded-lg p-3 bg-gradient-to-r from-emarald-500 to-blue-500' onClick={()=>navigate('/createQuiz')}>Go Back</button>
      </div>
      </div>
    </div>
  )
}