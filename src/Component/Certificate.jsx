import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react"
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function Certificate(){
  const {user} = useUser();
  const [participantName, setParticipantName] = useState("");
  const [score, setScore] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizId,setQuizId] = useState();
  const [date] = useState(new Date().toLocaleDateString());
  const CEO = "Tamanna Parashar"

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const getCertificateDetails= async ()=>{
        try{
            const email = user.primaryEmailAddress.emailAddress;
            const details = await fetch(`${backendUrl}/api/getDetails?email=${email}`);
            const res = await details.json();
           if(!res || res.length==0){
            alert('No quiz attempted');
            return;
           }
           const lastAttempt = res[res.length-1];
           setQuizId(lastAttempt.quizId);
           setParticipantName(lastAttempt.name);
           setScore(lastAttempt.score);
           const quizRes = await fetch(`${backendUrl}/api/getTest/${lastAttempt.quizId}`);
           const quizData = await quizRes.json();
           setQuizTitle(quizData.topic);
        }catch(err){
            console.log('Failed to get user details',err);
        }
    }

    getCertificateDetails();

    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [user])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-2 sm:p-4 lg:p-8">
      <div
        className={`
          relative w-full max-w-6xl bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 
          rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-400/20 overflow-hidden 
          transform transition-all duration-1000 ease-out
          ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
        style={{ aspectRatio: "auto",printColorAdjust:"exact",WebkitPrintColorAdjust:"exact"}}
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 border-l-2 border-t-2 sm:border-l-4 sm:border-t-4 border-emerald-400/60 rounded-tl-2xl sm:rounded-tl-3xl"></div>
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 border-r-2 border-t-2 sm:border-r-4 sm:border-t-4 border-emerald-400/60 rounded-tr-2xl sm:rounded-tr-3xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 border-l-2 border-b-2 sm:border-l-4 sm:border-b-4 border-emerald-400/60 rounded-bl-2xl sm:rounded-bl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 border-r-2 border-b-2 sm:border-r-4 sm:border-b-4 border-emerald-400/60 rounded-br-2xl sm:rounded-br-3xl"></div>

          <div className="absolute inset-4 sm:inset-6 lg:inset-8 border border-emerald-400/20 rounded-xl sm:rounded-2xl"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col justify-between p-4 sm:p-6 lg:p-12">
          {/* Header Section */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl lg:rounded-2xl flex items-center justify-center sm:mr-4 shadow-lg">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                  Quiz-<span className="text-emerald-400">W</span>u<span className="text-emerald-400">i</span>z
                </h1>
                <p className="text-emerald-300 text-sm sm:text-base lg:text-lg font-medium">
                  AI-Integrated Smart Quiz Platform
                </p>
              </div>
            </div>

            <div className="w-24 sm:w-32 lg:w-48 h-0.5 sm:h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 mx-auto rounded-full mb-4 sm:mb-6 lg:mb-8"></div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center text-center space-y-4 sm:space-y-6 lg:space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-serif text-emerald-400 mb-2 sm:mb-4 tracking-wide">
                Certificate of Participation
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 font-light">This is to certify that</p>
            </div>

            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <div className="relative inline-block">
                <h3 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white px-2 sm:px-4 lg:px-8 py-2 sm:py-3 lg:py-4 relative z-10 break-words">
                  {participantName}
                </h3>
                <div className="absolute bottom-1 sm:bottom-2 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
              </div>

              <p className="text-sm sm:text-lg lg:text-xl text-gray-300 max-w-xs sm:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-2">
                has successfully participated in the
                <span className="text-emerald-400 font-semibold break-words">{quizTitle}</span>
                <br className="hidden sm:block" />{' '}and demonstrated excellence in AI-powered learning</p>

              <div className="inline-block bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-emerald-400/30 mx-2">
                <p className="text-lg sm:text-xl lg:text-2xl text-emerald-400 font-bold">Score: {score}</p>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end space-y-4 sm:space-y-0 mt-4 sm:mt-0">
            <div className="text-center sm:text-left order-2 sm:order-1">
              <p className="text-gray-400 text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">Date of Completion</p>
              <p className="text-emerald-400 text-lg sm:text-xl lg:text-2xl font-semibold">{date}</p>
            </div>

            <div className="text-center order-1 sm:order-2">
              <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 mb-2 sm:mb-4 shadow-lg inline-block">
                <img
                  src="sign.png"
                  alt="CEO Signature"
                  className="w-20 h-10 sm:w-24 sm:h-12 lg:w-32 lg:h-16 object-contain"
                  style={{
                    filter: "contrast(1.3) brightness(0.7) saturate(0)",
                    mixBlendMode: "multiply",
                  }}
                />
              </div>
              <div className="border-t-2 border-emerald-400/50 pt-2 min-w-[150px] sm:min-w-[180px] lg:min-w-[200px]">
                <p className="text-emerald-400 text-base sm:text-lg lg:text-xl font-semibold break-words">{CEO}</p>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Chief Executive Officer</p>
              </div>
            </div>
          </div>
          <p className="text-white text-center m-4">ID : {quizId}</p>
        </div>

        <div className="absolute top-8 sm:top-12 lg:top-20 left-8 sm:left-12 lg:left-20 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse opacity-60"></div>
        <div
          className="absolute top-12 sm:top-20 lg:top-32 right-8 sm:right-16 lg:right-24 w-2 sm:w-2.5 lg:w-3 h-2 sm:h-2.5 lg:h-3 bg-emerald-400 rounded-full animate-pulse opacity-40"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-8 sm:bottom-16 lg:bottom-24 left-12 sm:left-20 lg:left-32 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse opacity-50"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <button
        onClick={() => window.print()}
        className="absolute top-2 sm:top-4 lg:top-8 right-2 sm:right-4 lg:right-8 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 sm:px-4 sm:py-2 lg:px-6 lg:py-3 rounded-lg lg:rounded-xl font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl text-sm sm:text-base"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
        <span className="hidden sm:inline">Print</span>
      </button>
    </div>
  )
}