'use client'

import React from 'react';

const Loading = () => {
    return (
        <div className="flex-grow flex items-center justify-center h-screen">
            <div className="w-8 h-8 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );
};


export default Loading;