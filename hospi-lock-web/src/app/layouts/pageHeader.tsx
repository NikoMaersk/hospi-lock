'use client';

import { Bell, HelpCircle, Menu, Search, ArrowLeft } from "lucide-react";
import { Button } from "../components/button";
import React, { useRef, useState } from 'react';

export default function PageHeader() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [showFullWidthSearch, setShowFullWidthSearch] = useState(false)

    return (
        <header className="flex justify-between items-center w-full">
            <nav className="flex md:gap-4 px-6">
                <Button variant="ghost">
                    <Menu className="stroke-gray-600" />
                </Button>
            </nav>
            <form
                className={`gap-4 my-3 flex-grow justify-center ${showFullWidthSearch ? "flex" : "hidden md:flex"
                    }`}
            >
                {showFullWidthSearch && (
                    <Button
                        onClick={() => setShowFullWidthSearch(false)}
                        type="button"
                        variant="ghost"
                        className="flex-shrink-0" >
                        <ArrowLeft />
                    </Button>
                )}
                <div className="flex flex-grow max-w-[600px]">
                    <input
                        type="search"
                        placeholder="Search"
                        className="rounded-l-full border border-secondary-border shadow-inner shadow-secondary py-1 px-4 text-lg w-full focus:border-blue-500 outline-none"
                    />
                    <Button size="default" className="px-4 rounded-r-full border-secondary-border border border-l-0 flex-shrink-0">
                        <Search />
                    </Button>
                </div>
            </form>
            <div  className={`flex-shrink-0 md:gap-2 ${
          showFullWidthSearch ? "hidden" : "flex"
        }`}>
                
                <Button variant="ghost">
                    <HelpCircle className="stroke-gray-600" />
                </Button>
                <Button variant="ghost">
                    <Bell className="stroke-gray-600" />
                </Button>
            </div>
        </header>
    );
}