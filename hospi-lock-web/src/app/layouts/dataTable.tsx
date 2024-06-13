'use client'

import React, { useState, useEffect, HtmlHTMLAttributes } from "react";
import { formatEpochTime } from "../helper/formatTime";
import { Lock } from "lucide-react";
import Loading from "../components/loading";

const SERVER_IP = process.env.SERVER_IP || '10.176.69.180';
const PORT = process.env.SERVER_PORT || '4000';


interface Log {
    timestamp: string;
    email: string;
    ip: string;
    success: boolean;
}


interface User {
    email: string;
    firstName: string;
    lastName: string;
    date: string;
    lockId: string;
}


interface Lock {
    id: number;
    ip: string;
    status: number;
    email: string;
}


export function LogTableItem() {
    const [logList, setLogList] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;


    useEffect(() => {
        async function fetchLogs() {
            setLoading(true);
            try {
                const offset = (currentPage - 1) * limit;
                const res = await fetch(`http://${SERVER_IP}:${PORT}/logs/signin?offset=${offset}&limit=${limit}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch logs');
                }
                const data = await res.json();
                const count: number = data.totalItems;
                const logs: Log[] = data.logs;
                setLogList(logs);
                setTotalPages(Math.ceil(count / limit));
                setLoading(false);
            } catch (err: any) {
                setLoading(false);
                setError(err.message);
            }
        }

        fetchLogs();
    }, [currentPage]);


    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };


    if (loading) return <Loading />;
    if (error) return <div>Error: {error}</div>;


    return (
        <div className="flex flex-col gap-1 mt-1 rounded-md border border-red-600">
            <div className="w-full inline text-center pb-1 bg-red-600 
            text-white tracking-tight font-semibold text-[2.5rem] lg:text-4xl text-transparent">
                Logs
            </div>
            <table className="w-full text-center mt-4 pr-4">
                <thead className="border-b-2">
                    <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Email</th>
                        <th>IP</th>
                        <th>Authenticated</th>
                    </tr>
                </thead>
                <tbody>
                    {logList.map((log: Log, index: number) => {
                        const formattedTime = formatEpochTime(new Date(parseInt(log.timestamp)));
                        return (
                            <tr className="border-b-2 border-x-2" key={index}>
                                <td className="border-x-2" >{formattedTime.date}</td>
                                <td className="border-x-2" >{formattedTime.time}</td>
                                <td className="border-x-2" >{log.email}</td>
                                <td className="border-x-2" >{log.ip}</td>
                                <td className="border-x-2" >{log.success ? 'Yes' : 'No'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="flex justify-center">
                <ul className="flex list-none">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <li key={index} className="">
                            <button
                                onClick={() => handlePageClick(index + 1)}
                                className={`px-3 py-1 ${currentPage === (index + 1) ? 'bg-red-600 text-white' : 'bg-gray-300 text-black'}`}>
                                {index + 1}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}


export function UserTableItem() {
    const [userList, setUserList] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    async function getUsers(): Promise<User[]> {
        const res = await fetch(`http://${SERVER_IP}:${PORT}/users`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!res.ok) {
            throw new Error('Failed to fetch users');
        }
        const data: Record<string, User> = await res.json();
        const users: User[] = Object.values(data);
        console.log(users);
        return users;
    }


    useEffect(() => {
        async function fetchUsers() {
            try {
                const users: User[] = await getUsers();
                setUserList(users);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex flex-col gap-1 mt-1 rounded-md border border-red-600">
            <div className="w-full inline text-center pb-1 bg-red-600 
            text-white tracking-tight font-semibold text-[2.5rem] lg:text-4xl text-transparent ">
                Users
            </div>
            <table className="w-full text-center mt-4 pr-4">
                <thead className="border-b-2">
                    <tr>
                        <th>Email</th>
                        <th>First name</th>
                        <th>Last name</th>
                        <th>Registration datetime</th>
                        <th>Registered lock</th>
                    </tr>
                </thead>
                <tbody>
                    {userList.map((user: User, index: number) => {
                        const formattedTime = formatEpochTime(new Date(user.date));
                        return (
                            <tr className="border-b-2 border-x-2" key={index}>
                                <td className="border-x-2">{user.email}</td>
                                <td className="border-x-2">{user.firstName}</td>
                                <td className="border-x-2">{user.lastName}</td>
                                <td className="border-x-2">{formattedTime.date} {formattedTime.time}</td>
                                <td className="border-x-2">{user.lockId}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}


export function LockTableItem() {
    const [lockList, setLockList] = useState<Lock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ip, setIp] = useState('');


    async function OpenClose(mode: string, id: number) {
        const res = await fetch(`http://${SERVER_IP}:${PORT}/admin/${mode}/${id}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }


    async function getLocks(): Promise<Lock[]> {
        const res = await fetch(`http://${SERVER_IP}:${PORT}/locks`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!res.ok) {
            throw new Error('Failed to fetch locks');
        }
        const data: Record<string, Lock> = await res.json();
        const locks: Lock[] = Object.values(data);

        return locks;
    }


    const handlePost = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const res = await fetch(`http://${SERVER_IP}:${PORT}/locks`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ip })
            });
            if (!res.ok) {
                throw new Error('Failed to post lock');
            }
            return res.json();
        } catch (error) {
            console.error('Error posting lock:', error);
        }
    }

    useEffect(() => {
        async function fetchLocks() {
            try {
                const lock: Lock[] = await getLocks();
                setLockList(lock);
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        }
        fetchLocks();
    }, []);


    function changeOpenCloseText(button: HTMLButtonElement, mode: string, id: number) {
        try {
            if (button.textContent === "Open") {
                button.textContent = "Close";
                OpenClose("unlock", id);
            } else {
                button.textContent = "Open";
                OpenClose("lock", id);
            }
        } catch (e) {
            console.log(e);
        }
    }


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex flex-col gap-1 mt-1 rounded-md border border-red-600" >
            <div className="w-full flex flex-row bg-red-600 items-center text-white tracking-tight font-semibold text-[2.5rem] lg:text-4xl text-transparent">
                <div className="flex-grow text-center">
                    Locks
                </div>
                <div className="h-full rounded-md rounded-l-none flex flex-col items-center bg-white border-0 border-secondary-border border-l-1">
                    <label htmlFor="ip" className="font-semibold text-text text-lg">Register new lock</label>
                    <form onSubmit={handlePost} className="flex relative">
                        <input
                            id="IP"
                            placeholder="eg. 10.176.69.22"
                            type="input"
                            required
                            minLength={11}
                            value={ip}
                            onChange={(e) => setIp(e.target.value)}
                            className="text-text text-sm w-[10rem] text-center h-10 outline-none border border-secondary-border border-l-0 
                            focus:border-red-600 hover:border-red-600"/>
                        <button
                            type="submit"
                            className="text-text text-base border border-secondary-border border-r-0 h-10 border-l-0 px-3 bg-white 
                            hover:bg-red-600 font-semibold hover:text-white">
                            Register
                        </button>
                    </form>
                </div>
            </div>
            <table className="text-center mt-2 pr-4">
                <thead className="border-b-2">
                    <tr>
                        <th>Lock ID</th>
                        <th>IP</th>
                        <th>Lock status</th>
                        <th>Registered user</th>
                        <th>Open/close</th>
                    </tr>
                </thead>
                <tbody>
                    {lockList.map((lock: Lock, index: number) => {
                        return (
                            <tr className="border-b-2" key={index}>
                                <td>{lock.id}</td>
                                <td>{lock.ip}</td>
                                <td>{lock.status}</td>
                                <td>{lock.email}</td>
                                <td>
                                    {
                                        (lock.status === 0)
                                            ? <button onClick={(event) => changeOpenCloseText(event.currentTarget as HTMLButtonElement, 'lock', lock.id)} value={"test"}>Close</button>
                                            : <button onClick={(event) => changeOpenCloseText(event.currentTarget as HTMLButtonElement, 'unlock', lock.id)} value={"test"}>Open</button>
                                    }
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}