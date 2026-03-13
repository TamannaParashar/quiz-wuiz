import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/clerk-react"
import { Brain, BookOpen, GraduationCap, Zap, Github, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Quiz-Wuiz
          </h1>

          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-colors font-medium text-white">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <SignOutButton>
                <button className="text-sm text-slate-400 hover:text-white transition">
                  Sign Out
                </button>
              </SignOutButton>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
          AI-Powered
          <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Smart Quiz Platform
          </span>
        </h2>

        <p className="max-w-2xl mx-auto text-slate-400 text-lg mb-10">
          Generate intelligent quizzes instantly or participate in interactive
          assessments. Designed for modern educators and learners.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <SignedIn>
            <button
              onClick={() => navigate("/createQuiz")}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 border hover:border-black transition-all shadow-lg shadow-emerald-500/20 font-medium flex items-center justify-center gap-2 text-black"
            >
              <GraduationCap className="w-5 h-5" />
              Create Quiz
              <ChevronRight className="w-4 h-4" />
            </button>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/createQuiz">
              <button
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 border hover:border-black transition-all shadow-lg shadow-emerald-500/20 font-medium flex items-center justify-center gap-2 text-black"
              >
                <GraduationCap className="w-5 h-5" />
                Create Quiz
                <ChevronRight className="w-4 h-4" />
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <button
              onClick={() => navigate("/attendQuiz")}
              className="px-8 py-3 rounded-xl border border-slate-700 hover:border-cyan-400 hover:text-white transition-all font-medium flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Attend Quiz
            </button>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/attendQuiz">
              <button
                className="px-8 py-3 rounded-xl border border-slate-700 hover:border-cyan-400 hover:text-white transition-all font-medium flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Attend Quiz
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </section>

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