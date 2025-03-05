
import React from 'react'

import GoHome from './GoHome'

export default function Finish() {
  return (
    <>
      <div className='container'>
        <div className='min-h-screen bg-base-200 flex flex-1 justify-center items-center'>
          <div className='text-center'>
            <div className='max-w-md'>
              <h1 className='text-5xl font-bold'>Great job!🎉🎉🎉</h1>
              <p className='py-6'>You have finished this project for now.</p>
              <GoHome />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
