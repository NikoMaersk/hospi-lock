'use client'

import { ElementType } from "react";
import { twMerge } from "tailwind-merge";
import { buttonStyles } from "../components/Button";
import { LayoutDashboard, LineChart, LockOpen, ScrollText, User } from "lucide-react";
import Link from "next/link";


export default function Sidebar() {

    return (
        <aside
            className={`sticky top-0 overflow-y-auto scrollbar-hidden pb-4 pt-1
            flex flex-col ml-1 lg:flex`}>
            <Link href="/admin/dashboard" passHref>
                <SmallsidebarItem Icon={LayoutDashboard} title="Dashboard" />
            </Link>
            <Link href="/admin/users" passHref>
                <SmallsidebarItem Icon={User} title="Users" />
            </Link>
            <Link href="/admin/locks" passHref>
                <SmallsidebarItem Icon={LockOpen} title="Locks" />
            </Link>
            <Link href="/admin/logs" passHref>
                <SmallsidebarItem Icon={ScrollText} title="Logs" />
            </Link>
            <Link href="/admin/analytics" passHref>
                <SmallsidebarItem Icon={LineChart} title="Analytics" />
            </Link>
        </aside>
    );
}

interface SmallSidebarProps {
    Icon: ElementType,
    title: string,
}

function SmallsidebarItem({ Icon, title }: SmallSidebarProps) {


    return (
        <a className={twMerge(buttonStyles({ variant: "ghost", size: "icon" }),
            " px-1 py-4 flex flex-row items-center rounded-lg gap-4 w-40 hover:text-red-600")}>
            <Icon className="w-8 h-6 ml-4" />
            <h1 className="text-sm">{title}</h1>
        </a>
    )
}

