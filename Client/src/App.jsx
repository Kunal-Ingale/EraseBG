import React from 'react'
import { Routes,Route } from 'react-router'
import Home from './pages/Home'
import Result from'./pages/Result'
import BuyCreadit from'./pages/BuyCreadit'
import Navbar from './components/Navbar'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VerifyStripe from './pages/VerifyStripe'

function App() {
  return (
    <div className='min-h-screen bg-slate-50'>
      <ToastContainer position='bottom-right'/>
      <Navbar/>
      
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/result' element={<Result/>}/>
        <Route path='/buy' element={<BuyCreadit/>}/>
        <Route path='/verify' element={<VerifyStripe/>}/>
      </Routes>
      
    </div>
  )
}

export default App
