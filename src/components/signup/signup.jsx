import React, { useState } from 'react';
import primarybg from "../../assets/images/primarybg.png";
import {TERipple, TEInput } from "tw-elements-react";
import { useSignUp } from '../../hooks/useSignUp';


const Signup = () =>{
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const {signup, error, isLoading} = useSignUp();

    const handleSubmit = async (e) => {
            e.preventDefault();
            await signup(name, email, password)
    }

return(
    <>
<div className="bg-base1" >
<div class="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl" style={{marginLeft:100, paddingTop:100}}>
  <span class="text-transparent bg-clip-text bg-gradient-to-r to-purple-600 from-violet-400">
     Wattswap<br/>
     A Peer to Peer<br/>
     Energy Trading Platform.
  </span>
  </div>
<div className="bg-cover bg-center h-screen relative" style={{ backgroundImage: `url(${primarybg})`}}>
<section className="h-screen w-relative h-relative" style={{marginLeft:70, paddingBottom:150}}>
    <div className="container h-full px-6 py-24 items-center justify-center lg:justify-between" >
        <div className="g-6 flex h-full flex-wrap">
        <div className="md:w-8/12 lg:ml-6 lg:w-5/12">
        <h2 className="text-5xl font-large text-white leading-tight" style={{paddingBottom:5}}>Sign Up</h2>
            
            <form className="bg-transparent text-white border border-gray-400 rounded p-2" onSubmit={handleSubmit}>
             {/* <!-- Name input --> */}
             <h2 className="text-base font-medium leading-tight" style={{paddingBottom:5}}>Name</h2>
              <TEInput
                type="text"
                label="Your Name"
                size="lg"
                className="mb-6 bg-gray-300 text-white border border-gray-400 rounded p-2"
                onChange={(e)=>setName(e.target.value)}
                // value={name}
              ></TEInput>

              {/* <!-- Email input --> */}
              <h2 className="text-base font-medium leading-tight" style={{paddingBottom:5}}>Email</h2>
              <TEInput
                type="email"
                label="Email address"
                size="lg"
                className="mb-6 bg-gray-300 text-white border border-gray-400 rounded p-2"
                onChange={(e)=>setEmail(e.target.value)}
                // value={email}
              ></TEInput>
              
              {/* <!--Password input--> */}
              <h2 className="text-base font-medium leading-tight" style={{paddingBottom:5}}>Password</h2>
              <TEInput
                type="password"
                label="Password"
                className="mb-6"
                size="lg"
                onChange={(e)=>setPassword(e.target.value)}
                // value={password}
              ></TEInput>


              <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-medium leading-tight" style={{paddingBottom:5}}>Already Registered</h2>
                {/* <!-- Signin link --> */}
                <a
                  href="/"
                  className="text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
                  style={{color: 'orange', fontWeight: 700}}
                >
                Sign in
                </a>
              </div>

              {/* <!-- Submit button --> */}

              <TERipple rippleColor="light" className="w-full">
                <button
                  type="submit"
                  className="inline-block w-full rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                  disabled={isLoading}
                >
                  Sign Up
                </button>
              </TERipple>
              {error && <div className='error'>{error}</div>}
            </form>
          </div>
        </div>
    </div>
</section>
</div>
</div>
    </>
    )
}

export default Signup;