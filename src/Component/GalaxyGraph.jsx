import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import api from "../services/api";
import GlobalHeader from "./Navigation/GlobalHeader";

const GalaxyGraph = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const [nodes, setNodes] = useState([]);
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [hoveredNode, setHoveredNode] = useState(null);

    // Physics constants
    const repulsion = 1200;
    const springLength = 150;
    const springStrength = 0.05;
    const dampening = 0.9;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const rootNotes = await api.getRootNotes();
                const allNodes = [];
                const allLinks = [];

                // Create root nodes
                for (const note of rootNotes) {
                    const node = {
                        ...note,
                        x: Math.random() * 800 - 400,
                        y: Math.random() * 800 - 400,
                        vx: 0,
                        vy: 0,
                        radius: note.is_folder ? 12 : 8,
                        type: note.is_folder ? 'folder' : 'note'
                    };
                    allNodes.push(node);

                    // Fetch children for folders
                    if (note.is_folder) {
                        const children = await api.getNoteChildren(note.id);
                        for (const child of children) {
                            const childNode = {
                                ...child,
                                x: node.x + Math.random() * 100 - 50,
                                y: node.y + Math.random() * 100 - 50,
                                vx: 0,
                                vy: 0,
                                radius: 6,
                                type: 'note'
                            };
                            allNodes.push(childNode);
                            allLinks.push({ source: note.id, target: child.id });
                        }
                    }
                }

                setNodes(allNodes);
                setLinks(allLinks);
                setLoading(false);
            } catch (error) {
                console.error("Graph Data Error:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!nodes.length) return;

        let animationFrame;
        const ctx = canvasRef.current.getContext('2d');

        const updatePhysics = () => {
            // Node repulsion (Electrostatic)
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[j].x - nodes[i].x;
                    const dy = nodes[j].y - nodes[i].y;
                    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = repulsion / (distance * distance);
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;

                    nodes[i].vx -= fx;
                    nodes[i].vy -= fy;
                    nodes[j].vx += fx;
                    nodes[j].vy += fy;
                }
            }

            // Spring force (Attraction)
            for (const link of links) {
                const source = nodes.find(n => n.id === link.source);
                const target = nodes.find(n => n.id === link.target);
                if (!source || !target) continue;

                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = (distance - springLength) * springStrength;
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                source.vx += fx;
                source.vy += fy;
                target.vx -= fx;
                target.vy -= fy;
            }

            // Apply velocity and dampening
            for (const node of nodes) {
                node.x += node.vx;
                node.y += node.vy;
                node.vx *= dampening;
                node.vy *= dampening;

                // Center gravity
                node.vx -= node.x * 0.001;
                node.vy -= node.y * 0.001;
            }
        };

        const render = () => {
            updatePhysics();

            const canvas = canvasRef.current;
            if (!canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y);
            ctx.scale(zoom, zoom);

            // Draw links
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (const link of links) {
                const source = nodes.find(n => n.id === link.source);
                const target = nodes.find(n => n.id === link.target);
                if (!source || !target) continue;
                ctx.moveTo(source.x, source.y);
                ctx.lineTo(target.x, target.y);
            }
            ctx.stroke();

            // Draw nodes
            for (const node of nodes) {
                const isHovered = hoveredNode?.id === node.id;

                // Outer glow
                const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 3);
                gradient.addColorStop(0, node.type === 'folder' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.2)');
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.fillStyle = node.type === 'folder' ? '#3B82F6' : '#FFFFFF';
                if (isHovered) ctx.fillStyle = '#60A5FA';
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fill();

                // Label
                if (isHovered || node.type === 'folder' || zoom > 1.5) {
                    ctx.font = `${10 / zoom}px "Outfit", sans-serif`;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.textAlign = 'center';
                    ctx.fillText(node.title, node.x, node.y + node.radius + (15 / zoom));
                }
            }

            ctx.restore();
            animationFrame = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrame);
    }, [nodes, links, zoom, offset, hoveredNode]);

    const handleCanvasClick = (e) => {
        if (hoveredNode) {
            if (hoveredNode.is_folder) {
                navigate(`/notes/${hoveredNode.id}`);
            } else {
                navigate(`/note/${hoveredNode.id}`);
            }
        }
    };

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - canvas.width / 2 - offset.x) / zoom;
        const mouseY = (e.clientY - rect.top - canvas.height / 2 - offset.y) / zoom;

        let found = null;
        for (const node of nodes) {
            const dist = Math.sqrt((node.x - mouseX) ** 2 + (node.y - mouseY) ** 2);
            if (dist < node.radius + 5) {
                found = node;
                break;
            }
        }
        setHoveredNode(found);
    };

    const handleResize = () => {
        if (containerRef.current && canvasRef.current) {
            canvasRef.current.width = containerRef.current.clientWidth;
            canvasRef.current.height = containerRef.current.clientHeight;
        }
    };

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex flex-col h-screen bg-black overflow-hidden select-none">
            <GlobalHeader />

            <div ref={containerRef} className="flex-1 relative cursor-crosshair">
                <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    onMouseMove={handleMouseMove}
                    className="w-full h-full"
                />

                {/* UI Overlay */}
                <div className="absolute top-20 left-6 flex flex-col gap-2">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex flex-col gap-3">
                        <button onClick={() => setZoom(z => z * 1.2)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                            <ZoomIn size={18} />
                        </button>
                        <button onClick={() => setZoom(z => z / 1.2)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                            <ZoomOut size={18} />
                        </button>
                        <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }) }} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-6 left-6 pointer-events-none">
                    <div className="bg-blue-600/30 border border-blue-500/30 px-4 py-2 rounded-full backdrop-blur-md">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Knowledge Galaxy</p>
                    </div>
                </div>

                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-blue-500">Mapping the Stars...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GalaxyGraph;
