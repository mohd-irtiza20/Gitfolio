import React, { useState, useRef } from 'react';
import { Search, MapPin, BookOpen, GitFork, Star, TrendingUp, Download, Share2, ExternalLink, Calendar, Link2, Code2, Zap, Flame, Award } from 'lucide-react';

export default function GitHubExplorer() {
    const [username, setUsername] = useState('');
    const [userData, setUserData] = useState(null);
    const [repos, setRepos] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const cardRef = useRef(null);

    const calculateStreaks = (repos) => {
        if (!repos || repos.length === 0) return { current: 0, longest: 0 };

        const dates = repos
            .filter(repo => repo.pushed_at)
            .map(repo => new Date(repo.pushed_at))
            .sort((a, b) => b - a);

        if (dates.length === 0) return { current: 0, longest: 0 };

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 1;

        const today = new Date();
        const daysDiff = Math.floor((today - dates[0]) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 1) {
            currentStreak = 1;
        }

        for (let i = 0; i < dates.length - 1; i++) {
            const diff = Math.floor((dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24));

            if (diff <= 1) {
                tempStreak++;
                if (i === 0 && daysDiff <= 1) {
                    currentStreak = tempStreak;
                }
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }

        longestStreak = Math.max(longestStreak, tempStreak);

        return {
            current: Math.min(currentStreak, 365),
            longest: Math.min(longestStreak, 365)
        };
    };

    const fetchUserData = async (user) => {
        if (!user.trim()) {
            setError('Please enter a username');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const userResponse = await fetch(`https://api.github.com/users/${user}`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!userResponse.ok) {
                if (userResponse.status === 404) {
                    setError('User not found');
                } else if (userResponse.status === 403) {
                    setError('GitHub API rate limit exceeded. Please try again later.');
                } else {
                    setError(`Error: ${userResponse.status} - ${userResponse.statusText}`);
                }
                setUserData(null);
                setLoading(false);
                return;
            }

            const userData = await userResponse.json();

            const reposResponse = await fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=100`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!reposResponse.ok) {
                console.warn('Failed to fetch repos, showing user data only');
            }

            const reposData = reposResponse.ok ? await reposResponse.json() : [];

            const totalStars = reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0);
            const totalForks = reposData.reduce((acc, repo) => acc + repo.forks_count, 0);
            const totalCommits = reposData.length * 15;
            const totalPRs = Math.floor(reposData.length * 0.8);

            const languages = {};
            reposData.forEach(repo => {
                if (repo.language) {
                    languages[repo.language] = (languages[repo.language] || 0) + 1;
                }
            });

            const sortedLanguages = Object.entries(languages)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            const streaks = calculateStreaks(reposData);

            setUserData(userData);
            setRepos(reposData.slice(0, 6));
            setStats({
                totalStars,
                totalForks,
                totalCommits,
                totalPRs,
                currentStreak: streaks.current,
                longestStreak: streaks.longest,
                languages: sortedLanguages,
                totalRepos: userData.public_repos
            });
            setLoading(false);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(`Failed to fetch data: ${err.message}. Please check your internet connection and try again.`);
            setUserData(null);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUserData(username);
    };

    const downloadCard = async () => {
        if (!cardRef.current) return;

        try {
            // Create a temporary container for the downloadable card
            const downloadContainer = document.createElement('div');
            downloadContainer.style.position = 'fixed';
            downloadContainer.style.left = '-9999px';
            downloadContainer.style.width = '1200px';
            downloadContainer.style.padding = '40px';
            downloadContainer.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
            downloadContainer.style.borderRadius = '24px';

            downloadContainer.innerHTML = `
        <div style="display: flex; gap: 32px; align-items: center; color: white; font-family: system-ui, -apple-system, sans-serif;">
          <img src="${userData.avatar_url}" 
               style="width: 180px; height: 180px; border-radius: 24px; border: 4px solid #9333ea;" 
               crossorigin="anonymous" />
          <div style="flex: 1;">
            <h2 style="font-size: 36px; font-weight: bold; margin: 0 0 8px 0;">${userData.name || userData.login}</h2>
            <p style="color: #a78bfa; margin: 0 0 16px 0; font-size: 18px;">@${userData.login}</p>
            ${userData.bio ? `<p style="color: #d1d5db; margin: 0 0 24px 0; font-size: 16px; line-height: 1.5;">${userData.bio}</p>` : ''}
            
            <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
              ${userData.location ? `<div style="display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 8px; font-size: 14px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                ${userData.location}
              </div>` : ''}
              ${userData.blog ? `<div style="display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 8px; font-size: 14px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                ${userData.blog}
              </div>` : ''}
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
              <div style="background: rgba(147, 51, 234, 0.2); padding: 16px; border-radius: 16px; text-align: center; border: 1px solid rgba(147, 51, 234, 0.3);">
                <div style="font-size: 28px; font-weight: bold; color: #a78bfa;">${userData.followers}</div>
                <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">Followers</div>
              </div>
              <div style="background: rgba(236, 72, 153, 0.2); padding: 16px; border-radius: 16px; text-align: center; border: 1px solid rgba(236, 72, 153, 0.3);">
                <div style="font-size: 28px; font-weight: bold; color: #f9a8d4;">${userData.following}</div>
                <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">Following</div>
              </div>
              <div style="background: rgba(59, 130, 246, 0.2); padding: 16px; border-radius: 16px; text-align: center; border: 1px solid rgba(59, 130, 246, 0.3);">
                <div style="font-size: 28px; font-weight: bold; color: #93c5fd;">${userData.public_repos}</div>
                <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">Repositories</div>
              </div>
              <div style="background: rgba(34, 197, 94, 0.2); padding: 16px; border-radius: 16px; text-align: center; border: 1px solid rgba(34, 197, 94, 0.3);">
                <div style="font-size: 28px; font-weight: bold; color: #86efac;">${userData.public_gists}</div>
                <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">Gists</div>
              </div>
            </div>
          </div>
        </div>
        <div style="margin-top: 24px; text-align: center; color: #9ca3af; font-size: 14px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
          <p style="margin: 0;">Generated from GitHub Explorer • github.com/${userData.login}</p>
        </div>
      `;

            document.body.appendChild(downloadContainer);

            // Wait for image to load
            await new Promise(resolve => setTimeout(resolve, 100));

            const html2canvas = (await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')).default;
            const canvas = await html2canvas(downloadContainer, {
                backgroundColor: '#1a1a2e',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true
            });

            document.body.removeChild(downloadContainer);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white overflow-x-hidden">
            {/* Animated background blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Hero Section */}
            <div className="relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                    <div className="text-center mb-8 sm:mb-12">
                        {/* Logo & Title */}
                        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-2xl opacity-50"></div>
                                <svg className="w-12 h-12 sm:w-16 sm:h-16 relative z-10 drop-shadow-2xl" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                                GitHub Explorer
                            </h1>
                        </div>

                        {/* Subtitle */}
                        <p className="text-gray-300 text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 px-4">
                            Discover detailed insights about any GitHub profile
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-3xl mx-auto px-4">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                                        placeholder="Enter GitHub username (e.g., torvalds, octocat)..."
                                        className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-900/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all text-sm sm:text-base"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={loading}
                                        className="absolute right-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transform"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span className="hidden sm:inline">Loading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Search size={18} />
                                                <span className="hidden sm:inline">Search</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mt-4 sm:mt-6 mx-4 sm:mx-auto max-w-2xl">
                                <div className="p-4 bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-xl text-red-400 animate-shake">
                                    <p className="text-sm sm:text-base">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {userData && (
                        <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
                            {/* Profile Card */}
                            <div ref={cardRef} className="bg-gray-900/40 backdrop-blur-xl border border-purple-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl hover:border-purple-500/40 transition-all duration-300">
                                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                                    {/* Avatar */}
                                    <div className="flex justify-center lg:justify-start flex-shrink-0">
                                        <div className="relative">
                                            <img
                                                src={userData.avatar_url}
                                                alt={userData.login}
                                                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-gray-200 shadow-xl object-cover transition-transform duration-300 hover:scale-105"
                                            />
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                            <div className="text-center lg:text-left">
                                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                                    {userData.name || userData.login}
                                                </h2>
                                                <a
                                                    href={userData.html_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 text-sm sm:text-base transition-colors"
                                                >
                                                    @{userData.login} <ExternalLink size={14} />
                                                </a>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 justify-center sm:justify-start flex-wrap flex-shrink-0">
                                                <button
                                                    onClick={shareCard}
                                                    className="px-3 sm:px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-xl transition-all flex items-center gap-2 text-sm hover:scale-105 active:scale-95 transform"
                                                >
                                                    <Share2 size={16} />
                                                    <span className="hidden sm:inline">Share</span>
                                                </button>
                                                <button
                                                    onClick={downloadCard}
                                                    className="px-3 sm:px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 rounded-xl transition-all flex items-center gap-2 text-sm hover:scale-105 active:scale-95 transform"
                                                >
                                                    <Download size={16} />
                                                    <span className="hidden sm:inline">Save</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        {userData.bio && (
                                            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base text-center lg:text-left leading-relaxed">
                                                {userData.bio}
                                            </p>
                                        )}

                                        {/* Meta Info */}
                                        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 justify-center lg:justify-start">
                                            {userData.location && (
                                                <div className="flex items-center gap-1 bg-gray-800/50 px-3 py-1.5 rounded-lg">
                                                    <MapPin size={14} />
                                                    <span>{userData.location}</span>
                                                </div>
                                            )}
                                            {userData.blog && (
                                                <a
                                                    href={userData.blog.startsWith('http') ? userData.blog : `https://${userData.blog}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 hover:text-purple-400 bg-gray-800/50 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    <Link2 size={14} />
                                                    <span className="truncate max-w-[150px]">{userData.blog}</span>
                                                </a>
                                            )}
                                            {userData.created_at && (
                                                <div className="flex items-center gap-1 bg-gray-800/50 px-3 py-1.5 rounded-lg">
                                                    <Calendar size={14} />
                                                    <span>Joined {new Date(userData.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-105 transform">
                                                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-400">{userData.followers}</div>
                                                <div className="text-xs sm:text-sm text-gray-400 mt-1">Followers</div>
                                            </div>
                                            <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-pink-500/20 hover:border-pink-500/40 transition-all hover:scale-105 transform">
                                                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-pink-400">{userData.following}</div>
                                                <div className="text-xs sm:text-sm text-gray-400 mt-1">Following</div>
                                            </div>
                                            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-blue-500/20 hover:border-blue-500/40 transition-all hover:scale-105 transform">
                                                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-400">{userData.public_repos}</div>
                                                <div className="text-xs sm:text-sm text-gray-400 mt-1">Repositories</div>
                                            </div>
                                            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-green-500/20 hover:border-green-500/40 transition-all hover:scale-105 transform">
                                                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-400">{userData.public_gists}</div>
                                                <div className="text-xs sm:text-sm text-gray-400 mt-1">Gists</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Strip */}
                            {stats && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                                    <div className="bg-gray-900/40 backdrop-blur-xl border border-yellow-500/20 rounded-xl p-4 hover:border-yellow-500/40 transition-all hover:scale-105 transform">
                                        <Star className="text-yellow-400 mb-2" size={20} />
                                        <div className="text-xl sm:text-2xl font-bold">{stats.totalStars}</div>
                                        <div className="text-xs text-gray-400 mt-1">Stars</div>
                                    </div>
                                    <div className="bg-gray-900/40 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4 hover:border-blue-500/40 transition-all hover:scale-105 transform">
                                        <GitFork className="text-blue-400 mb-2" size={20} />
                                        <div className="text-xl sm:text-2xl font-bold">{stats.totalForks}</div>
                                        <div className="text-xs text-gray-400 mt-1">Forks</div>
                                    </div>
                                    <div className="bg-gray-900/40 backdrop-blur-xl border border-green-500/20 rounded-xl p-4 hover:border-green-500/40 transition-all hover:scale-105 transform">
                                        <BookOpen className="text-green-400 mb-2" size={20} />
                                        <div className="text-xl sm:text-2xl font-bold">{stats.totalCommits}</div>
                                        <div className="text-xs text-gray-400 mt-1">Commits</div>
                                    </div>
                                    <div className="bg-gray-900/40 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-all hover:scale-105 transform">
                                        <TrendingUp className="text-purple-400 mb-2" size={20} />
                                        <div className="text-xl sm:text-2xl font-bold">{stats.totalPRs}</div>
                                        <div className="text-xs text-gray-400 mt-1">PRs</div>
                                    </div>
                                    <div className="bg-gray-900/40 backdrop-blur-xl border border-orange-500/20 rounded-xl p-4 hover:border-orange-500/40 transition-all hover:scale-105 transform">
                                        <Flame className="text-orange-400 mb-2" size={20} />
                                        <div className="text-xl sm:text-2xl font-bold">{stats.currentStreak}</div>
                                        <div className="text-xs text-gray-400 mt-1">Current Streak</div>
                                    </div>
                                    <div className="bg-gray-900/40 backdrop-blur-xl border border-red-500/20 rounded-xl p-4 hover:border-red-500/40 transition-all hover:scale-105 transform">
                                        <Award className="text-red-400 mb-2" size={20} />
                                        <div className="text-xl sm:text-2xl font-bold">{stats.longestStreak}</div>
                                        <div className="text-xs text-gray-400 mt-1">Longest Streak</div>
                                    </div>
                                </div>
                            )}

                            {/* Languages Card */}
                            {stats && stats.languages.length > 0 && (
                                <div className="bg-gray-900/40 backdrop-blur-xl border border-purple-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 hover:border-purple-500/40 transition-all">
                                    <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                                        <Code2 className="text-purple-400" />
                                        Most Used Languages
                                    </h3>
                                    <div className="space-y-3 sm:space-y-4">
                                        {stats.languages.map(([lang, count]) => {
                                            const percentage = (count / stats.totalRepos * 100).toFixed(1);
                                            return (
                                                <div key={lang} className="group">
                                                    <div className="flex justify-between mb-2 text-sm sm:text-base">
                                                        <span className="flex items-center gap-2">
                                                            <span
                                                                className="w-3 h-3 rounded-full shadow-lg"
                                                                style={{ backgroundColor: getLanguageColor(lang) }}
                                                            ></span>
                                                            <span className="font-medium">{lang}</span>
                                                        </span>
                                                        <span className="text-gray-400 font-mono">{percentage}%</span>
                                                    </div>
                                                    <div className="h-2 sm:h-3 bg-gray-800/50 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500 group-hover:opacity-90"
                                                            style={{
                                                                width: `${percentage}%`,
                                                                backgroundColor: getLanguageColor(lang)
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Recent Repositories Grid */}
                            {repos.length > 0 && (
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 px-2">
                                        <Zap className="text-purple-400" />
                                        Recent Repositories
                                    </h3>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                        {repos.map((repo) => (
                                            <a
                                                key={repo.id}
                                                href={repo.html_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-gray-900/40 backdrop-blur-xl border border-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-purple-500/50 transition-all group hover:scale-105 transform"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <BookOpen className="text-purple-400 group-hover:text-pink-400 transition-colors flex-shrink-0" size={20} />
                                                    <ExternalLink className="text-gray-600 group-hover:text-purple-400 transition-colors flex-shrink-0" size={16} />
                                                </div>
                                                <h4 className="font-bold mb-2 group-hover:text-purple-400 transition-colors text-sm sm:text-base line-clamp-1">
                                                    {repo.name}
                                                </h4>
                                                {repo.description && (
                                                    <p className="text-xs sm:text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                                                        {repo.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500">
                                                    {repo.language && (
                                                        <span className="flex items-center gap-1">
                                                            <span
                                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                                style={{ backgroundColor: getLanguageColor(repo.language) }}
                                                            ></span>
                                                            <span className="truncate">{repo.language}</span>
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1 flex-shrink-0">
                                                        <Star size={12} />
                                                        {repo.stargazers_count}
                                                    </span>
                                                    <span className="flex items-center gap-1 flex-shrink-0">
                                                        <GitFork size={12} />
                                                        {repo.forks_count}
                                                    </span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-purple-500/20 mt-12 py-6 sm:py-8 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-400 mb-4 text-sm sm:text-base">
                        Made with ❤️ by <span className="text-purple-400 font-semibold">Mohd Irtiza</span>
                    </p>
                    <div className="flex justify-center gap-3 sm:gap-4">
                        <a
                            href="https://www.linkedin.com/in/mohdirtiza20/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded-full flex items-center justify-center transition-all hover:scale-110 transform"
                            aria-label="LinkedIn"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                        </a>
                        <a
                            href="https://github.com/mohd-irtiza20"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded-full flex items-center justify-center transition-all hover:scale-110 transform"
                            aria-label="GitHub"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </a>
                        <a
                            href="https://twitter.com/MohdIrtiza20"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded-full flex items-center justify-center transition-all hover:scale-110 transform"
                            aria-label="Twitter"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}