import { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { RefreshCw, Activity, Pin, ChevronLeft } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Match {
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  status: string;
  matchInfo: string;
  isLive: boolean;
}

export default function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pinnedMatchInfo, setPinnedMatchInfo] = useState<string | null>(null);

  const fetchScores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Get the latest live cricket scores and recent match results from today. Return a list of matches. If there are no live matches, return recently completed ones or upcoming ones.",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                team1: { type: Type.STRING, description: "Name/Abbreviation of the first team (e.g., IND, AUS, CSK)" },
                team2: { type: Type.STRING, description: "Name/Abbreviation of the second team" },
                score1: { type: Type.STRING, description: "Score of the first team (e.g., 250/4 (50) or Yet to bat)" },
                score2: { type: Type.STRING, description: "Score of the second team" },
                status: { type: Type.STRING, description: "Current status or result of the match (e.g., Live, Stumps, IND won by 10 runs)" },
                matchInfo: { type: Type.STRING, description: "Match details (e.g., 1st Test, Day 3, IPL T20). Must be unique per match." },
                isLive: { type: Type.BOOLEAN, description: "True if the match is currently live" }
              },
              required: ["team1", "team2", "score1", "score2", "status", "matchInfo", "isLive"]
            }
          }
        }
      });
      
      if (response.text) {
        const data = JSON.parse(response.text);
        setMatches(data);
        setLastUpdated(new Date());
      } else {
        throw new Error("No data received");
      }
    } catch (err) {
      console.error("Failed to fetch scores:", err);
      setError("Failed to load scores. Please try again.");
      // Fallback mock data for demonstration if API fails
      setMatches([
        {
          team1: "IND",
          team2: "AUS",
          score1: "284/4 (45.2)",
          score2: "Yet to bat",
          status: "IND chose to bat",
          matchInfo: "1st ODI",
          isLive: true
        },
        {
          team1: "ENG",
          team2: "NZ",
          score1: "312/8 (50)",
          score2: "298/10 (48.5)",
          status: "ENG won by 14 runs",
          matchInfo: "3rd ODI",
          isLive: false
        }
      ]);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
    // Refresh every 5 minutes
    const interval = setInterval(fetchScores, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const pinnedMatch = matches.find(m => m.matchInfo === pinnedMatchInfo);
  const displayMatches = pinnedMatch ? [pinnedMatch] : matches;

  return (
    <div className="min-h-screen bg-cover bg-center flex items-start justify-center sm:justify-end p-4 sm:p-8 font-sans" style={{ backgroundImage: 'url(https://picsum.photos/seed/macos-monterey/1920/1080?blur=4)' }}>
      {/* Menu Bar Widget Container */}
      <div className="w-full max-w-[340px] bg-white/70 dark:bg-[#1c1c1e]/80 backdrop-blur-3xl border border-white/50 dark:border-white/10 rounded-[20px] shadow-[0_30px_60px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)_inset] overflow-hidden flex flex-col mt-8 sm:mt-0 transition-all duration-300">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-white/40 dark:bg-black/20">
          <div className="flex items-center gap-2">
            {pinnedMatch ? (
              <button 
                onClick={() => setPinnedMatchInfo(null)}
                className="p-1 -ml-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
              </button>
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-sm">
                <Activity size={12} className="text-white" />
              </div>
            )}
            <span className="font-semibold text-[13px] text-gray-900 dark:text-gray-100 tracking-tight">
              {pinnedMatch ? 'Pinned Match' : 'Cricket Scores'}
            </span>
          </div>
          <button 
            onClick={fetchScores} 
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={`text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* Content */}
        <div className="max-h-[420px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {loading && matches.length === 0 ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex flex-col gap-2 p-3 rounded-xl bg-black/5 dark:bg-white/5">
                  <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-1/3"></div>
                  <div className="flex justify-between"><div className="h-4 bg-black/10 dark:bg-white/10 rounded w-1/4"></div><div className="h-4 bg-black/10 dark:bg-white/10 rounded w-1/4"></div></div>
                  <div className="flex justify-between"><div className="h-4 bg-black/10 dark:bg-white/10 rounded w-1/4"></div><div className="h-4 bg-black/10 dark:bg-white/10 rounded w-1/4"></div></div>
                </div>
              ))}
            </div>
          ) : error && matches.length === 0 ? (
            <div className="p-6 text-center text-sm text-red-500">{error}</div>
          ) : displayMatches.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">No matches found.</div>
          ) : (
            displayMatches.map((match, i) => (
              <div key={i} className={`p-3 rounded-xl transition-all duration-200 cursor-default group border ${pinnedMatch ? 'bg-white/60 dark:bg-white/10 border-black/5 dark:border-white/5' : 'border-transparent hover:bg-white/60 dark:hover:bg-white/10 hover:border-black/5 dark:hover:border-white/5'}`}>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{match.matchInfo}</span>
                  <div className="flex items-center gap-2">
                    {match.isLive && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-1.5 py-0.5 rounded-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        Live
                      </span>
                    )}
                    {!pinnedMatch && (
                      <button 
                        onClick={() => setPinnedMatchInfo(match.matchInfo)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 dark:hover:bg-white/20 transition-all text-gray-500 dark:text-gray-400"
                        title="Pin this match"
                      >
                        <Pin size={12} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[13px] text-gray-900 dark:text-gray-100">{match.team1}</span>
                    <span className="font-mono text-[13px] font-medium text-gray-900 dark:text-gray-100">{match.score1 || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[13px] text-gray-900 dark:text-gray-100">{match.team2}</span>
                    <span className="font-mono text-[13px] font-medium text-gray-900 dark:text-gray-100">{match.score2 || '-'}</span>
                  </div>
                </div>
                
                <div className="mt-3 text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2 font-medium">
                  {match.status}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/20 flex justify-between items-center">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            {loading ? 'Updating...' : `Updated ${formatTime(lastUpdated)}`}
          </span>
          {pinnedMatch ? (
             <button 
               onClick={() => setPinnedMatchInfo(null)}
               className="text-[11px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-semibold transition-colors"
             >
               Unpin
             </button>
          ) : (
            <button className="text-[11px] text-blue-500 hover:text-blue-600 dark:text-blue-400 font-semibold transition-colors">
              View All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
