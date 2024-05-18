'use client';

import PageHeader from "./PageHeader";
import Sidebar from "./Sidebar";
import StatisticsView from "./StatisticsView";

export default function AdminComponent() {
    return (
        <div className="max-h-screen flex flex-col">
            <PageHeader />
            <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto">
                <Sidebar />
                <div className="overflow-x-hidden px-8 pb-4">
                    <StatisticsView />
                </div>
            </div>
        </div>
    )
}