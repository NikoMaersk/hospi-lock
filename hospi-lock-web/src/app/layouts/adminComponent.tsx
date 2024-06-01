'use client';

import { useState } from "react";
import PageHeader from "./pageHeader";
import Sidebar from "./sidebar";
import DataTable from "./dataTable";

export default function AdminComponent() {
    return (
        <div className="max-h-screen flex flex-col">
            <PageHeader />
            <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto">
                <Sidebar />
                <div className="overflow-x-hidden px-8 pb-4">
                    <DataTable />
                </div>
            </div>
        </div>
    );
};