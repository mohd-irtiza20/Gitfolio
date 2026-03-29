import React, { useState, useRef } from 'react';
import { Search, Zap } from 'lucide-react';
import { githubService } from '../services/githubService';
import { ProfileHeader } from './ProfileHeader';
import { StatsGrid } from './StatsGrid';
import { RepoCard } from './RepoCard';
import { LanguageStats } from './LanguageStats';
import { RecommendationsCard } from './RecommendationsCard';
import { LoadingSkeleton } from './LoadingSkeleton';

export default function GitHubExplorer() {
    const [username, setUsername] = useState('');
    const [userData, setUserData] = useState(null);
    const [repos, setRepos] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const cardRef = useRef(null);

    const fetchUserData = async (author) => {
        if (!author.trim()) {
            setError('Please enter a username');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await githubService.fetchFullUserData(author);
            setUserData(data.user);
            setRepos(data.repos);
            setStats(data.stats);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message || 'Failed to fetch data. Please try again.');
            setUserData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUserData(username);
    };

    const downloadCard = async () => {
        if (!cardRef.current || !userData) return;

        try {
            const html2canvas = (await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')).default;
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#0d1117',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
                borderRadius: 12
            });

            const link = document.createElement('a');
            link.download = `${userData.login}-github-profile.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to download card. Please try again.');
        }
    };

    const shareCard = async () => {
        if (!userData) return;
        const shareData = {
            title: `${userData.name || userData.login}'s GitHub Profile`,
            text: `Check out ${userData.name || userData.login} on GitHub!`,
            url: userData.html_url
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                copyToClipboard(userData.html_url);
            }
        } else {
            copyToClipboard(userData.html_url);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Profile link copied to clipboard!');
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#c9d1d9] selection:bg-blue-500/30 selection:text-white font-sans">
            {/* Subtle background glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]"></div>
            </div>

            <main className="flex-grow w-full">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 pb-64">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <div className="flex flex-col items-center justify-center gap-4 mb-8">
                            <div className="p-1 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full shadow-2xl transform active:scale-95 transition-transform">
                                <div className="bg-[#0d1117] p-4 rounded-full">
                                    <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </div>
                            </div>
                            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
                                Gitfolio
                            </h1>
                            <p className="text-[#8b949e] text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                                A professional, data-driven dashboard for your GitHub performance.
                            </p>
                        </div>

                        <form onSubmit={handleSearch} className="max-w-xl mx-auto px-4 relative group">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Username (e.g. torvalds)"
                                    className="w-full pl-6 pr-32 py-4 bg-[#161b22] border border-[#30363d] rounded-full text-white placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all font-medium text-lg shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="absolute right-2.5 px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-full transition-all disabled:opacity-50 flex items-center gap-2 font-bold shadow-lg"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Search size={18} />
                                            <span>Explore</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {error && (
                            <div className="mt-8 flex justify-center">
                                <div className="px-6 py-3 bg-red-900/20 border border-red-500/50 rounded-full text-[#ff7b72] font-semibold flex items-center gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    {error}
                                </div>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <LoadingSkeleton />
                    ) : userData ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
                            <ProfileHeader 
                                userData={userData} 
                                persona={stats?.persona}
                                onShare={shareCard} 
                                onSave={downloadCard} 
                                cardRef={cardRef}
                            />
                            
                            <StatsGrid stats={stats} />

                            <div className="grid lg:grid-cols-3 gap-8 items-start">
                                <div className="lg:col-span-1 space-y-8">
                                    <LanguageStats 
                                        languages={stats.languages} 
                                        totalRepos={stats.totalRepos} 
                                    />
                                    <RecommendationsCard recommendations={stats.recommendations} />
                                </div>
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                                            <Zap className="text-[#a5d6ff]" size={20} />
                                            Recent Repositories
                                        </h3>
                                        <a 
                                            href={`https://github.com/${userData.login}?tab=repositories`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#58a6ff] hover:underline font-semibold text-sm"
                                        >
                                            View all profile
                                        </a>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {repos.map(repo => (
                                            <RepoCard key={repo.id} repo={repo} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </main>

                {/* Flat, Block-level Footer */}
                <div className="w-full bg-[#0d1117] py-24 mb-10 border-t border-[#30363d]">
                    <footer className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-[#8b949e] text-sm gap-8 text-center md:text-left">
                        <div className="flex flex-col gap-2">
                            <p className="font-bold text-white text-2xl tracking-tight">
                                Git<span className="text-[#58a6ff]">folio</span>
                            </p>
                            <p className="text-xs opacity-70">
                                © {new Date().getFullYear()} • Handcrafted by <span className="text-[#58a6ff] font-bold">Mohd Irtiza</span>
                            </p>
                        </div>
                        <div className="flex gap-10 font-bold uppercase tracking-[0.2em] text-[10px]">
                            {['LinkedIn', 'GitHub', 'Twitter'].map(social => (
                                <a 
                                    key={social}
                                    href={`https://${social.toLowerCase()}.com`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#58a6ff] transition-all duration-300 hover:scale-110"
                                >
                                    {social}
                                </a>
                            ))}
                        </div>
                    </footer>
                </div>
        </div>
    );
}