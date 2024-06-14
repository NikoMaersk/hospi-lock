'use client'

import React, { useState, useEffect } from "react";
import { formatEpochTime } from "../../helper/formatTime";
import { Lock, LockIcon, User } from "lucide-react";
import Loading from "../../components/loading";
import { Button } from "@/components/Button";

const SERVER_IP = process.env.SERVER_IP || '10.176.69.180';
const PORT = process.env.SERVER_PORT || '4000';
const PAGINATION_LIMIT = 15;

interface Log {
    timestamp: string;
    email: string;
    ip: string;
    success: boolean;
}


interface LockLog {
    timestamp: string;
    ip: string;
    status: number;
}


interface User {
    email: string;
    firstName: string;
    lastName: string;
    date: string;
    lockId: string;
}


interface Lock {
    ip: string;
    id: number;
    email: string;
    status: number;
}


// Should be moved to cleanup this file
export function LogTableItem() {
    const [isLoginCurrent, setIsLoginCurrent] = useState(true);

    return (
        <div className="flex flex-col gap-1 mt-0.5 rounded-md shadow-md">
            <div className="w-full inline text-center pb-1 bg-red-600 rounded-md
            text-white tracking-tight font-semibold text-[2.5rem] lg:text-4xl text-transparent">
                Logs
            </div>
            <div className="flex flex-row items-center justify-center">
                <Button size="square" className={`gap-2 w-24 ${isLoginCurrent ? "bg-red-600 text-white" : "bg-transparent"} border border-red-600 rounded-r-none hover:bg-red-600 hover:text-white`}
                    onClick={() => setIsLoginCurrent(true)}>
                    <User />
                    <h1>Login</h1>
                </Button>
                <Button size="square" className={`gap-2 w-24 ${isLoginCurrent ? "bg-transparent" : "bg-red-600 text-white"} border border-red-600 rounded-l-none hover:bg-red-600 hover:text-white`}
                    onClick={() => setIsLoginCurrent(false)}>
                    <LockIcon />
                    <h1>Locks</h1>
                </Button>
            </div>
            {isLoginCurrent ? (
                <SigninLogChild />
            ) : (
                <LockLogChild />
            )}
        </div>
    );
}


// Should be moved to cleanup this file
function SigninLogChild() {
    const [logList, setLogList] = useState<Log[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const limit = PAGINATION_LIMIT;

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

    return (
        <div>
            {!loading ? (
                <div className="table-container">
                    <table className="w-full text-center pr-4 default-table">
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
                                const parsedTime: number = parseInt(log.timestamp) * 1000;
                                const formattedTime = formatEpochTime(new Date(parsedTime));
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
            ) : (
                <Loading />
            )}
        </div>
    );
};


// Should be moved to cleanup this file
function LockLogChild() {
    const [lockLogList, setLockLogList] = useState<LockLog[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const limit = PAGINATION_LIMIT;

    useEffect(() => {
        async function fetchLogs() {
            setLoading(true);
            try {
                const offset = (currentPage - 1) * limit;
                const res = await fetch(`http://${SERVER_IP}:${PORT}/logs/lock?offset=${offset}&limit=${limit}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch logs');
                }
                const data = await res.json();
                const count: number = data.totalItems;
                const logs: LockLog[] = data.logs;
                setLockLogList(logs);
                setTotalPages(Math.ceil(count / limit));
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
            }
        }

        fetchLogs();
    }, [currentPage]);


    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div>
            {!loading ? (
                <div className="table-container">
                    <table className="w-full text-center pr-4 default-table">
                        <thead className="border-b-2">
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>IP</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lockLogList.map((log: LockLog, index: number) => {
                                const parsedTime: number = parseInt(log.timestamp) * 1000;
                                const formattedTime = formatEpochTime(new Date(parsedTime));
                                return (
                                    <tr className="border-b-2 border-x-2" key={index}>
                                        <td className="border-x-2" >{formattedTime.date}</td>
                                        <td className="border-x-2" >{formattedTime.time}</td>
                                        <td className="border-x-2" >{log.ip}</td>
                                        <td className="border-x-2">{log.status}</td>
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
            ) : (
                <Loading />
            )}
        </div>
    );
};


// Should be moved to cleanup this file
export function UserTableItem() {
    const [userList, setUserList] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit: number = PAGINATION_LIMIT;

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            try {
                const offset = (currentPage - 1) * limit;
                const res = await fetch(`http://${SERVER_IP}:${PORT}/users?offset=${offset}&limit=${limit}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await res.json();
                const users: User[] = data.users || [];
                setUserList(users);
                setTotalPages(Math.ceil(data.totalItems / limit));
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        }

        fetchUsers();
    }, [currentPage]);

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    if (loading) return <Loading />;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex flex-col mt-1 rounded-md shadow-md">
            <div className="w-full inline text-center pb-1 bg-red-600 text-white tracking-tight font-semibold text-[2.5rem] lg:text-4xl text-transparent rounded-md">
                Users
            </div>
            {!loading ? (
                <div className="table-container">
                    <table className="w-full text-center pr-4 default-table">
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
                    <div className="flex justify-center ">
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
            ) : (
                <Loading />
            )}
        </div>
    );
}



// Should be moved to cleanup this file
export function LockTableItem() {
    const [lockList, setLockList] = useState<Lock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ip, setIp] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit: number = PAGINATION_LIMIT;


    useEffect(() => {
        async function fetchLocks() {
            setLoading(true);
            try {
                const offset = (currentPage - 1) * limit;
                const res = await fetch(`http://${SERVER_IP}:${PORT}/locks?offset=${offset}&limit=${limit}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await res.json();
                const locks: Lock[] = data.locks || [];
                setLockList(locks);
                setTotalPages(Math.ceil(data.totalItems / limit));
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        }

        fetchLocks();
    }, [currentPage]);


    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };


    async function OpenClose(mode: string, id: number) {
        const res = await fetch(`http://${SERVER_IP}:${PORT}/admin/${mode}/${id}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
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


    return (
        <div className="flex flex-col mt-1 rounded-md shadow-md" >
            <div className="w-full flex flex-row rounded-md bg-red-600 items-center text-white tracking-tight font-semibold text-[2.5rem] lg:text-4xl text-transparent">
                <div className="flex-grow text-center">
                    Locks
                </div>
                <div className="rounded-md rounded-l-none rounded-r-sm flex flex-col items-center bg-white border-0 border-secondary-border border-l-1">
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
            <div className="table-container">
                <table className="text-center pr-4  default-table">
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
        </div >
    );
}