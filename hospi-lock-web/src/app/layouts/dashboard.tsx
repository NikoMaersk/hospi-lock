'use client'

import Loading from "@/components/loading";
import React, { useState, useEffect } from "react";

const SERVER_IP = process.env.SERVER_IP || 'localhost';
const PORT = process.env.SERVER_PORT || '4000';

// should have dedicated endpointS to get count
export default function Dashboard() {
    const [userCount, setUserCount] = useState(0);
    const [lockCount, setLockCount] = useState(0);
    const [signInCount, setSignInCount] = useState(0);
    const [logCount, setLogCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLocksCount() {
            setLoading(true);
            try {
                const res = await fetch(`http://${SERVER_IP}:${PORT}/locks/stats/count`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await res.json();
                const count: number = data.totalItems || 0;
                setLockCount(count)
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        }

        fetchLocksCount();
    }, []);


    useEffect(() => {
        async function fetchUsersCount() {
            setLoading(true);
            try {
                const res = await fetch(`http://${SERVER_IP}:${PORT}/users/stats/count`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await res.json();
                const count: number = data.totalItems || 0;
                setUserCount(count)
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        }

        fetchUsersCount();
    }, []);


    useEffect(() => {
        async function fetchSigninCount() {
            setLoading(true);
            try {
                const res = await fetch(`http://${SERVER_IP}:${PORT}/logs/signin/stats/count`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await res.json();
                const count: number = data.totalItems || 0;
                setSignInCount(count)
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        }

        fetchSigninCount();
    }, []);


    useEffect(() => {
        async function fetchLogCount() {
            setLoading(true);
            try {
                const res = await fetch(`http://${SERVER_IP}:${PORT}/logs/lock/stats/count`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await res.json();
                const count: number = data.totalItems || 0;
                setLogCount(count)
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        }

        fetchLogCount();
    }, []);



    return (
        <div className="p-4 pt-1">
            <header className="bg-red-600 shadow p-6 mb-6 text-center rounded-lg">
                <h1 className="tracking-tight font-semibold from-white to-[#f9f9f9] text-3xl lg:text-5xl bg-clip-text text-transparent bg-gradient-to-b">
                    Dashboard
                </h1>
            </header>
            {!loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 p-4">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <h1 className="tracking-tight inline font-semibold from-red-400 to-red-600 text-[2.5rem] lg:text-4xl bg-clip-text text-transparent bg-gradient-to-b">
                            Registered Users
                        </h1>
                        <p className="text-2xl font-bold mt-2">{userCount}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <h1 className="tracking-tight inline font-semibold from-red-400 to-red-600 text-[2.5rem] lg:text-4xl bg-clip-text text-transparent bg-gradient-to-b">
                            Registered Locks
                        </h1>
                        <p className="text-2xl font-bold mt-2">{lockCount}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <h1 className="tracking-tight inline font-semibold from-red-400 to-red-600 text-[2.5rem] lg:text-4xl bg-clip-text text-transparent bg-gradient-to-b">
                            Number of User sign in
                        </h1>
                        <p className="text-2xl font-bold mt-2">{signInCount}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <h1 className="tracking-tight inline font-semibold from-red-400 to-red-600 text-[2.5rem] lg:text-4xl bg-clip-text text-transparent bg-gradient-to-b">
                            Number of lock/unlock
                        </h1>
                        <p className="text-2xl font-bold mt-2">{logCount}</p>
                    </div>
                </div>
            ) : (
                <Loading />
            )}
        </div>
    );
};