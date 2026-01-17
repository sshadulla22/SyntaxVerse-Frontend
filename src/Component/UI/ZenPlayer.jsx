import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Waves, Wind, Zap } from "lucide-react";

const ZenPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [error, setError] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.loop = true;

        const handleEnded = () => setIsPlaying(false);
        const handleError = () => {
            console.error("Audio playback error");
            setError(true);
            setIsPlaying(false);
        };

        audioRef.current.addEventListener('ended', handleEnded);
        audioRef.current.addEventListener('error', handleError);

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.removeEventListener('ended', handleEnded);
                audioRef.current.removeEventListener('error', handleError);
            }
        };
    }, []);

    const tracks = [
        {
            id: 'nebula',
            name: 'Deep Nebula',
            icon: Waves,
            url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112762.mp3',
            color: 'text-purple-400'
        },
        {
            id: 'solar',
            name: 'Solar Wind',
            icon: Wind,
            url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_1c37b98763.mp3?filename=please-calm-my-mind-126270.mp3',
            color: 'text-orange-400'
        },
        {
            id: 'void',
            name: 'Cosmic Void',
            icon: Zap,
            url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=mantra-1111-131449.mp3',
            color: 'text-blue-400'
        }
    ];

    const togglePlay = async (track) => {
        setError(false);
        const audio = audioRef.current;

        try {
            if (currentTrack?.id === track.id) {
                if (isPlaying) {
                    audio.pause();
                    setIsPlaying(false);
                } else {
                    await audio.play();
                    setIsPlaying(true);
                }
            } else {
                audio.src = track.url;
                await audio.play();
                setCurrentTrack(track);
                setIsPlaying(true);
            }
        } catch (err) {
            console.error("Playback failed:", err);
            setError(true);
            setIsPlaying(false);
        }
    };

    return (
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-1 mr-2 border-r border-white/10 pr-2">
                {tracks.map((track) => {
                    const Icon = track.icon;
                    const isActive = currentTrack?.id === track.id;
                    return (
                        <button
                            key={track.id}
                            onClick={() => togglePlay(track)}
                            className={`p-1.5 rounded-lg transition-all duration-300 ${isActive
                                ? `bg-white/10 ${track.color} scale-110 shadow-lg shadow-current/20`
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                }`}
                            title={track.name}
                        >
                            <Icon size={14} className={isActive && isPlaying ? 'animate-pulse' : ''} />
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center gap-2">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                        {error ? <span className="text-red-500">Error</span> : 'Ambient'}
                    </span>
                    <span className="text-[10px] font-bold text-white truncate w-20">
                        {error ? 'Format/Net' : (currentTrack ? currentTrack.name : 'Silence')}
                    </span>
                </div>
                {isPlaying && !error && (
                    <div className="flex items-end gap-0.5 h-3">
                        <div className="w-0.5 bg-blue-500 animate-[bounce_1s_infinite]"></div>
                        <div className="w-0.5 bg-blue-500 animate-[bounce_0.7s_infinite]"></div>
                        <div className="w-0.5 bg-blue-500 animate-[bounce_1.2s_infinite]"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ZenPlayer;
