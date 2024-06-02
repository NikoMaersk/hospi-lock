'use client';

import { Bell, HelpCircle, Menu, Search, ArrowLeft, Moon, Sun } from "lucide-react";
import { Button, buttonStyles } from "../components/Button";
import React, { useRef, useState } from 'react';
import { twMerge } from "tailwind-merge";
import logo from "../assets/Logo.png"
import Image from "next/image";
import ThemeSwitch from "../components/ThemeSwitch";
import ModalLogin from "../components/modalLogin";

export default function PageHeader() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [showFullWidthSearch, setShowFullWidthSearch] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen)
    }


    const handleLogin = async (email: string, password: string) => {
        try {
          const response = await fetch('http://localhost:4000/admin/signin', {
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

    return (
        <div className="flex justify-between items-center w-full py-3 shadow-md gap-2">
            <ModalLogin show={isModalOpen} onClose={toggleModal} onSignIn={handleLogin}/>
            {!showFullWidthSearch && (
                <nav className="flex flex-shrink-0 md:gap-4 px-4">
                    <Button variant="ghost">
                        <Menu />
                    </Button>
                    <a href="/" className="ml-4">
                        <Image src={logo} alt="logo" className="h-12 w-32 items-center" />
                    </a>
                </nav>)}
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
            <div className="flex-shrink-0 md:gap-2 flex items-center mr-4">
                <Button variant="ghost" className={`md:hidden ${showFullWidthSearch ? "hidden" : ""}`} onClick={() => setShowFullWidthSearch(true)}>
                    <Search />
                </Button>
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