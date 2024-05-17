'use client';

import PageHeader from "./pageHeader";
import SideBar from "./sideBar";
import StatisticsView from "./statisticsView";

export default function AdminComponent() {
    return (
        <div className="max-h-screen flex flex-col shadow-lg">
            <PageHeader />
            <div className="flex flex-row justify-between">
                <SideBar />
                <StatisticsView />
            </div>
        </div>
    )
}