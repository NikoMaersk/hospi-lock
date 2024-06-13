'use client';

import React from "react";
import PageHeader from "./pageHeader";
import Welcome from "./welcome";

export default function HomePage() {
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