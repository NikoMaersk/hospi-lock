'use client';

import React from "react";
import PageHeader from "./pageHeader";
import Welcome from "./welcome";
import { useAuth } from "@/helper/authContext";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const {isLoggedIn} = useAuth();
    const router = useRouter();

    if (isLoggedIn) {
        router.push('/admin/dashboard');
    }

    return (
        <div className="max-h-screen flex flex-col">
            <PageHeader />
            <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto">
                <div className="overflow-x-hidden px-8 pb-4">
                    <Welcome />
                </div>
            </div>
        </div>
    );
}