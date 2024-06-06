'use client';

import { Bell, HelpCircle, Search, ArrowLeft } from "lucide-react";
import { Button, buttonStyles } from "../components/Button";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import logo from "../assets/logo.png"
import ThemeSwitch from "../components/ThemeSwitch";
import ModalLogin from "../components/modalLogin";
import { useAuth } from "../helper/authContext";

export default function PageHeader() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [showFullWidthSearch, setShowFullWidthSearch] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isLoggedIn, setIsLoggedIn } = useAuth();

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen)
    }


    const handleLogin = async (email: string, password: string) => {
        try {
            const SERVER_IP = '10.176.69.180';
            const PORT = process.env.SERVER_PORT || '4000';

            const response = await fetch(`http://${SERVER_IP}:${PORT}/admin/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
                credentials: 'include'
            });

            console.log(response.json());

            if (response.ok) {
                console.log('Login successful');
                setIsLoggedIn(true);
            } else {
                console.error('Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };


    const checkAuth = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:4000/admin/auth', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                console.log('User authenticated', data);
                setIsLoggedIn(true);
            } else {
                console.error('User not authenticated');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <div className="flex justify-between items-center w-full py-3 shadow-md gap-2">
            <ModalLogin show={isModalOpen} onClose={toggleModal} onSignIn={handleLogin} />
            {!showFullWidthSearch && (
                <nav className="flex flex-shrink-0 md:gap-4 px-4 items-center">
                    <a href="/" className="ml-2">
                        <Image src={logo} alt="logo" className=" w-[40%]" />
                    </a>
                </nav>)}
            {isLoggedIn && (
                <form
                    className={`gap-4 flex-grow justify-center items-center
                    ${showFullWidthSearch ? "flex" : "hidden md:flex"}`}>
                    {showFullWidthSearch && (
                        <Button
                            onClick={() => setShowFullWidthSearch(false)}
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={twMerge(buttonStyles({ variant: "ghost", size: "default" }), "flex-shrink-0 rounded-full size-10")}>
                            <ArrowLeft />
                        </Button>
                    )}
                    <div className={`flex flex-grow max-w-[600px] border rounded-md ${inputFocused ? "border-red-600" : "border-secondary-border"}`}>
                        <Button variant="none" size="icon" className="px-4 rounded-l-md flex-shrink-0 cursor-text"
                            onClick={(e) => {
                                e.preventDefault();
                                inputRef && inputRef.current?.focus();
                            }}>
                            <Search />
                        </Button>
                        <input
                            id="SearchField"
                            type="search"
                            placeholder="Search"
                            className=" rounded-r-md px-4 text-lg w-full outline-none text-gray-800 "
                            ref={inputRef}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)} />
                    </div>
                </form>
            )}
            <div className="flex-shrink-0 md:gap-2 flex items-center mr-4">
                {isLoggedIn &&
                    <Button variant="ghost" className={`md:hidden ${showFullWidthSearch ? "hidden" : ""}`} onClick={() => setShowFullWidthSearch(true)}>
                        <Search />
                    </Button> }
                <Button variant="ghost" className={`${showFullWidthSearch ? "hidden" : ""}`} >
                    <HelpCircle />
                </Button>
                <Button variant="ghost" className={`${showFullWidthSearch ? "hidden" : ""}`}>
                    <Bell />
                </Button>
                <div className="border-x border-gray-400 px-2">
                    <ThemeSwitch />
                </div>
                {isLoggedIn ?
                    (<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" className={twMerge(buttonStyles({ variant: "ghost" }), `p-0.5 ml-2`)}>
                        <img src="https://randomuser.me/api/portraits/med/women/10.jpg"
                            className="rounded-full size-full" />
                    </a>
                    ) : (
                        <Button size="square" className="sm:w-[88px] h-9 items-center justify-center font-bold
                         border-red-500 bg-white hover:bg-red-500 hover:text-white"
                            onClick={toggleModal}>
                            Sign in
                        </Button>
                    )}
            </div>
        </div >
    );
}