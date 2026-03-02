import { create } from 'zustand';

interface MediaVideo {
  url: string;
  title: string;
  source: string;
  thumbnailUrl?: string;
  channelName?: string;
  isLive?: boolean;
}

interface MediaState {
  activeVideo: MediaVideo | null;
  pipMode: boolean;
  pipPosition: { x: number; y: number };
  pipSize: { w: number; h: number };
  minimized: boolean;

  playVideo: (video: MediaVideo) => void;
  closeVideo: () => void;
  togglePip: () => void;
  toggleMinimize: () => void;
  setPipPosition: (pos: { x: number; y: number }) => void;
}

export const useMediaStore = create<MediaState>((set) => ({
  activeVideo: null,
  pipMode: true,
  pipPosition: { x: window.innerWidth - 440, y: window.innerHeight - 310 },
  pipSize: { w: 420, h: 280 },
  minimized: false,

  playVideo: (video) =>
    set({
      activeVideo: video,
      pipMode: true,
      minimized: false,
    }),

  closeVideo: () => set({ activeVideo: null, minimized: false }),

  togglePip: () => set((state) => ({ pipMode: !state.pipMode })),

  toggleMinimize: () => set((state) => ({ minimized: !state.minimized })),

  setPipPosition: (pos) => set({ pipPosition: pos }),
}));
