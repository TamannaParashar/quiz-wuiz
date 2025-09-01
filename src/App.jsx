import './App.css'
import AttendTest from './Component/AttendTest'
import CreateQuiz from './Component/CreateQuiz'
import GeneratedQuiz from './Component/GeneratedQuiz'
import Home from './Component/HomePage'
import {Routes,Route } from 'react-router-dom'
import LeaderBoard from './Component/LeaderBoard'
function App() {
  return (
    <div> 
        <Routes>
          <Route path='/' element={<Home/>}></Route>
          <Route path='/createQuiz' element={<CreateQuiz/>}></Route>
          <Route path='/generatedQuiz' element={<GeneratedQuiz/>}></Route>
          <Route path='/attendQuiz' element={<AttendTest/>}></Route>
        </Routes>
    
    </div>
  )
}
export default App