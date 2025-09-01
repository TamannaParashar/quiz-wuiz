import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export default function AttendTest() {
  const navigate = useNavigate();
  const {user} = useUser();
  const [quizContent, setQuizContent] = useState('');
  const [answerCount, setAnswerCount] = useState(0);
  const [submit,setSubmit] = useState(false);
  const [answers,setAnswers] = useState({});
  const [origAns,setOrgAns] = useState([]);
  const [score, setScore] = useState(0);
  const [res,setRes] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizId, setQuizId] = useState('');
  const [top1,setTop1] = useState("")
  const [top2,setTop2] = useState("")
  const [top3,setTop3] = useState("")

//extract options from ansKey (the one inside parenthesis) as they are stored like, Answers: (A) (B) (A)
  const parseAnsKey = (ansKey) => {
    const match = ansKey.match(/\((.*?)\)/g);
    return match ? match.map(item => item.replace(/[()]/g, '')) : [];
  };

  const handleTest = async () => {
    const input = document.getElementById('link');
    const url = input.value.trim();

    if (!url) return setError("Please paste a valid link.");

    const quizId = url.split('/').pop();
    setQuizId(quizId);

    try {
      const res = await fetch(`/api/getTest/${quizId}`);
      const data = await res.json();
      setQuizContent(data.content);
      setAnswerCount(data.questionCount);
      const parsedAns = parseAnsKey(data.ansKey);
      setOrgAns(parsedAns);
      setTimeLeft(data.time * 60);
    } catch (err) {
      console.log('Something went wrong',err);
    }
    setSubmit(true)
  };
  const leaderboard=async()=>{
    const res = await fetch(`/api/leaderboard/${quizId}`);
    const data = await res.json();
    setTop1(data[0]?.name || '')
    setTop2(data[1]?.name || '')
    setTop3(data[2]?.name || '')
  }
useEffect(() => {
    if (timeLeft <= 0) {
      if (submit && !res) {
        handleResponse();
      }
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft((time) => time - 1);
    }, 1000);

    return () => clearInterval(timerId); // cleanup on unmount or timeLeft change
  }, [timeLeft, submit, res]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleResponse= async()=>{
    let userScore = 0;
    Object.keys(answers).forEach((questionIndex) => {
      if (answers[questionIndex] === origAns[questionIndex]) {
        userScore += 1;
      }
    });
    setScore(userScore);
    const respData = {
        name:user.firstName,
        email:user.primaryEmailAddress.emailAddress,
        answers:answers,
        score:userScore,
        quizId: quizId
    };
    try {
      const res = await fetch('/api/addResponse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(respData),
      });

      await res.json();
      setRes(true);
    } catch (err) {
      console.log('Error submitting response:', err);
    }
  };

  const handleAnswerChange = (questionIndex, selectedAnswer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: selectedAnswer,
    }));
  };

  return (
    <div className='bg-gray-800 min-h-screen p-4 text-white'>
        {submit && !res && (
        <div className="text-center text-xl font-bold mb-4">
          Time Left: {formatTime(timeLeft)}
        </div>
      )}
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
              <input type="radio" name={`ques${index}`} id={`ques${index}a`} onChange={() => handleAnswerChange(index, 'A')}  />
              <input type="radio" name={`ques${index}`} id={`ques${index}b`} onChange={() => handleAnswerChange(index, 'B')} />
              <input type="radio" name={`ques${index}`} id={`ques${index}c`} onChange={() => handleAnswerChange(index, 'C')} />
              <input type="radio" name={`ques${index}`} id={`ques${index}d`} onChange={() => handleAnswerChange(index, 'D')} />
            </div>
          ))};
        </div>
      )}
      {submit && <button className='bg-green-600 p-3 rounded-lg' onClick={handleResponse}>
          Submit
        </button>
     }
     {res && 
     <div className='fixed inset-0 z-50 backdrop-blur-sm flex justify-center items-center'>
        <div className='rounded-lg shadow-lg w-[40%] h-[30%] max-w-2xl relative'>
        {/* pointer-events-none so that done can work or else absolute will cover all the elements and pointer click won't work */}
        <img src="celebrate.gif" alt="" className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none' />
        <p className='text-green-600 text-2xl text-center align-center bg-white m-5 realtive'>Congratulations! You have scored {score} out of {answerCount} in the test. Leaderboard will be updated after timeout.</p>
        <div className="flex justify-around">
        <div>
            <button className='bg-green-600 text-black text-2xl flex justify-center items-center rounded-lg p-3' onClick={()=>{navigate('/')}}>Done</button>
        </div>
        <div>
        <button className='bg-green-600 text-black text-2xl flex justify-center items-center rounded-lg p-3' onClick={leaderboard}>Leaderboard</button>
        {top1 && <h1>🥇 {top1}</h1>}
        {top2 && <h1>🥈 {top2}</h1>}
        {top3 && <h1>🥉 {top3}</h1>}
        </div>
        </div>
        </div>
     </div>
     }
    </div>
  );
}