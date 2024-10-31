import React, { useState } from 'react'
import { assets } from '../assets/assets'

const Bgslider = () => {
    const[slider,setSlider] = useState(50)
    const handleSliderChange = (e)=>{
         setSlider(e.target.value)
    }
  return (
    <div className='mb-12'>
       <h1 className='text-center mb-8 sm:mb-12 text-2xl md:text-3xl lg:text-4xl font-semibold bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent'>Remove Background With High <br /> Quality and Accuracy</h1>

       <div className='relative w-full max-w-3xl overflow-hidden m-auto rounded-xl'>
        {/* BG image */}
        <img src={assets.image_w_bg} style={{clipPath:`inset(0 ${100.2 -slider}% 0 0)`}} />

        <img className='absolute top-0 left-0 w-full' src={assets.image_wo_bg} style={{clipPath:`inset(0 0 0 ${slider}%)`}} />

        <input type="range" 
        className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full z-10 slider'
        min={0} max={100} value={slider} onChange={handleSliderChange}/>
       </div>
    </div>
  )
}

export default Bgslider
