import React, { useRef, useCallback, useEffect } from 'react';
import { X, Minus, Maximize2, GripHorizontal, Volume2 } from 'lucide-react';
import { useMediaStore } from '@/store/mediaStore';
import { YouTubeEmbed } from './YouTubeEmbed';

export const PIPPlayer: React.FC = () => {
  const { activeVideo, pipPosition, minimized, closeVideo, toggleMinimize, setPipPosition } =
    useMediaStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0 });

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = {
        dragging: true,
        startX: e.clientX,
        startY: e.clientY,
        startPosX: pipPosition.x,
        startPosY: pipPosition.y,
      };
    },
    [pipPosition],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPipPosition({
        x: Math.max(0, Math.min(window.innerWidth - 420, dragRef.current.startPosX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 60, dragRef.current.startPosY + dy)),
      });
    };

    const onMouseUp = () => {
      dragRef.current.dragging = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [setPipPosition]);

  if (!activeVideo) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-[9999] select-none"
      style={{
        left: pipPosition.x,
        top: pipPosition.y,
        width: minimized ? 280 : 420,
        transition: 'width 0.3s ease, height 0.3s ease',
      }}
    >
      {/* Glassmorphism container */}
      <div
        className="rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10"
        style={{
          background: 'rgba(10, 15, 30, 0.92)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Title bar — draggable */}
        <div
          className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing border-b border-white/5"
          onMouseDown={onMouseDown}
        >
          <div className="flex items-center gap-2 min-w-0">
            <GripHorizontal className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              {activeVideo.isLive && (
                <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-red-600 text-white tracking-wider animate-pulse">
                  LIVE
                </span>
              )}
              <span className="text-xs font-medium text-gray-300 truncate">
                {activeVideo.title}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <button
              onClick={toggleMinimize}
              className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
              title={minimized ? 'Expand' : 'Minimize'}
            >
              {minimized ? <Maximize2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            </button>
            <button
              onClick={closeVideo}
              className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
              title="Close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Video area */}
        {!minimized && (
          <div className="relative" style={{ aspectRatio: '16/9' }}>
            <YouTubeEmbed url={activeVideo.url} autoplay />
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3 h-3 text-gray-600" />
            <span className="text-[10px] text-gray-500 font-mono truncate max-w-[200px]">
              {activeVideo.channelName || activeVideo.source}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-gray-500 font-mono">streaming</span>
          </div>
        </div>
      </div>
    </div>
  );
};
