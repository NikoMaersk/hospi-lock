'use client';

import { Bell, HelpCircle, Menu, Search, ArrowLeft } from "lucide-react";
import { Button, buttonStyles } from "../components/button";
import React, { useRef, useState } from 'react';
import { twMerge } from "tailwind-merge";

export default function PageHeader() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [showFullWidthSearch, setShowFullWidthSearch] = useState(false)

    return (
        <header className="flex justify-between items-center w-full my-2">
            <nav className="flex md:gap-4 px-6">
                <Button variant="ghost">
                    <Menu className="stroke-gray-600" />
                </Button>
                <a className={twMerge(buttonStyles({ variant: "ghost" }),)}>
                    <img />
                </a>
            </nav>
            <form
                className={`gap-4 flex-grow justify-center 
                ${showFullWidthSearch ? "flex" : "hidden md:flex"}`}>
                {showFullWidthSearch && (
                    <Button
                        onClick={() => setShowFullWidthSearch(false)}
                        type="button"
                        variant="ghost"
                        className="flex-shrink-0" >
                        <ArrowLeft className="stroke-gray-600" />
                    </Button>
                )}
                <div className="flex flex-grow max-w-[600px] border border-secondary-border rounded-md">
                    <Button variant="none" size="default" className="px-4 rounded-l-md flex-shrink-0 cursor-text"
                        onClick={(e) => {
                            e.preventDefault();
                            inputRef && inputRef.current?.focus();
                        }}>
                        <Search className="stroke-gray-500" />
                    </Button>
                    <input
                        type="search"
                        placeholder="Search"
                        className=" rounded-r-md py-1 px-4 text-lg w-full outline-none text-gray-800 "
                        ref={inputRef} />
                </div>
            </form>
            <div className="flex-shrink-0 md:gap-2 flex">
                <Button variant="ghost" className={`md:hidden ${showFullWidthSearch ? "hidden" : ""}`} onClick={() => setShowFullWidthSearch(true)}>
                    <Search className="stroke-gray-600" />
                </Button>
                <Button variant="ghost" className={`${showFullWidthSearch ? "hidden" : ""}`}>
                    <HelpCircle className="stroke-gray-600" />
                </Button>
                <Button variant="ghost" className={`${showFullWidthSearch ? "hidden" : ""}`}>
                    <Bell className="stroke-gray-600" />
                </Button>
                <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" className={twMerge(buttonStyles({ variant: "ghost" }), ``)}>
                    <img src="https://randomuser.me/api/portraits/med/women/10.jpg"
                        className="rounded-full" />
                </a>
            </div>
        </header>
    );
}