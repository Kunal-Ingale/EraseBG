import React from 'react'
import { Routes,Route } from 'react-router'
import Home from './pages/Home'
import Result from'./pages/Result'
import BuyCreadit from'./pages/BuyCreadit'
import Navbar from './components/Navbar'


function App() {
  return (
    <div className='min-h-screen bg-slate-50'>
      <Navbar/>
      
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/result' element={<Result/>}/>
        <Route path='/buy' element={<BuyCreadit/>}/>
      </Routes>
      
    </div>
  )
}

export default App
