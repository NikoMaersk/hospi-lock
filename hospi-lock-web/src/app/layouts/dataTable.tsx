'use client'

import React, { useState, useEffect } from "react";
import { formatEpochTime } from "../helper/formatTime";

const SERVER_IP = process.env.SERVER_IP || 'localhost';
const PORT = process.env.SERVER_PORT || '4000';

async function getLogs(): Promise<Log[]> {

    const res = await fetch(`http://${SERVER_IP}:${PORT}/logs/signin`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!res.ok) {
        throw new Error('Failed to fetch logs');
    }
    return res.json();
}


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


async function getLocks(): Promise<Lock[]> {
    const res = await fetch(`http://${SERVER_IP}:${PORT}/logs/lock`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!res.ok) {
        throw new Error('Failed to fetch locks');
    }
    return res.json();
}


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
}


export function LogTableItem() {
    const [logList, setLogList] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLogs() {
            try {
                const logs: Log[] = await getLogs();
                setLoading(false);
                setLogList(logs);
            } catch (err: any) {
                setLoading(false);
                setError(err.message);
            }
        }
        fetchLogs();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;


    return (
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
    );
}


export function UserTableItem() {
    const [userList, setUserList] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
    );
}


export function LockTableItem() {
    const [lockList, setLockList] = useState<Lock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ip, setIp] = useState('');

    const handlePost = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const res = await fetch('http://localhost:4000/locks', {
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex flex-col gap-1 mt-4" >
            <div className="w-full flex flex-col flex-shrink-0 items-end justify-center">
                <label htmlFor="ip" className="">Register new lock</label>
                <form onSubmit={handlePost} className="flex">
                    <input id="IP" placeholder="eg. 10.176.69.22" type="input" required minLength={11} value={ip} onChange={(e) => setIp(e.target.value)}
                        className="text-sm w-[10rem] text-center h-10 py-2 outline-none 
                        border border-secondary-border rounded-l-md px-2 focus:border-red-600 hover:border-red-600" />
                    <button type="submit" className="rounded-r-md border border-secondary-border h-10 border-l-0 px-3 hover:bg-red-600 font-semibold hover:text-white text-sm">Register</button>
                </form>
            </div>
            <table className="text-center mt-2 pr-4">
                <thead className="border-b-2">
                    <tr>
                        <th>Lock ID</th>
                        <th>IP</th>
                        <th>Lock status</th>
                    </tr>
                </thead>
                <tbody>
                    {lockList.map((lock: Lock, index: number) => {
                        return (
                            <tr className="border-b-2" key={index}>
                                <td>{lock.id}</td>
                                <td>{lock.ip}</td>
                                <td>{lock.status}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}