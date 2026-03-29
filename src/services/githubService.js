const BASE_URL = 'https://api.github.com';
const CONTRIBUTIONS_API = 'https://github-contributions-api.deno.dev';

/**
 * Fetch data from GitHub API with optional headers.
 */
async function githubFetch(endpoint, options = {}) {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        ...(options.headers || {}),
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 403) {
            throw new Error('GitHub API rate limit exceeded. Please try again later.');
        }
        if (response.status === 404) {
            throw new Error('User not found');
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Fetch contribution data from external API.
 */
async function fetchContributionData(username) {
    try {
        const response = await fetch(`${CONTRIBUTIONS_API}/${username}.json`);
        if (!response.ok) throw new Error('Failed to fetch contribution data');
        const data = await response.json();
        
        // Flatten all weeks into a single array of days
        const days = data.contributions.flat();
        
        return {
            totalContributions: data.totalContributions,
            days: days
        };
    } catch (e) {
        console.error('Contribution API error:', e);
        return null;
    }
}

/**
 * Calculate streak and activity from contribution days.
 */
function calculateStreaksFromDays(days) {
    if (!days || days.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const sortedDays = [...days].sort((a, b) => new Date(b.date) - new Date(a.date));
    const contributingDays = sortedDays.filter(day => day.contributionCount > 0);
    if (contributingDays.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentStreak = 0;
    if (contributingDays[0].date === today || contributingDays[0].date === yesterday) {
        currentStreak = 1;
        for (let i = 0; i < contributingDays.length - 1; i++) {
            const curr = new Date(contributingDays[i].date);
            const next = new Date(contributingDays[i + 1].date);
            const diff = (curr - next) / (1000 * 60 * 60 * 24);
            if (diff <= 1) currentStreak++;
            else break;
        }
    }

    let longestStreak = 0;
    let tempStreak = 1;
    for (let i = 0; i < contributingDays.length - 1; i++) {
        const curr = new Date(contributingDays[i].date);
        const next = new Date(contributingDays[i + 1].date);
        const diff = (curr - next) / (1000 * 60 * 60 * 24);
        if (diff <= 1) {
            tempStreak++;
        } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
}

/**
 * Fetch all repositories for a user handling pagination.
 */
async function fetchAllRepos(username) {
    let allRepos = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 5) {
        const repos = await githubFetch(`/users/${username}/repos?per_page=100&page=${page}&sort=updated`);
        if (repos.length === 0) {
            hasMore = false;
        } else {
            allRepos = [...allRepos, ...repos];
            if (repos.length < 100) hasMore = false;
            else page++;
        }
    }
    return allRepos;
}

/**
 * Generate an AI-like developer persona based on stats.
 */
function generatePersona(languages, repos) {
    if (!languages || languages.length === 0) return { title: 'New Explorer', bio: 'Just starting their GitHub journey.' };

    const topLang = languages[0][0];
    const secondaryLang = languages[1]?.[0];
    
    const allTopics = repos.flatMap(r => r.topics || []);
    const isWeb = allTopics.some(t => ['web', 'react', 'vue', 'nextjs', 'frontend', 'html', 'css'].includes(t.toLowerCase())) || ['JavaScript', 'TypeScript', 'HTML', 'CSS'].includes(topLang);
    const isBackend = allTopics.some(t => ['backend', 'api', 'server', 'database', 'node', 'go', 'rust'].includes(t.toLowerCase())) || ['Go', 'Rust', 'Java', 'Python', 'PHP'].includes(topLang);
    const isData = allTopics.some(t => ['data', 'ml', 'ai', 'research', 'analysis', 'python'].includes(t.toLowerCase())) || (topLang === 'Python' && !isWeb);
    const isMobile = allTopics.some(t => ['ios', 'android', 'mobile', 'flutter', 'react-native'].includes(t.toLowerCase())) || ['Swift', 'Kotlin', 'Dart'].includes(topLang);

    let title = 'Software Explorer';
    let bio = `A passionate developer focusing on ${topLang}${secondaryLang ? ` and ${secondaryLang}` : ''}.`;

    if (isWeb && isBackend) {
        title = 'Full-Stack Architect';
        bio = 'Expertly bridging the gap between elegant frontends and robust scalable backends.';
    } else if (isWeb) {
        title = 'Frontend Visionary';
        bio = 'Creating immersive and highly responsive web experiences with modern frameworks.';
    } else if (isBackend) {
        title = 'Systems Engineer';
        bio = 'Building the backbone of modern applications with a focus on performance and reliability.';
    } else if (isData) {
        title = 'Intelligence Specialist';
        bio = 'Turning complex data into actionable insights and building the future of AI.';
    } else if (isMobile) {
        title = 'Mobile Innovator';
        bio = 'Crafting seamless experiences for users on the go, from iOS to Android.';
    }

    return { title, bio };
}

/**
 * Generate learning recommendations based on tech stack.
 */
function generateRecommendations(languages) {
    if (!languages || languages.length === 0) return [];

    const recommendations = {
        'JavaScript': {
            next: 'Next.js 14 & Server Components',
            reason: 'You have a strong JS foundation. Mastering SSR and Server Components will make you a top-tier modern web architect.',
            links: ['https://nextjs.org/docs']
        },
        'TypeScript': {
            next: 'Advanced Type-Safe API Design (tRPC)',
            reason: 'You already use types. Moving to full-stack type safety with tRPC will drastically speed up your development cycles.',
            links: ['https://trpc.io/docs']
        },
        'Python': {
            next: 'Rust for High-Performance Python',
            reason: 'For a Pythonista, learning Rust to write performance-critical modules (via PyO3) is a modern superpower.',
            links: ['https://pyo3.rs/']
        },
        'Go': {
            next: 'Cloud-Native Architecture (Kubernetes Operators)',
            reason: 'Go is the language of the cloud. Building custom K8s operators is the peak of Go cloud engineering.',
            links: ['https://sdk.operatorframework.io/']
        },
        'Java': {
            next: 'Native Compilation with GraalVM',
            reason: 'Mastering native images will allow you to build lightning-fast, resource-efficient microservices in Java.',
            links: ['https://www.graalvm.org/']
        },
        'Rust': {
            next: 'WebAssembly (Wasm) Systems',
            reason: 'Since you know Rust, bringing that performance to the browser via Wasm is a natural and powerful next step.',
            links: ['https://webassembly.org/']
        }
    };

    const result = [];
    // Get recommendations for top 2 languages
    languages.slice(0, 2).forEach(([lang]) => {
        if (recommendations[lang]) {
            result.push({ language: lang, ...recommendations[lang] });
        }
    });

    // Default recommendation if none match
    if (result.length === 0) {
        result.push({
            language: languages[0][0],
            next: 'Open Source Contribution',
            reason: 'The best way to level up in any language is by contributing to major projects in that ecosystem.',
            links: ['https://github.com/explore']
        });
    }

    return result;
}

/**
 * Calculate impact score and insights for a repo.
 */
function calculateRepoImpact(repo) {
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    const watchers = repo.watchers_count || 0;
    const issues = repo.open_issues_count || 0;
    
    // Impact score logic: Stars and Forks are weighted heavily
    const score = (stars * 10) + (forks * 25) + (watchers * 2);
    
    if (score === 0) return { score: 0, insight: 'Personal Project' };

    let insight = 'Growing Project';
    if (score > 2000) insight = 'High Impact';
    else if (stars > 500) insight = 'Popular';
    else if (forks > 100) insight = 'Community Driven';
    else if (issues < 5 && stars > 20) insight = 'Highly Maintained';
    else if (repo.description?.length > 150) insight = 'Well Documented';
    else if (new Date(repo.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) insight = 'Actively Updated';
    else if (repo.homepage) insight = 'Live Project';

    return { score, insight };
}

export const githubService = {
    async fetchFullUserData(username) {
        const [user, repos, contribData] = await Promise.all([
            githubFetch(`/users/${username}`),
            fetchAllRepos(username),
            fetchContributionData(username),
        ]);

        // Process repos with impact analysis
        const processedRepos = repos.map(repo => ({
            ...repo,
            impact: calculateRepoImpact(repo)
        }));

        const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        const totalForks = repos.reduce((acc, repo) => acc + repo.forks_count, 0);
        
        const languages = {};
        repos.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });

        const sortedLanguages = Object.entries(languages)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        let stats = {
            totalStars,
            totalForks,
            totalRepos: user.public_repos,
            languages: sortedLanguages,
            persona: generatePersona(sortedLanguages, repos),
            recommendations: generateRecommendations(sortedLanguages)
        };

        if (contribData) {
            const streaks = calculateStreaksFromDays(contribData.days);
            stats = {
                ...stats,
                totalContributions: contribData.totalContributions,
                currentStreak: streaks.currentStreak,
                longestStreak: streaks.longestStreak,
            };
        } else {
            stats = {
                ...stats,
                totalContributions: '---',
                currentStreak: 0,
                longestStreak: 0,
            };
        }

        return {
            user,
            repos: processedRepos.slice(0, 6),
            stats
        };
    }
};
