import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/utils/cn';
import { BHARAT_DATA, type NodeItem } from '@/data/bharatMonitorData';
import { Command } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { AnimatedNumber } from '@/components/common/AnimatedNumber';

interface BharatMonitorV3Props {
    className?: string;
    onClose?: () => void;
}

export const BharatMonitorV3: React.FC<BharatMonitorV3Props> = ({ className, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
        nuclear: true,
        thermal: true,
        solar: true,
        hydro: true,
        airports: true,
        datacenters: true,
        sez: false,
        manufacturing: false,
        weather_alerts: true,
    });

    const [focusedNode, setFocusedNode] = useState<NodeItem | null>(null);

    // Simulated Fly-To effect
    useEffect(() => {
        if (focusedNode) {
            // In a real DeckGL implementation this would trigger flyTo()
            const timer = setTimeout(() => {
                // Clear focus after simulated animation
                // setFocusedNode(null); 
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [focusedNode]);

    const toggleLayer = (layerId: string) => {
        setActiveLayers(prev => ({
            ...prev,
            [layerId]: !prev[layerId]
        }));
    };

    // Compute live energy aggregates based on active layers
    const liveEnergy = useMemo(() => {
        let mw = 0;
        if (activeLayers.nuclear) mw += BHARAT_DATA.aggregates.energy.nuclear_total_mw;
        if (activeLayers.thermal) mw += BHARAT_DATA.aggregates.energy.thermal_total_mw;
        if (activeLayers.solar) mw += BHARAT_DATA.aggregates.energy.solar_total_mw;
        if (activeLayers.hydro) mw += BHARAT_DATA.aggregates.energy.hydro_total_mw;
        return {
            mw,
            gw: (mw / 1000).toFixed(1)
        };
    }, [activeLayers]);

    // Aggregate search results
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        const results: Array<{ layer: string; node: NodeItem }> = [];

        Object.entries(BHARAT_DATA.nodes).forEach(([layerId, nodes]) => {
            // @ts-ignore
            nodes.forEach((node: NodeItem) => {
                if (
                    node.name.toLowerCase().includes(query) ||
                    node.state?.toLowerCase().includes(query) ||
                    node.id.toLowerCase().includes(query) ||
                    node.iata?.toLowerCase().includes(query)
                ) {
                    results.push({ layer: layerId, node });
                }
            });
        });
        return results.slice(0, 5); // Limit to top 5 hits
    }, [searchQuery]);

    const handleSelectNode = (layerId: string, node: NodeItem) => {
        // Ensure layer is on
        if (!activeLayers[layerId]) {
            toggleLayer(layerId);
        }
        setFocusedNode(node);
        setSearchQuery('');
    };

    return (
        <div className={cn("fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden", className)}>

            {/* --- AMBIENT BACKGROUND & MAP SIMULATION --- */}
            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e4/India_satellite_image.png')] bg-cover bg-center opacity-20 object-cover mix-blend-screen mix-blend-luminosity filter contrast-125 saturate-50"></div>

            {/* Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACAQMAAACjW1vKAAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAAAxJREFUCNdjYGBgAAABAAABe1H58QAAAABJRU5ErkJggg==')] opacity-10"></div>

            {/* Crosshairs & Scale */}
            <div className="absolute inset-0 pointer-events-none border-[1px] border-emerald-900/30 m-4 rounded-xl flex items-center justify-center">
                <div className="w-[1px] h-full bg-emerald-500/10"></div>
                <div className="h-[1px] w-full bg-emerald-500/10 absolute"></div>
            </div>

            {/* --- TOP HEADER & SEARCH BAR --- */}
            <header className="relative z-10 flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur border-b border-emerald-900/50">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold tracking-widest text-emerald-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            BHARAT MONITOR <span className="text-xs text-orange-400 font-mono tracking-normal ml-2">v3.0</span>
                        </h1>
                        <p className="text-xs text-slate-400 font-mono">OP_CENTER // GEO: {BHARAT_DATA.metadata.geofence} // NODES: {BHARAT_DATA.metadata.total_nodes}</p>
                    </div>
                </div>

                {/* Global Search Bar */}
                <div className="relative w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Command className="h-4 w-4 text-emerald-500/50" />
                    </div>
                    <input
                        type="text"
                        className="w-full bg-slate-950/50 border border-emerald-900/50 text-slate-200 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block pl-10 p-2.5 font-mono placeholder-slate-600 outline-none transition-all"
                        placeholder="Search Tarapur, BLR, Bhadla..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    {/* Search Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-emerald-900/50 rounded-lg shadow-2xl shadow-emerald-900/20 overflow-hidden font-mono text-sm z-50">
                            {searchResults.map((res, idx) => (
                                <div
                                    key={idx}
                                    className="px-4 py-3 hover:bg-emerald-900/30 cursor-pointer border-b border-slate-800 last:border-0 transition-colors flex justify-between items-center"
                                    onClick={() => handleSelectNode(res.layer, res.node)}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-slate-200">{res.node.name}</span>
                                        <span className="text-xs text-slate-500">{res.node.state}</span>
                                    </div>
                                    <Badge variant="default" className="text-xs border-emerald-900 text-emerald-400 bg-emerald-950/30">
                                        {/* @ts-ignore */}
                                        {BHARAT_DATA.layer_config[res.layer]?.label}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Realtime Clock IST */}
                <div className="font-mono text-sm text-emerald-400/80 bg-emerald-950/30 px-3 py-1.5 rounded border border-emerald-900/50">
                    IST {new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false })}
                </div>
            </header>

            {/* --- MAIN HUD HUD --- */}
            <div className="relative flex-1 p-6 flex justify-between pointer-events-none">

                {/* LEFT COLUMN: Layer Controls & Grid */}
                <div className="w-72 flex flex-col gap-6 pointer-events-auto">

                    {/* Layer Controls HUD */}
                    <div className="bg-slate-900/80 backdrop-blur border border-emerald-900/50 rounded-xl p-4 shadow-xl">
                        <h2 className="text-xs font-bold tracking-widest text-slate-400 mb-4 border-b border-slate-800 pb-2">MAP LAYERS</h2>
                        <div className="flex flex-col gap-2">
                            {Object.entries(BHARAT_DATA.layer_config).map(([id, config]) => (
                                <label key={id} className="flex items-center justify-between cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg w-6 text-center" style={{ color: activeLayers[id] ? config.color : '#475569' }}>{config.icon}</span>
                                        <span className={cn("text-sm transition-colors", activeLayers[id] ? "text-slate-200" : "text-slate-600")}>{config.label}</span>
                                    </div>
                                    <div className={cn(
                                        "w-8 h-4 rounded-full transition-colors relative",
                                        activeLayers[id] ? "bg-emerald-600" : "bg-slate-800"
                                    )}>
                                        <div className={cn(
                                            "absolute top-0.5 bottom-0.5 w-3 rounded-full bg-white transition-all",
                                            activeLayers[id] ? "left-4" : "left-0.5"
                                        )}></div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Datacenter & Econ Quick Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-indigo-950/40 border border-indigo-900/50 rounded-lg p-3 backdrop-blur flex flex-col items-center justify-center text-center">
                            <span className="text-slate-400 text-[10px] tracking-widest mb-1">DATA CENTERS</span>
                            <span className="text-xl font-mono text-indigo-400"><AnimatedNumber value={BHARAT_DATA.aggregates.datacenters.total_it_load_mw} /> <span className="text-xs">MW</span></span>
                        </div>
                        <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-lg p-3 backdrop-blur flex flex-col items-center justify-center text-center">
                            <span className="text-slate-400 text-[10px] tracking-widest mb-1">AIRPORT PAX</span>
                            <span className="text-xl font-mono text-emerald-400"><AnimatedNumber value={BHARAT_DATA.aggregates.airports.total_pax_mn_fy24} /> <span className="text-xs">M</span></span>
                        </div>
                        <div className="bg-orange-950/40 border border-orange-900/50 rounded-lg p-3 backdrop-blur flex flex-col items-center justify-center text-center">
                            <span className="text-slate-400 text-[10px] tracking-widest mb-1">SEZ ZONES</span>
                            <span className="text-xl font-mono text-orange-400"><AnimatedNumber value={BHARAT_DATA.nodes.sez.length} /></span>
                        </div>
                        <div className="bg-rose-950/40 border border-rose-900/50 rounded-lg p-3 backdrop-blur flex flex-col items-center justify-center text-center">
                            <span className="text-slate-400 text-[10px] tracking-widest mb-1">MFG HUBS</span>
                            <span className="text-xl font-mono text-rose-400"><AnimatedNumber value={BHARAT_DATA.nodes.manufacturing.length} /></span>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: Analytics & Weather */}
                <div className="w-80 flex flex-col gap-6 pointer-events-auto">

                    {/* Energy Analytics Panel */}
                    <div className="bg-slate-900/80 backdrop-blur border border-emerald-900/50 rounded-xl p-4 shadow-xl">
                        <div className="flex justify-between items-end mb-4 border-b border-slate-800 pb-2">
                            <h2 className="text-xs font-bold tracking-widest text-slate-400">ENERGY GRID</h2>
                            <div className="text-right">
                                <div className="text-2xl font-mono text-emerald-400 font-light tracking-tighter">
                                    <AnimatedNumber value={Math.round(parseFloat(liveEnergy.gw) * 10)} format={(n) => (n / 10).toFixed(1)} />
                                    <span className="text-sm tracking-normal ml-1">GW</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">LIVE CAPACITY</div>
                            </div>
                        </div>

                        {/* Source Breakdown Bars */}
                        <div className="flex flex-col gap-3">
                            {[
                                { id: 'nuclear', label: 'Nuclear', color: 'bg-orange-500', max: 10000 },
                                { id: 'thermal', label: 'Thermal', color: 'bg-purple-500', max: 35000 },
                                { id: 'solar', label: 'Solar', color: 'bg-yellow-500', max: 10000 },
                                { id: 'hydro', label: 'Hydro', color: 'bg-cyan-500', max: 15000 },
                            ].map(src => (
                                <div key={src.id} className={cn("transition-opacity duration-300", activeLayers[src.id] ? "opacity-100" : "opacity-30")}>
                                    <div className="flex justify-between text-[10px] font-mono mb-1">
                                        <span className="text-slate-400">{src.label}</span>
                                        <span className="text-slate-300">
                                            {/* @ts-ignore */}
                                            {BHARAT_DATA.aggregates.energy[`${src.id}_total_mw`].toLocaleString()} MW
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        {/* @ts-ignore */}
                                        <div className={cn("h-full", src.color)} style={{ width: `${(BHARAT_DATA.aggregates.energy[`${src.id}_total_mw`] / src.max) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 24h Simulated Sparkline */}
                        <div className="mt-6 pt-4 border-t border-slate-800">
                            <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-2">
                                <span>24H LOAD CURVE</span>
                                <span>+2.4% PEAK</span>
                            </div>
                            <div className="h-12 w-full">
                                <svg viewBox="0 0 100 30" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                                    <path d="M0,25 C10,25 20,15 30,10 C40,5 50,15 60,10 C70,5 80,20 100,15" fill="none" stroke="currentColor" className="text-emerald-500/50" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                                    <path d="M0,25 C10,25 20,15 30,10 C40,5 50,15 60,10 C70,5 80,20 100,15 L100,30 L0,30 Z" fill="currentColor" className="text-emerald-500/10" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* IMD Weather Alerts Panel */}
                    <div className="bg-slate-900/80 backdrop-blur border border-blue-900/50 rounded-xl p-4 shadow-xl transition-opacity duration-500" style={{ opacity: activeLayers.weather_alerts ? 1 : 0.3 }}>
                        <h2 className="text-xs font-bold tracking-widest text-blue-400 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            IMD METEOROLOGICAL
                        </h2>
                        <div className="flex flex-col gap-2">
                            {BHARAT_DATA.nodes.weather_alerts.map(alert => (
                                <div key={alert.id} className="bg-blue-950/20 border border-blue-900/30 rounded p-2 text-xs font-mono">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-blue-100">{alert.name}</span>
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider",
                                            alert.severity === 'Warning' ? "bg-red-900/50 text-red-300" :
                                                alert.severity === 'Active' ? "bg-orange-900/50 text-orange-300" :
                                                    alert.severity === 'Moderate' ? "bg-yellow-900/50 text-yellow-300" :
                                                        "bg-blue-900/50 text-blue-300"
                                        )}>{alert.severity}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-blue-400/60 mt-2">
                                        <span>{alert.type}</span>
                                        <span>{alert.trend} ↗</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>

            {/* --- SIMULATED FOCUS RADAR RING --- */}
            {focusedNode && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none z-0">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border border-emerald-500/50 animate-ping absolute -top-16 -left-16"></div>
                        <div className="w-16 h-16 rounded-full border-2 border-emerald-400 animate-pulse absolute -top-8 -left-8 bg-emerald-950/50 backdrop-blur-sm"></div>
                        <div className="w-2 h-2 rounded-full bg-white absolute -top-1 -left-1 shadow-[0_0_15px_rgba(255,255,255,1)]"></div>
                    </div>

                    <div className="mt-12 bg-slate-900/90 border border-emerald-500/50 rounded-lg p-3 font-mono shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-emerald-400 text-sm font-bold">{focusedNode.name}</div>
                        <div className="text-slate-400 text-xs">LOC: {focusedNode.lat.toFixed(4)}°, {focusedNode.lng.toFixed(4)}°</div>
                        <div className="text-slate-500 text-[10px] mt-1 uppercase border-t border-slate-800 pt-1">
                            {focusedNode.state} // TRACKING HOOK ENGAGED
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
