import React from 'react';
import { ExternalLink, Share2, Download, MapPin, Link2, Calendar, Sparkles } from 'lucide-react';

export const ProfileHeader = ({ userData, persona, onShare, onSave, cardRef }) => {
    if (!userData) return null;

    return (
        <div ref={cardRef} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            {/* Subtle Gradient Glow in Corner */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start text-center lg:text-left">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="relative p-1 bg-gradient-to-tr from-[#30363d] to-[#484f58] rounded-full">
                            <img
                                src={userData.avatar_url}
                                alt={userData.login}
                                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#161b22] shadow-2xl object-cover"
                            />
                        </div>
                    </div>

                    {/* User Info Container */}
                    <div className="flex-1 min-w-0 w-full space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                            <div className="space-y-2">
                                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                                    {userData.name || userData.login}
                                </h2>
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                                    <a
                                        href={userData.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#8b949e] hover:text-[#58a6ff] inline-flex items-center gap-1.5 text-lg font-medium transition-colors"
                                    >
                                        @{userData.login} <ExternalLink size={16} />
                                    </a>
                                    
                                    {persona && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 font-bold text-[10px] uppercase tracking-widest shadow-sm">
                                            <Sparkles size={12} className="text-blue-400/80 animate-pulse" />
                                            {persona.title}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2.5 items-center justify-center sm:justify-end flex-wrap">
                                <button
                                    onClick={onShare}
                                    className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg transition-all flex items-center gap-2 text-sm text-[#c9d1d9] font-bold shadow-sm"
                                >
                                    <Share2 size={16} />
                                    <span>Share</span>
                                </button>
                                <button
                                    onClick={onSave}
                                    className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg transition-all flex items-center gap-2 text-sm text-[#c9d1d9] font-bold shadow-sm"
                                >
                                    <Download size={16} />
                                    <span>Download</span>
                                </button>
                            </div>
                        </div>

                        {/* Bio & AI Insight */}
                        <div className="space-y-4">
                            {userData.bio && (
                                <p className="text-[#c9d1d9] text-base leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                                    {userData.bio}
                                </p>
                            )}
                            
                            {persona && (
                                <div className="inline-flex items-start gap-3 p-3.5 bg-blue-500/5 border border-blue-500/10 rounded-xl max-w-2xl animate-in fade-in slide-in-from-left-4 duration-700">
                                    <Sparkles size={16} className="mt-1 flex-shrink-0 text-blue-400/70" />
                                    <p className="text-[#58a6ff] text-sm font-medium leading-relaxed italic">
                                        AI Persona Insight: {persona.bio}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Meta Info Grid */}
                        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#8b949e] font-medium justify-center lg:justify-start pt-2">
                            {userData.location && (
                                <div className="flex items-center gap-2 shrink-0">
                                    <MapPin size={16} className="text-[#484f58]" />
                                    <span>{userData.location}</span>
                                </div>
                            )}
                            {userData.blog && (
                                <a
                                    href={userData.blog.startsWith('http') ? userData.blog : `https://${userData.blog}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 hover:text-[#58a6ff] transition-colors shrink-0 max-w-[240px]"
                                >
                                    <Link2 size={16} className="text-[#484f58]" />
                                    <span className="truncate">{userData.blog}</span>
                                </a>
                            )}
                            {userData.created_at && (
                                <div className="flex items-center gap-2 shrink-0">
                                    <Calendar size={16} className="text-[#484f58]" />
                                    <span>Joined {new Date(userData.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                            )}
                        </div>

                        {/* Profiles Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                            {[
                                { label: 'Followers', value: userData.followers },
                                { label: 'Following', value: userData.following },
                                { label: 'Repositories', value: userData.public_repos },
                                { label: 'Gists', value: userData.public_gists }
                            ].map((stat) => (
                                <div key={stat.label} className="bg-[#0d1117]/80 backdrop-blur-sm border border-[#30363d] rounded-xl p-3.5 text-center transition-all hover:border-[#8b949e] hover:bg-[#0d1117] group">
                                    <div className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#58a6ff] transition-colors">{stat.value}</div>
                                    <div className="text-[10px] text-[#8b949e] mt-0.5 font-bold uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
