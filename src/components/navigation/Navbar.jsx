import React from 'react';
import { Link } from 'react-router-dom';
import { useLogout } from '../../hooks/useLogout';
import { useAuthContext } from '../../hooks/useAuthContext';
import {TERipple } from "tw-elements-react";
import { useMetaMaskContext } from '../../hooks/useMetaMaskContext';

function Navbar() {
    const { logout } = useLogout()
    const { user } = useAuthContext()
    const { account, balance, error, connectMetaMask } = useMetaMaskContext();
    
    const handleClick = () => {
        logout()
    };
    
    return (
        <div className='main lg:flex md:flex flex-wrap justify-between 
        items-center px-4 bg-[#090016] py-4 shadow-md'>
            <div className="left">
                <Link to={'/'}>
                    <div className="logo font-bold text-2xl text-white text-center">
                        WattSwap
                    </div>
                </Link>
            </div>
            <div className="right">
                { user &&(
                <ul className='flex space-x-4 text-white justify-center items-center'>
                    <h4>Address:</h4>
                    <h4>{account}</h4>
                    <h4>Balance:</h4>
                    <h4>{balance}</h4>
                    <h4>WTSWP</h4>
                    <h4>{error}</h4>
                    
                    <TERipple rippleColor="light" className="w-full">
                    <button
                    onClick={connectMetaMask}
                    className="inline-block w-full rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                    >
                    Connect Metamask
                    </button>
                    </TERipple>
                    <Link to={'/transferpage'}>
                        <li className='cursor-pointer font-medium'>Invoice</li>
                    </Link>
                    <Link to={'/home'}>
                        <li className='cursor-pointer font-medium'>Home</li>
                    </Link>
                    <Link to={'/marketplace'}>
                        <li className='cursor-pointer font-medium'>MarketPlace</li>
                    </Link>
                    <button 
                    onClick={handleClick}
                    className='cursor-pointer font-medium bg-red-600 px-4 py-'>
                        Logout
                    </button>
                </ul>)}
                {!user && (
                    <ul className='flex space-x-4 text-white justify-center items-center'>
                    <Link to={'/signup'}>
                        <li className='cursor-pointer font-medium'>Signup</li>
                    </Link>
                    <Link to={'/about'}>
                        <li className='cursor-pointer font-medium'>About</li>
                    </Link>
                    </ul>
                )}
            </div>
        </div>
    )
}

export default Navbar