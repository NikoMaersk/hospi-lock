
"use client"


import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';



const ThemeSwitch: React.FC = () => {
    const [theme, setTheme] = useState('light');


    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };


    const isActive = theme === "light";
    const switchClasses = `flex items-center justify-center w-5 h-5 text-dark bg-white rounded-full transform ${isActive ? 'translate-x-0' : 'translate-x-7'
        } transition-transform duration-300 ease-in-out`;

    return (
        <div className="relative w-14 h-7 rounded-full p-1 cursor-pointer bg-[#ccc]" onClick={toggleTheme}>
            <button className={switchClasses}>
                {isActive ? <Sun size={16} /> : <Moon />}
            </button>
        </div>
    )
};

export default ThemeSwitch;