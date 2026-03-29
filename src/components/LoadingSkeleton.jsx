import React from 'react';

export const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-8">
        {/* Profile Header Skeleton */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 flex flex-col lg:row gap-8">
            <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start w-full">
                <div className="w-40 h-40 bg-[#0d1117] rounded-full flex-shrink-0 animate-pulse"></div>
                <div className="flex-1 space-y-4 w-full">
                    <div className="h-10 bg-[#0d1117] rounded-lg w-3/4 mx-auto lg:mx-0"></div>
                    <div className="h-6 bg-[#0d1117] rounded-lg w-1/4 mx-auto lg:mx-0"></div>
                    <div className="h-20 bg-[#0d1117] rounded-xl w-full"></div>
                    <div className="flex gap-4 justify-center lg:justify-start pt-4">
                        <div className="h-9 bg-[#0d1117] rounded-lg w-28"></div>
                        <div className="h-9 bg-[#0d1117] rounded-lg w-28"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Stats Strip Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-[#161b22] rounded-xl border border-[#30363d]"></div>
            ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 h-80 bg-[#161b22] rounded-xl border border-[#30363d]"></div>
            <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-[#161b22] rounded-lg w-48 mb-6"></div>
                <div className="grid md:grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-40 bg-[#161b22] rounded-xl border border-[#30363d]"></div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
