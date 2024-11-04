import React, { useState } from 'react';
import wbgImg from '../assets/w_bg.jpg';
import wobgImg from '../assets/wo_bg.jpeg';

const Bgslider = () => {
    const [slider, setSlider] = useState(50);

    const handleSliderChange = (e) => {
        setSlider(e.target.value);
    };

    return (
        <div className='mb-12'>
            <h1 className='text-center mb-8 p-1 sm:mb-12 text-2xl md:text-3xl lg:text-4xl font-semibold bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent'>
                Remove Background With High <br /> Quality and Accuracy
            </h1>

            <div className='relative w-full max-w-2xl m-auto overflow-hidden rounded-xl border border-gray-300' style={{ aspectRatio: '4 / 3' }}>
                {/* Background Image */}
                <img
                    src={wbgImg}
                    alt="With Background"
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    style={{ clipPath: `inset(0 ${100.2 - slider}% 0 0)` }}
                />

                {/* Without Background Image */}
                <img
                    src={wobgImg}
                    alt="Without Background"
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    style={{ clipPath: `inset(0 0 0 ${slider}%)` }}
                />

                {/* Slider */}
                <input
                    type="range"
                    className='absolute top-1/2 left-0 transform -translate-y-1/2 w-full z-10 slider'
                    min={0}
                    max={100}
                    value={slider}
                    onChange={handleSliderChange}
                />
            </div>
        </div>
    );
};

export default Bgslider;
