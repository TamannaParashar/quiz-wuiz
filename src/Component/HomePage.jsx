"use client"

import { SignedOut, SignIn, SignInButton, SignOutButton, UserButton } from "@clerk/clerk-react"
import { Brain, Users, Zap, BookOpen, GraduationCap, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

export default function Home() {
  const [animationPhase, setAnimationPhase] = useState(0)

  const getBlinkColor = () => {
    const colors = [
      "from-emerald-400 to-blue-400",
      "from-blue-400 to-purple-400",
      "from-purple-400 to-pink-400",
      "from-pink-400 to-red-400",
      "from-red-400 to-orange-400",
    ]
    return colors[animationPhase % colors.length]
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prevPhase) => prevPhase + 1)
    }, 800) // Faster color cycling for more dynamic effect

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 backdrop-blur-sm bg-gray-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Quiz-Wuiz</span>
          </div>
          <div className="flex justify-end">
            <div className="mr-5">
          <SignedOut>
            <SignInButton/> 
          </SignedOut>
          </div>
          <SignOutButton/>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
          <div
            className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{
              backgroundImage: `url('/ai-neural-network-connections-and-learning-algorit.png')`,
            }}
          />
          <div
            className="absolute top-20 right-20 w-64 h-64 opacity-5 bg-cover bg-center"
            style={{
              backgroundImage: `url('/brain-with-circuit-patterns-ai-learning.png')`,
            }}
          />
          <div
            className="absolute bottom-20 left-20 w-48 h-48 opacity-5 bg-cover bg-center"
            style={{
              backgroundImage: `url('/digital-education-books-and-graduation-cap.png')`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-20 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                AI-Powered Learning Platform
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                <span className="inline-block relative">
                  <span
                    className={`inline-block transition-all duration-1000 ease-in-out ${
                      animationPhase % 4 === 0
                        ? "transform scale-105 text-emerald-400"
                        : animationPhase % 4 === 1
                          ? "transform rotate-1 text-blue-400"
                          : animationPhase % 4 === 2
                            ? "transform scale-95 text-purple-400"
                            : "transform -rotate-1 text-cyan-400"
                    }`}
                    style={{
                      textShadow:
                        animationPhase % 4 === 1
                          ? "0 0 15px rgba(59, 130, 246, 0.3)"
                          : animationPhase % 4 === 2
                            ? "0 0 15px rgba(168, 85, 247, 0.3)"
                            : animationPhase % 4 === 3
                              ? "0 0 15px rgba(34, 211, 238, 0.3)"
                              : "0 0 15px rgba(52, 211, 153, 0.3)",
                    }}
                  >
                    Quiz-Wuiz
                  </span>
                </span>
                : An AI Integrated{" "}
                <span
                  className={`text-transparent bg-clip-text bg-gradient-to-r ${getBlinkColor()} transition-all duration-300`}
                >
                  Smart Quiz Platform
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-8">
                Create engaging quizzes or join interactive learning sessions. Experience the future of education.
              </p>
            </div>

            <div className="relative lg:w-1/2 lg:pl-12">
  {/* SVG Multicolor Border */}
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="multicolor-border" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="green" />
        <stop offset="25%" stopColor="red" />
        <stop offset="50%" stopColor="blue" />
        <stop offset="75%" stopColor="yellow" />
        <stop offset="100%" stopColor="pink" />
      </linearGradient>
    </defs>
    <rect
      x="1.5"
      y="1.5"
      width="calc(100% - 3px)"
      height="calc(100% - 3px)"
      stroke="url(#multicolor-border)"
      strokeWidth="3"
      fill="none"
      rx="12"
    />
  </svg>

  {/* Actual Content */}
  <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
    <h3 className="text-lg font-semibold text-emerald-400 mb-4">Why This Platform?</h3>
    <div className="space-y-3 text-sm text-gray-300">
      <p>• AI-powered question generation saves hours of preparation time</p>
      <p>• Real-time analytics provide instant insights into learning progress</p>
      <p>• Adaptive difficulty ensures optimal challenge for every learner</p>
      <p>• Seamless collaboration between educators and students</p>
      <p>• Smart recommendations personalize the learning experience</p>
    </div>
  </div>
</div>

          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-16">
            {/* Create Button - Teacher */}
            <div className="group relative overflow-hidden border-2 border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-2 hover:rotate-1 bg-gray-800/50 backdrop-blur-sm rounded-lg">
              <div
                className="absolute inset-0 opacity-30 bg-cover bg-center group-hover:opacity-40 group-hover:scale-110 transition-all duration-700"
                style={{
                  backgroundImage: `url('/professional-teacher-at-whiteboard-with-students-i.png')`,
                }}
              />
              <div className="relative p-8 text-center">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-emerald-500/30">
                  <GraduationCap className="w-8 h-8 text-white group-hover:animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                  Create
                </h3>
                <p className="text-gray-300 mb-6">Design intelligent quizzes with AI assistance</p>
                <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg flex items-center justify-center">
                  Start Creating
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Attend Button - Student */}
            <div className="group relative overflow-hidden border-2 border-blue-500/20 hover:border-blue-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-2 hover:-rotate-1 bg-gray-800/50 backdrop-blur-sm rounded-lg">
              <div
                className="absolute inset-0 opacity-30 bg-cover bg-center group-hover:opacity-40 group-hover:scale-110 transition-all duration-700"
                style={{
                  backgroundImage: `url('/diverse-students-using-tablets-and-laptops-in-coll.png')`,
                }}
              />
              <div className="relative p-8 text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-blue-500/30">
                  <BookOpen className="w-8 h-8 text-white group-hover:animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                  Attend
                </h3>
                <p className="text-gray-300 mb-6">Join interactive learning sessions</p>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg flex items-center justify-center">
                  Join Session
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose{" "}
              <span className="inline-block relative">
                {["Q", "u", "i", "z", "-", "W", "u", "i", "z"].map((letter, index) => (
                  <span
                    key={index}
                    className="inline-block transition-all duration-300 hover:text-emerald-400 cursor-default hover:scale-125 hover:-translate-y-1"
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.textShadow = "0 0 10px rgba(52, 211, 153, 0.6)"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.textShadow = "none"
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </span>
              ?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the perfect blend of AI technology and educational excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 hover:shadow-xl hover:-translate-y-3 hover:rotate-1 transition-all duration-500 group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 group-hover:bg-emerald-500/30">
                <Brain className="w-6 h-6 text-emerald-400 group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors duration-300">
                AI-Powered
              </h3>
              <p className="text-gray-300">Smart question generation and adaptive learning paths</p>
            </div>

            <div className="p-6 hover:shadow-xl hover:-translate-y-3 transition-all duration-500 group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300 group-hover:bg-blue-500/30">
                <Users className="w-6 h-6 text-blue-400 group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                Collaborative
              </h3>
              <p className="text-gray-300">Real-time interaction between teachers and students</p>
            </div>

            <div className="p-6 hover:shadow-xl hover:-translate-y-3 hover:-rotate-1 transition-all duration-500 group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 group-hover:bg-purple-500/30">
                <Zap className="w-6 h-6 text-purple-400 group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors duration-300">
                Instant Results
              </h3>
              <p className="text-gray-300">Immediate feedback and detailed analytics</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
