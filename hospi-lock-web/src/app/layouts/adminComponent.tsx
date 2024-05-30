'use client';

import { useState } from "react";
import PageHeader from "./pageHeader";
import Sidebar from "./sidebar";
import StatisticsView from "./statisticsView";
import ModalLogin from "../components/modalLogin";

export default function AdminComponent() {
    const [showModal, setShowModal] = useState(false);


    return (
        <div className="max-h-screen flex flex-col">
            <PageHeader />
            <ModalLogin show={showModal} />
            <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto">
                <Sidebar />
                <div className="overflow-x-hidden px-8 pb-4">
                    <StatisticsView />
                </div>
            </div>
        </div>
    );
};