import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
const backendUrl = import.meta.env.VITE_BACKEND_URL

export default function AttendTest() {
  const navigate = useNavigate();
  const {user} = useUser();
  const [proceed,setProceed] = useState(true);
  const [quizContent, setQuizContent] = useState('');
  const [answerCount, setAnswerCount] = useState(0);
  const [submit,setSubmit] = useState(false);
  const [answers,setAnswers] = useState({});
  const [origAns,setOrgAns] = useState([]);
  const [score, setScore] = useState(0);
  const [res,setRes] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizId, setQuizId] = useState('');
  const [top1,setTop1] = useState({})
  const [top2,setTop2] = useState({})
  const [top3,setTop3] = useState({})
  const [leader,showLeader] = useState(false);

//extract options from ansKey (the one inside parenthesis) as they are stored like, Answers: (A) (B) (A)
  
const parseAnsKey = (ansKey) => {
    const match = ansKey.match(/\((.*?)\)/g);
    return match ? match.map(item => item.replace(/[()]/g, '')) : [];
  };

  const handleTest = async () => {
    const input = document.getElementById('link');
    const url = input.value.trim();

    const quizId = url.split('/').pop();
    setQuizId(quizId);
    setProceed(false);
    try {
      const checkRes = await fetch(`${backendUrl}/api/checkAttempt/${quizId}?email=${encodeURIComponent(user.primaryEmailAddress.emailAddress)}`);

    if (checkRes.status === 403){
      alert('You have already attempted this quiz.');
      navigate('/');
      return;
    }

      const res = await fetch(`${backendUrl}/api/getTest/${quizId}`);
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
    const res = await fetch(`${backendUrl}/api/leaderboard/${quizId}`);
    const data = await res.json();
    setTop1(data[0]?{name:data[0]?.name || '',score:data[0].score || 0}:{});
    setTop2(data[1]?{name:data[1]?.name || '',score:data[1].score || 0}:{});
    setTop3(data[2]?{name:data[2]?.name || '',score:data[2].score || 0}:{});
    setRes(false);
    showLeader(true);
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
      const res = await fetch(`${backendUrl}/api/addResponse`, {
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
      <div className='w-full flex justify-end mb-4'>
        <button className='bg-green-600 p-3 rounded-lg cursor-pointer' onClick={()=>navigate('/certificate')}>Download Certificate</button>
      </div>
        {submit && !res && (
        <div className="text-center text-xl font-bold mb-4">
          Time Left: {formatTime(timeLeft)}
        </div>
      )}
      <div className='w-full max-w-2xl px-4'>
        <input type='url' id='link' placeholder='Paste quiz link here' className='p-3 rounded-lg bg-white text-black m-4 w-full max-w-2xl' />
      </div>
      {proceed && <div className='mt-6'>
        <button className='bg-green-600 p-3 rounded-lg' onClick={handleTest}>
          Proceed
        </button>
      </div>}

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
     <div className='fixed inset-0 z-50 backdrop-blur-sm flex justify-center items-center overflow-y-auto'>
        <div className='rounded-lg shadow-lg w-[90%] md:w-[60%] lg:w-[40%] max-w-2xl relative'>
        {/* pointer-events-none so that done can work or else absolute will cover all the elements and pointer click won't work */}
        <img src="celebrate.gif" alt="" className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none' />
        <p className='text-green-600 text-2xl text-center align-center bg-white m-5 realtive'>Congratulations! You have scored {score} out of {answerCount} in the test. You can check the current leaderboard.</p>
        <div className="flex justify-around">
        <div>
            <button className='bg-green-600 text-black text-2xl flex justify-center items-center rounded-lg p-2' onClick={()=>{navigate('/')}}>Done</button>
        </div>
        <div>
        <button className='bg-green-600 text-black text-2xl flex justify-center items-center rounded-lg p-2' onClick={leaderboard}>Leaderboard</button>
        </div>
        </div>
        </div>
     </div>
     }
     {leader && <div className='fixed inset-0 z-50 backdrop-blur-sm flex justify-center items-center overflow-y-auto'>
          <div className='bg-white rounded-lg w-[90%] md:w-[60%] lg:w-[40%] max-w-2xl shadow-lg'>
            <h1 className='text-center text-black text-4xl font-bold m-5'>Top Scorers</h1>
        {top1?.name && <h1 className='text-green-600 font-semibold text-2xl text-center'>🥇 {top1.name} - {top1.score}</h1>}
        <div className="flex justify-evenly m-5">
        {top2?.name && <h1 className='text-green-600 font-semibold text-2xl'>🥈 {top2.name} - {top2.score}</h1>}
        {top3?.name && <h1 className='text-green-600 font-semibold text-2xl'>🥉 {top3.name} - {top3.score}</h1>}
        </div>
        <button className='text-red-700 float-left cursor-pointer' onClick={()=>{setRes(true);showLeader(false);}}>Close</button>
        </div>
        </div>}
    </div>
  );
}