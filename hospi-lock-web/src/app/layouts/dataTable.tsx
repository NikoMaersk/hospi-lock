'use client'

import { useState, useEffect } from "react";
import { formatEpochTime } from "../helper/formatTime";

async function getLogs(): Promise<Log[]> {
    const res = await fetch('http://localhost:4000/logs/signin', {
        method: 'GET',
        credentials: 'include',
    });
    if (!res.ok) {
        throw new Error('Failed to fetch logs');
    }
    return res.json();
}


async function getUsers(): Promise<User[]> {
    const res = await fetch('http//localhost:4000/users');
    if (!res.ok) {
        throw new Error('Failed to fetch users');
    }
    return res.json();
}


async function getLocks(): Promise<Lock[]> {
    const res = await fetch('http://localhost:4000/locks');
    if (!res.ok) {
        throw new Error('Failed to fetch locks');
    }
    return res.json();
}


interface Log {
    timestamp: string,
    email: string,
    ip: string,
    success: boolean,
}


interface User {
    email: string,
    firstName: string,
    lastName: string,
    registrationDate: string,
    lockId: string
}


interface Lock {
    id: number,
    ip: string,
    status: number
}


export default function DataTable({ }) {
    return (
        <div>
            <LogTableItem></LogTableItem>
        </div>
    );
}


export function LogTableItem() {
    const [logList, setLogList] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLogs() {
            try {
                const logs = await getLogs();
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
                const user = await getUsers();
                setLoading(false);
                setUserList(user);
            } catch (err: any) {
                setLoading(false);
                setError(err.message);
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
                    <th>Registration date</th>
                    <th>Registered lock</th>
                </tr>
            </thead>
            <tbody>
                {userList.map((user: User, index: number) => {
                    return (
                        <tr className="border-b-2" key={index}>
                            <td>{user.email}</td>
                            <td>{user.firstName}</td>
                            <td>{user.lastName}</td>
                            <td>{user.registrationDate}</td>
                            <td>{user.lockId}</td>
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

    useEffect(() => {
        async function fetchLocks() {
            try {
                const lock = await getLocks();
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
        <table className="w-full text-center mt-4 pr-4">
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
    );
}