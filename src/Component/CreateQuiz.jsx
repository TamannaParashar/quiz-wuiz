import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function CreateQuiz() {
  const [isAnimated, setIsAnimated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdf, setPdf] = useState(false);
  const [loadingText, setLoadingText] = useState("Generate Quiz with AI");

  // Scheduling & Passing
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [passPercentage, setPassPercentage] = useState(70);

  // Proctoring Rules
  const [allowNoise, setAllowNoise] = useState(false);
  const [allowHandGestures, setAllowHandGestures] = useState(false);

  // Coding Questions
  const [addCodingQuestion, setAddCodingQuestion] = useState(false);
  const [codingQuestionType, setCodingQuestionType] = useState('ai_generated'); // ai_generated or custom
  const [codingTopic, setCodingTopic] = useState("");
  const [codingDifficulty, setCodingDifficulty] = useState("Easy");
  const [codingLanguages, setCodingLanguages] = useState(['javascript', 'python', 'cpp', 'java']);

  const [customCodingTitle, setCustomCodingTitle] = useState("");
  const [customCodingDescription, setCustomCodingDescription] = useState("");
  const [customCodingTestCases, setCustomCodingTestCases] = useState([{ input: "", output: "", isHidden: false }]);
  const [generatingTestCases, setGeneratingTestCases] = useState(false);

  const handleAutoGenerateTestCases = async () => {
    if (!customCodingTitle || !customCodingDescription) {
      alert("Please enter a Custom Problem Title and Description first.");
      return;
    }
    setGeneratingTestCases(true);
    try {
      const res = await fetch(`${backendUrl}/api/generate-testcases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: customCodingTitle,
          description: customCodingDescription,
          count: 5
        })
      });
      if (res.ok) {
        const aiCases = await res.json();
        const nonBlankPrev = customCodingTestCases.filter(tc => String(tc.input).trim() || String(tc.output).trim());
        setCustomCodingTestCases([...nonBlankPrev, ...aiCases]);
      } else {
        alert("Failed to generate test cases.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating test cases.");
    }
    setGeneratingTestCases(false);
  };

  const handleAddTestCase = () => setCustomCodingTestCases([...customCodingTestCases, { input: "", output: "", isHidden: false }]);
  const handleTestCaseChange = (index, field, value) => {
    const newCases = [...customCodingTestCases];
    newCases[index][field] = value;
    setCustomCodingTestCases(newCases);
  };
  const handleLanguageToggle = (lang) => {
    setCodingLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };


  useEffect(() => {
    let interval;
    if (loading) {
      const texts = [
        "Analyzing Topic...",
        "Reading Reference Material...",
        "Crafting Questions...",
        "Setting up Proctoring Rules...",
        "Finalizing Quiz..."
      ];
      let i = 0;
      setLoadingText(texts[0]);
      interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
      }, 2000);
    } else {
      setLoadingText("Generate Quiz with AI");
    }
    return () => clearInterval(interval);
  }, [loading]);

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
    formData.append('topic', e.target.topic.value);
    formData.append('ques', e.target.ques.value);
    formData.append('level', e.target.level.value);
    formData.append('reference', e.target.reference.value);
    formData.append('time', e.target.time.value);
    formData.append('allowNoise', allowNoise);
    formData.append('allowHandGestures', allowHandGestures);
    if (startDate) formData.append('startDate', startDate);
    if (endDate) formData.append('endDate', endDate);
    if (passPercentage) formData.append('passPercentage', passPercentage);

    // Coding Question Data
    formData.append('addCodingQuestion', addCodingQuestion);
    if (addCodingQuestion) {
      formData.append('codingQuestionType', codingQuestionType);
      if (codingQuestionType === 'ai_generated') {
        formData.append('codingTopic', codingTopic);
        formData.append('codingDifficulty', codingDifficulty);
        formData.append('codingLanguages', JSON.stringify(codingLanguages));
      } else {
        formData.append('customCodingTitle', customCodingTitle);
        formData.append('customCodingDescription', customCodingDescription);
        formData.append('customCodingLanguages', JSON.stringify(codingLanguages));
        formData.append('customCodingTestCases', JSON.stringify(customCodingTestCases));
      }
    }

    if (pdf) {
      formData.append('pdf', pdf);
    }
    try {
      const res = await fetch(`${backendUrl}/api/generate-quiz`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      const quizContent = json.quizContent || "Failed to get quiz.";
      const quizId = json.quizId
      navigate('/generatedQuiz', { state: { quizContent, quizId } })
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden relative">
      <div className={`hidden md:block absolute inset-0 transition-all duration-2000 ease-in-out ${isAnimated ? "w-1/2" : "w-full"}`}>
        <img
          src="/create.jpg"
          alt="Image not Found"
          className=" w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900/20"></div>
      </div>

      <div
        className={`absolute right-0 top-0 h-full w-full md:w-1/2 bg-gray-900 transition-all duration-2000 ease-in-out ${isAnimated ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
      >
        <div className="h-full flex items-center justify-center p-8">
          <form className="w-full max-w-md space-y-6 max-h-[85vh] overflow-y-auto pr-2 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" onSubmit={handleGenerateQuiz}>
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
                <p className="m-2 text-white">PDF?<input type="file" name="pdf" id="referencePdf" onChange={(e) => setPdf(e.target.files[0])} className="text-white" /></p>
                {pdf && <p className="text-green-500 text-sm">Pdf:{pdf.name}</p>}
              </div>

              {/* Time Limit */}
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-1">Time Limit (minutes)</label>
                <input type="number" name="time" id="time" placeholder="30" min="1" max="180" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" required />
              </div>

              {/* Pass Percentage */}
              <div>
                <label htmlFor="passPercentage" className="block text-sm font-medium text-gray-300 mb-1">Pass Percentage (%)</label>
                <input type="number" name="passPercentage" id="passPercentage" value={passPercentage} onChange={(e) => setPassPercentage(e.target.value)} min="1" max="100" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" required />
              </div>

              {/* Scheduling */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">Start Date & Time</label>
                  <input type="datetime-local" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">End Date & Time</label>
                  <input type="datetime-local" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                </div>
              </div>

              {/* Proctoring Settings */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 space-y-3">
                <h3 className="text-sm font-semibold text-emerald-400 mb-2">Proctoring Rules</h3>

                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={allowNoise}
                    onChange={(e) => setAllowNoise(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 bg-gray-700"
                  />
                  <span className="ml-3 text-sm text-gray-300 group-hover:text-white transition-colors">
                    Allow Background Noise / Speaking
                  </span>
                </label>

                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={allowHandGestures}
                    onChange={(e) => setAllowHandGestures(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 bg-gray-700"
                  />
                  <span className="ml-3 text-sm text-gray-300 group-hover:text-white transition-colors">
                    Allow Hand Gestures
                  </span>
                </label>
              </div>

              {/* Coding Question Toggle */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-semibold text-blue-400">Include a Coding Question</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={addCodingQuestion} onChange={() => setAddCodingQuestion(!addCodingQuestion)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${addCodingQuestion ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${addCodingQuestion ? 'translate-x-4' : ''}`}></div>
                  </div>
                </label>

                {addCodingQuestion && (
                  <div className="space-y-4 pt-3 border-t border-gray-700 mt-3 animate-fade-in">
                    <div className="flex space-x-2 p-1 bg-gray-900 rounded-lg">
                      <button type="button" onClick={() => setCodingQuestionType('ai_generated')} className={`flex-1 py-1 text-sm rounded-md transition-colors ${codingQuestionType === 'ai_generated' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>AI Generated</button>
                      <button type="button" onClick={() => setCodingQuestionType('custom')} className={`flex-1 py-1 text-sm rounded-md transition-colors ${codingQuestionType === 'custom' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Custom Problem</button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Allowed Languages</label>
                      <div className="flex flex-wrap gap-2">
                        {['javascript', 'python', 'cpp', 'java'].map(lang => (
                          <button key={lang} type="button" onClick={() => handleLanguageToggle(lang)} className={`px-2 py-1 text-xs rounded border ${codingLanguages.includes(lang) ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-transparent border-gray-600 text-gray-500 hover:text-gray-300'}`}>
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    {codingQuestionType === 'ai_generated' ? (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">DSA Topic</label>
                          <input type="text" value={codingTopic} onChange={e => setCodingTopic(e.target.value)} placeholder="e.g. Arrays, Trees, Dynamic Programming..." className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Difficulty</label>
                          <select value={codingDifficulty} onChange={e => setCodingDifficulty(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
                            <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <input type="text" value={customCodingTitle} onChange={e => setCustomCodingTitle(e.target.value)} placeholder="Problem Title" className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 mb-2" />
                          <textarea value={customCodingDescription} onChange={e => setCustomCodingDescription(e.target.value)} placeholder="Problem Description (HTML allowed)" rows="3" className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"></textarea>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-medium text-gray-400">Test Cases</label>
                            <div className="flex gap-2">
                              <button type="button" onClick={handleAutoGenerateTestCases} disabled={generatingTestCases} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition">
                                {generatingTestCases ? <span className="animate-spin inline-block w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full"></span> : "✨ AI Generate"}
                              </button>
                              <button type="button" onClick={handleAddTestCase} className="text-xs text-blue-400 hover:text-blue-300">+ Add</button>
                            </div>
                          </div>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {customCodingTestCases.map((tc, idx) => (
                              <div key={idx} className="p-2 bg-gray-900 rounded border border-gray-700 space-y-2">
                                <div className="flex gap-2">
                                  <input type="text" value={tc.input} onChange={e => handleTestCaseChange(idx, 'input', e.target.value)} placeholder="Input (e.g. 1\n2)" className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white" />
                                  <input type="text" value={tc.output} onChange={e => handleTestCaseChange(idx, 'output', e.target.value)} placeholder="Expected Output" className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white" />
                                </div>
                                <label className="flex items-center text-xs text-gray-400">
                                  <input type="checkbox" checked={tc.isHidden} onChange={e => handleTestCaseChange(idx, 'isHidden', e.target.checked)} className="mr-2" /> Hidden Case
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Create Button */}
              <button type="submit" disabled={loading} className={`w-full bg-gradient-to-r ${loading ? 'from-emerald-600 to-blue-700 cursor-not-allowed opacity-75' : 'from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 hover:scale-105 hover:shadow-xl'} text-white font-semibold py-2 px-5 rounded-lg transform transition-all duration-200 shadow-lg flex justify-center items-center`}>
                {loading && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loadingText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}