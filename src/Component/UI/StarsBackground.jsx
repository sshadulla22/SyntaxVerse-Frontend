import React, { useMemo } from 'react';
import './StarsBackground.css';

const StarsBackground = () => {
    const generateStars = (count) => {
        let stars = "";
        const colors = ["#ffffff", "#4400ff", "#ff0000", "#7000ff", "#00ff88"];
        for (let i = 0; i < count; i++) {
            const x = Math.floor(Math.random() * 2000);
            const y = Math.floor(Math.random() * 2000);
            const color = colors[Math.floor(Math.random() * colors.length)];
            stars += `${x}px ${y}px ${color}${i === count - 1 ? "" : ", "}`;
        }
        return stars;
    };

    const generateClusters = (clusterCount, starsPerCluster) => {
        let stars = "";
        for (let c = 0; c < clusterCount; c++) {
            const centerX = Math.floor(Math.random() * 2000);
            const centerY = Math.floor(Math.random() * 2000);
            for (let i = 0; i < starsPerCluster; i++) {
                const offsetX = (Math.random() - 0.5) * 100;
                const offsetY = (Math.random() - 0.5) * 100;
                const color = Math.random() > 0.5 ? "#ffffff" : "#4400ff";
                stars += `${centerX + offsetX}px ${centerY + offsetY}px ${color}, `;
            }
        }
        return stars.slice(0, -2);
    };

    const smallStars = useMemo(() => generateStars(800), []);
    const mediumStars = useMemo(() => generateStars(250), []);
    const largeStars = useMemo(() => generateStars(100), []);
    const clusters = useMemo(() => generateClusters(6, 40), []);

    return (
        <div id="stars-container">
            {/* Deep Glow & Dust */}
            <div className="horizon-glow"></div>
            <div className="cosmic-dust"></div>

            {/* Nebula Layers */}
            <div className="nebula nebula-1"></div>
            <div className="nebula nebula-2"></div>
            <div className="nebula nebula-3"></div>

            {/* Star Layers */}
            <div id="stars" style={{ boxShadow: smallStars }}></div>
            <div id="stars2" style={{ boxShadow: mediumStars }}></div>
            <div id="stars3" style={{ boxShadow: largeStars }}></div>
            <div id="star-clusters" style={{ boxShadow: clusters }}></div>

            {/* Shooting Star */}
            <div className="shooting-star"></div>
        </div>
    );
};

export default StarsBackground;
