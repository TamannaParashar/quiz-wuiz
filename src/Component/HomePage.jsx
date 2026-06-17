import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/clerk-react"
import { Brain, BookOpen, GraduationCap, Zap, Github, ChevronRight, Award } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">

      {/* HERO WRAPPER WITH BACKGROUND IMAGE */}
      <div className="relative min-h-[85vh] md:min-h-[90vh] flex flex-col bg-cover bg-center text-slate-100" style={{ backgroundImage: "url('/collaboration_bg.png')" }}>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-slate-950/75 z-0 pointer-events-none"></div>

        {/* NAVBAR */}
        <header className="relative z-10 border-b border-slate-800/40 backdrop-blur-sm bg-slate-950/45">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
            <h1 onClick={() => navigate("/")} className="text-xl font-semibold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent cursor-pointer">
              Quiz-Wuiz
            </h1>

            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 font-medium text-sm text-white shadow-md shadow-emerald-500/10 cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <SignOutButton>
                  <button className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all duration-200 font-medium text-sm text-slate-200 border border-slate-700 cursor-pointer">
                    Sign Out
                  </button>
                </SignOutButton>
              </SignedIn>
            </div>
          </div>
        </header>

        {/* HERO SECTION CONTENT */}
        <section className="relative z-10 max-w-7xl w-full mx-auto px-6 pt-16 pb-28 md:pt-24 md:pb-36 flex-grow flex items-center">
          <div className="w-full text-left animate-fade-in-up">
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4 max-w-4xl text-white">
              Quiz-Wuiz
              <span className="block text-3xl md:text-5xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mt-3 font-bold">
                Smart Assessment Platform
              </span>
            </h2>

            <p className="max-w-2xl text-slate-300 text-base md:text-lg leading-relaxed mb-10">
              Generate intelligent quizzes instantly, attend interactive tests with AI proctoring, and earn certified credentials.
            </p>

            {/* Category selection row with vertical dividers */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-4 mt-6">
              {/* Category 1: Educators */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">For Educators</span>
                <SignedIn>
                  <button
                    onClick={() => navigate("/createQuiz")}
                    className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Create Test
                  </button>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal" forceRedirectUrl="/createQuiz">
                    <button
                      className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <GraduationCap className="w-4 h-4" />
                      Create Test
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>

              {/* Vertical line divider */}
              <div className="hidden sm:block w-[1px] h-12 bg-slate-700 mx-4"></div>

              {/* Category 2: Learners */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">For Learners</span>
                <div className="flex gap-3">
                  <SignedIn>
                    <button
                      onClick={() => navigate("/attendQuiz")}
                      className="px-6 py-2.5 rounded-full border border-white/60 hover:border-white text-white hover:bg-white/5 font-semibold text-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <BookOpen className="w-4 h-4" />
                      Attend Test
                    </button>
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal" forceRedirectUrl="/attendQuiz">
                      <button
                        className="px-6 py-2.5 rounded-full border border-white/60 hover:border-white text-white hover:bg-white/5 font-semibold text-sm transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <BookOpen className="w-4 h-4" />
                        Attend Test
                      </button>
                    </SignInButton>
                  </SignedOut>

                  <SignedIn>
                    <button
                      onClick={() => navigate("/my-certificates")}
                      className="px-6 py-2.5 rounded-full border border-white/60 hover:border-white text-white hover:bg-white/5 font-semibold text-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Award className="w-4 h-4" />
                      My Certificates
                    </button>
                  </SignedIn>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FLOATING BOTTOM BAR OVERLAP */}
      <div className="relative max-w-4xl mx-auto px-6 -mt-10 mb-16 z-20">
        <div className="bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 flex flex-col sm:flex-row gap-4 items-center w-full">
          <div className="flex-grow flex items-center gap-3 bg-slate-100/70 rounded-xl px-4 py-3 w-full">
            <BookOpen className="text-slate-500 w-5 h-5 flex-shrink-0" />
            <input
              type="text"
              id="hero-quiz-link"
              placeholder="Paste your Quiz Link here to start attending..."
              className="w-full bg-transparent text-slate-900 placeholder-slate-500 focus:outline-none text-sm"
            />
          </div>
          <button
            onClick={() => {
              const val = document.getElementById("hero-quiz-link")?.value?.trim();
              if (val) {
                navigate(`/attendQuiz?link=${encodeURIComponent(val)}`);
              } else {
                navigate("/attendQuiz");
              }
            }}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white font-semibold rounded-xl text-sm whitespace-nowrap shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            Attend Test
          </button>
        </div>
      </div>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8">

          {/* Feature 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6">
              <Brain className="text-emerald-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">
              AI Question Generation
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Instantly create structured, multiple-choice quizzes using advanced AI models.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-6">
              <Zap className="text-cyan-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">
              Instant Results
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Get real-time scoring, leaderboard rankings, and participation tracking.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6">
              <BookOpen className="text-emerald-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">
              Simple & Professional
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Clean interface designed for focus, performance, and reliability.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
        <div className="flex justify-center items-center gap-2">
          © {new Date().getFullYear()} Quiz-Wuiz
          <a
            href="https://github.com/TamannaParashar"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            <Github className="w-4 h-4 inline" />
          </a>
        </div>
      </footer>

    </div>
  )
}