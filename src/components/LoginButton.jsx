"use client";
import React, { useState } from "react";
import {BsGoogle} from 'react-icons/bs'

import { signInWithGoogle } from "./supabaseClient";

const LoginButton = () => {
  return (
    <>
    
      <button className="flex items-center 
      justify-center px-3.5 py-1.5 bg-indigo-500 
      text-white font-bold hover:bg-indigo-400  text-2xl rounded-lg space-x-3"
      onClick={signInWithGoogle}
      >
        <BsGoogle />
      <p>Login Google</p>

      </button>
    </>
  );
};

export default LoginButton;
