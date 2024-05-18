'use client'

import { ElementType } from "react";
import { twMerge } from "tailwind-merge";
import { buttonStyles } from "../components/Button";
import { Home, LineChart, ScrollText, User } from "lucide-react";


export default function Sidebar() {

    return (
        <aside
            className={`sticky top-0 overflow-y-auto scrollbar-hidden pb-4 
            flex flex-col ml-1 lg:flex"}`}>
            <SmallsidebarItem Icon={Home} title="Home" url="/" />
            <SmallsidebarItem Icon={User} title="Users" url="/users" />
            <SmallsidebarItem Icon={ScrollText} title="Logs" url="/logs" />
            <SmallsidebarItem Icon={LineChart} title="Analytics" url="/analytics" />
        </aside>
    );
}

interface SmallSidebarProps {
    Icon: ElementType,
    title: string,
    url: string
}

function SmallsidebarItem({ Icon, title, url }: SmallSidebarProps) {
    

    return (
        <a href={url} className={twMerge(buttonStyles({ variant: "ghost", size: "icon" }), 
        " px-1 py-4 flex flex-row items-center rounded-lg gap-4 w-40 hover:text-red-600")}>
            <Icon className="w-8 h-6 ml-4" />
            <h1 className="text-sm">{title}</h1>
        </a>
    )
}

