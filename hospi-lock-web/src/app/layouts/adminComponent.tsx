'use client';

import React from "react";
import PageHeader from "./pageHeader";
import Sidebar from "./sidebar";
import { useAuth } from "../../helper/authContext";
import Loading from "../../components/loading";

export default function AdminComponent({ children }: { children: React.ReactNode }) {
    const { isLoggedIn } = useAuth();

    return (
        <div className="max-h-screen flex flex-col">
            <PageHeader />
            {isLoggedIn ? (
                <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto">
                    <Sidebar />
                    <div className="overflow-x-hidden px-8 pb-4">
                        {children}
                    </div>
                </div>
            ) : (
                <Loading />
            )}
        </div>
    );
};