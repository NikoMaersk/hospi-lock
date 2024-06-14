'use client'

import React from 'react';


export default function Welcome() {


  return (
    <div className="flex gap-6 w-screen mt-10 items-center lg:justify-center">
      <div className="text-center leading-8 md:text-left w-1/3">
        <div className="inline-block">
          <h1 className="tracking-tight inline font-semibold text-[2.5rem] lg:text-4xl">
            Welome to&nbsp;
          </h1>
          <h1 className="tracking-tight inline font-semibold from-red-400 to-red-600 text-[2.5rem] lg:text-4xl bg-clip-text text-transparent bg-gradient-to-b">
            HospiLock&nbsp;
          </h1> 
          <h1 className='tracking-tight inline font-semibold text-[2.5rem] lg:text-4xl'>
            admin app
          </h1>
        </div>
        <p className="mt-4 text-xl">
        This system enhances patient security and privacy by allowing access control via a mobile app or a physical card.
        </p>
        <p className="mt-2 text-xl">
          Please log in to manage the system.
        </p>
      </div>
    </div>
  );
}