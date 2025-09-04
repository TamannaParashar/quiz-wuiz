import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function CreateQuiz() {
  const [isAnimated, setIsAnimated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdf,setPdf] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const navigate = useNavigate();

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
      formData.append('topic',e.target.topic.value);
      formData.append('ques',e.target.ques.value);
      formData.append('level',e.target.level.value);
      formData.append('reference',e.target.reference.value);
      formData.append('time',e.target.time.value);
      if(pdf){
        formData.append('pdf',pdf);
      }
    try {
      const res = await fetch(`${backendUrl}/api/generate-quiz`, {
        method: 'POST',
        body:formData,
      });
      const json = await res.json();
      const quizContent = json.quizContent || "Failed to get quiz.";
      const quizId = json.quizId
      navigate('/generatedQuiz',{state:{quizContent,quizId}})
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden relative">
      <div className={`absolute inset-0 transition-all duration-2000 ease-in-out ${isAnimated ? "w-1/2" : "w-full"}`}>
        <img
          src="/create.jpg"
          alt="Image not Found"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900/20"></div>
      </div>

      <div
        className={`absolute right-0 top-0 h-full w-1/2 bg-gray-900 transition-all duration-2000 ease-in-out ${
          isAnimated ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <div className="h-full flex items-center justify-center p-8">
          <form className="w-full max-w-md space-y-6" onSubmit={handleGenerateQuiz}>
            <div className="text-center mb-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-2">
                Create Quiz
              </h1>
            </div>

            <div className="space-y-5">
              {/* Topic Input */}
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-1">Topic</label>
                <input type="text" name="topic" id="topic" placeholder="Enter quiz topic..." className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" required />
              </div>

              {/* Number of Questions */}
              <div>
                <label htmlFor="ques" className="block text-sm font-medium text-gray-300 mb-1">Number of Questions</label>
                <input type="number" name="ques" id="ques" placeholder="10" min="1" max="50" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" required />
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty Level</label>
                <div className="flex space-x-4">
                  {["Easy", "Medium", "Hard"].map((level) => (
                    <label key={level} className="flex items-center cursor-pointer">
                      <input type="radio" name="level" value={level.toLowerCase()} className="mr-2" defaultChecked={level === "Easy"} />
                      <span className="text-gray-300 text-sm">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reference Material */}
              <div>
                <label htmlFor="reference" className="block text-sm font-medium text-gray-300 mb-1">Reference Material</label>
                <input type="text" name="reference" id="referenceText" placeholder="Add reference links or materials..." className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                <p className="m-2 text-white">PDF?<input type="file" name="reference" id="referencePdf" onChange={(e) => setPdf(e.target.files[0])} className="text-white" /></p>
                {pdf && <p className="text-green-500">Pdf:{pdf.name}</p>}
              </div>

              {/* Time Limit */}
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-1">Time Limit (minutes)</label>
                <input type="number" name="time" id="time" placeholder="30" min="1" max="180" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" required />
              </div>

              {/* Create Button */}
              <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:from-emerald-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                {loading ? "Generating..." : "Generate Quiz with AI"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}