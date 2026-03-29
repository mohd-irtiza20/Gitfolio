import React from 'react';
import { Star, GitFork, BookOpen, Flame, Award, Hash } from 'lucide-react';

export const StatsGrid = ({ stats }) => {
    if (!stats) return null;

    const items = [
        { icon: Hash, value: stats.totalContributions || 0, label: 'Contributions', color: 'text-[#3fb950]' },
        { icon: Star, value: stats.totalStars, label: 'Stars', color: 'text-yellow-500' },
        { icon: GitFork, value: stats.totalForks, label: 'Forks', color: 'text-blue-500' },
        { icon: Flame, value: stats.currentStreak, label: 'Streak', color: 'text-[#ff7b72]' },
        { icon: Award, value: stats.longestStreak, label: 'Best', color: 'text-[#d2a8ff]' },
        { icon: BookOpen, value: stats.totalRepos, label: 'Repos', color: 'text-[#a5d6ff]' },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {items.map((item, index) => (
                <div 
                    key={index} 
                    className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-[#8b949e] transition-all group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <item.icon className={item.color} size={20} />
                    </div>
                    <div className="text-2xl font-bold text-white mb-0.5">{item.value}</div>
                    <div className="text-xs text-[#8b949e] font-bold uppercase tracking-widest">{item.label}</div>
                </div>
            ))}
        </div>
    );
};
