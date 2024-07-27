import React, { useEffect, useState } from 'react';
import LoginButton from '../../components/LoginButton';
import { getCurrentUser } from '../../components/supabaseClient';
import Pricing from './Pricing';

export default function Popup() {

  const [showId, setShowId] = useState(0)

  useEffect(() => {
    getCurrentUser().then((resp) => {
      if (resp) {
        console.log('user info: ', resp?.user)
        setShowId(2)
      } else {
        setShowId(1)
      }
    })
  }, [])

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 overflow-y-scroll">
      {showId == 0 && (
        <div className="w-full h-full flex justify-center items-center ">
          <div
            className={`h-10 w-10 animate-spin rounded-full border-4 border-blue-[#07d6a4] border-t-transparent`}
          />
        </div>
      )}

      {
        showId == 1 && (
          <div className="w-full h-full flex flex-col justify-center items-center space-y-6 ">
            <h1 className=" text-4xl font-bold tracking-tight text-black sm:text-5xl xl:text-5xl sm:tracking-tight ">
              <span className="gradient-text font-bold">
                Go Sea
              </span>{" "}
            </h1>

            <LoginButton />
          </div>
        )
      }

      {
        showId == 2 && (
          <div className='w-full h-full flex justify-center items-center'>
            {/* <p className=' text-3xl font-bold'>Hello!</p> */}
            <Pricing />
          </div>
        )
      }

    </div>
  );
}
