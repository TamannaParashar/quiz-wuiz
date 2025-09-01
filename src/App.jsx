import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react'
import './App.css'
import AttendTest from './Component/AttendTest'
import CreateQuiz from './Component/CreateQuiz'
import GeneratedQuiz from './Component/GeneratedQuiz'
import Home from './Component/HomePage'
import {Routes,Route } from 'react-router-dom'

function App() {
  return (
    <div> 
        <Routes>
          <Route path='/' element={<Home/>}></Route>
          <Route path='/createQuiz' element={<><SignedIn><CreateQuiz /></SignedIn><SignedOut><RedirectToSignIn /></SignedOut>
            </>}></Route>
          <Route path='/generatedQuiz' element={<GeneratedQuiz/>}></Route>
          <Route path='/attendQuiz' element={<><SignedIn><AttendTest/></SignedIn><SignedOut><RedirectToSignIn/></SignedOut></>}></Route>
        </Routes>
    
    </div>
  )
}
export default App