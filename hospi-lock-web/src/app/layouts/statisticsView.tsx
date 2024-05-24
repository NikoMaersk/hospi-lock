'use client'

import { useState, useEffect } from "react";
import { formatEpochTime } from "../helper/formatTime";

async function getLogs(): Promise<Log[]> {
    const res = await fetch('http://localhost:4000/logs');
    if (!res.ok) {
        throw new Error('Failed to fetch logs');
    }
    return res.json();
}


interface Log {
    timestamp: string,
    email: string,
    ip: string,
    success: boolean,
}

export default function StatisticsView() {
    const [logList, setLogList] = useState<Log[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLogs() {
            try {
                const logs = await getLogs();
                setLogList(logs);
            } catch (err: any) {
                setError(err.message);
            }
        }
        fetchLogs();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
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
                            <tr className="border-b-2" key={index}>
                                <td>{formattedTime.date}</td>
                                <td>{formattedTime.time}</td>
                                <td>{log.email}</td>
                                <td>{log.ip}</td>
                                <td>{log.success ? 'Yes' : 'No'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}