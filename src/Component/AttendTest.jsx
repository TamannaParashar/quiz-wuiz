//http://localhost:5173/quiz-test/68b2d131c75319bf17e3cce1
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function AttendTest() {
  const [quizContent, setQuizContent] = useState('');
  const [answerCount, setAnswerCount] = useState(0);

  const handleTest = async () => {
    const input = document.getElementById('link');
    const url = input.value.trim();

    if (!url) return setError("Please paste a valid link.");

    const quizId = url.split('/').pop();

    try {
      const res = await fetch(`/api/getTest/${quizId}`);
      const data = await res.json();
      setQuizContent(data.content);
      setAnswerCount(data.questionCount)
    } catch (err) {
      console.log('Something went wrong',err);
    }
  };


  return (
    <div className='bg-gray-800 min-h-screen p-4 text-white'>
      <div className='flex justify-center'>
        <input type='url' id='link' placeholder='Paste quiz link here' className='p-3 rounded-lg bg-white text-black m-4 w-full max-w-2xl' />
      </div>
      <div className='flex justify-center'>
        <button className='bg-green-600 p-3 rounded-lg' onClick={handleTest}>
          Proceed
        </button>
      </div>

      {quizContent && (
        <div className="bg-gray-900 mt-6 p-4 rounded-lg max-w-4xl mx-auto text-white">
          <ReactMarkdown>{quizContent}</ReactMarkdown>
          {Array.from({ length: answerCount }).map((_, index) => (
            <div key={index} className="flex m-5">
              Question {index+1}
              <input type="radio" name={`ques${index}`} id={`ques${index}a`} />
              <input type="radio" name={`ques${index}`} id={`ques${index}b`} />
              <input type="radio" name={`ques${index}`} id={`ques${index}c`} />
              <input type="radio" name={`ques${index}`} id={`ques${index}d`} />
            </div>
          ))}
        </div>
      )}
      <button className='bg-green-600 p-3 rounded-lg' onClick={handleTest}>
          Submit
        </button>
    </div>
  );
}