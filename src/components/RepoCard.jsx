import React from 'react';
import { BookOpen, Star, GitFork, Sparkles } from 'lucide-react';

const getLanguageColor = (lang) => {
    const colors = {
        JavaScript: '#f1e05a',
        TypeScript: '#3178c6',
        Python: '#3572A5',
        Java: '#b07219',
        Go: '#00ADD8',
        Rust: '#dea584',
        Ruby: '#701516',
        PHP: '#4F5D95',
        CSS: '#563d7c',
        HTML: '#e34c26',
        'C++': '#f34b7d',
        C: '#555555',
        'C#': '#178600',
        Swift: '#ffac45',
        Kotlin: '#A97BFF'
    };
    return colors[lang] || '#8b949e';
};

const getInsightStyles = (insight) => {
    switch (insight) {
        case 'High Impact':
            return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
        case 'Popular':
            return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
        case 'Growing Project':
            return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
        case 'Actively Updated':
            return 'bg-sky-500/10 border-sky-500/20 text-sky-400';
        case 'Live Project':
            return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
        case 'Highly Maintained':
            return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
        case 'Well Documented':
            return 'bg-[#30363d]/50 border-[#8b949e]/20 text-[#8b949e]';
        case 'Community Driven':
            return 'bg-pink-500/10 border-pink-500/20 text-pink-400';
        default:
            return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    }
};

export const RepoCard = ({ repo }) => {
    return (
        <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-[#8b949e] transition-all group flex flex-col relative overflow-hidden"
        >
            <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <BookOpen className="text-[#8b949e] group-hover:text-[#58a6ff] transition-colors flex-shrink-0" size={18} />
                        <h4 className="font-bold text-[#58a6ff] group-hover:underline text-sm sm:text-base truncate">
                            {repo.name}
                        </h4>
                    </div>
                    <div className="px-1.5 py-0.5 border border-[#30363d] rounded-md text-[9px] text-[#8b949e] font-bold uppercase tracking-wider flex-shrink-0 bg-[#0d1117]">
                        {repo.private ? 'Private' : 'Public'}
                    </div>
                </div>

                {/* AI Insight Badge */}
                {repo.impact && repo.impact.score > 0 && (
                    <div className={`flex items-center gap-1.5 w-fit px-2 py-0.5 border rounded-full text-[9px] font-extrabold uppercase tracking-widest shadow-sm ${getInsightStyles(repo.impact.insight)}`}>
                        <Sparkles size={10} className="opacity-80" />
                        {repo.impact.insight}
                    </div>
                )}
            </div>
            
            {repo.description ? (
                <p className="text-xs sm:text-sm text-[#8b949e] mb-4 line-clamp-2 leading-relaxed overflow-hidden">
                    {repo.description}
                </p>
            ) : null}
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#30363d]/50">
                <div className="flex items-center gap-4 text-[11px] text-[#8b949e] font-medium">
                    {repo.language && (
                        <span className="flex items-center gap-1.5">
                            <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: getLanguageColor(repo.language) }}
                            ></span>
                            <span>{repo.language}</span>
                        </span>
                    )}
                    <span className="flex items-center gap-1 group-hover:text-[#c9d1d9] transition-colors">
                        <Star size={13} className="text-yellow-500/70" />
                        {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1 group-hover:text-[#c9d1d9] transition-colors">
                        <GitFork size={13} className="text-blue-500/70" />
                        {repo.forks_count}
                    </span>
                </div>
            </div>
        </a>
    );
};
