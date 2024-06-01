'use client';

import { useState } from "react";
import PageHeader from "./pageHeader";
import Sidebar from "./sidebar";
import DataTable from "./dataTable";
import ModalLogin from "../components/modalLogin";

export default function AdminComponent() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen)
    }


    return (
        <div className="max-h-screen flex flex-col">
            <PageHeader />
            <ModalLogin show={!isModalOpen} onClose={toggleModal}/>
            <div className="grid grid-cols-[auto,1fr] flex-grow-1 overflow-auto">
                <Sidebar />
                <div className="overflow-x-hidden px-8 pb-4">
                    <DataTable />
                </div>
            </div>
        </div>
    );
};