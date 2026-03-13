//http://localhost:5173/quiz-test/68bc0a085dfc999b064d86c1
import { RedirectToSignIn, SignIn, SignUp, SignedIn, SignedOut } from '@clerk/clerk-react'
import './App.css'
import AttendTest from './Component/AttendTest'
import CreateQuiz from './Component/CreateQuiz'
import GeneratedQuiz from './Component/GeneratedQuiz'
import Home from './Component/HomePage'
import { Routes, Route } from 'react-router-dom'
import Certificate from './Component/Certificate'
import AdminDashboard from './Component/AdminDashboard'

function App() {
  return (
    <div>
      <Routes>
        {/* public route */}
        <Route path='/' element={<Home />}></Route>
        <Route path='/sign-in/*' element={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><SignIn routing="path" path="/sign-in" /></div>} />
        <Route path='/sign-up/*' element={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><SignUp routing="path" path="/sign-up" /></div>} />

        {/* private routes */}
        <Route path='/createQuiz' element={<><SignedIn><CreateQuiz /></SignedIn><SignedOut><RedirectToSignIn signInFallbackRedirectUrl="/createQuiz" /></SignedOut>
        </>}></Route>
        <Route path='/generatedQuiz' element={<GeneratedQuiz />}></Route>
        <Route path='/attendQuiz' element={<><SignedIn><AttendTest /></SignedIn><SignedOut><RedirectToSignIn signInFallbackRedirectUrl="/attendQuiz" /></SignedOut></>}></Route>
        <Route path='/certificate' element={<Certificate />}></Route>
        <Route path='/admin' element={<AdminDashboard />}></Route>
      </Routes>

    </div>
  )
}
export default App