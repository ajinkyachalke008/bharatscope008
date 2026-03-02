import React, { useMemo } from 'react';

interface YouTubeEmbedProps {
  url: string;
  autoplay?: boolean;
  className?: string;
}

function extractVideoId(url: string): string | null {
  // Handle youtube.com/watch?v=XXX
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Handle youtu.be/XXX
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // Handle youtube.com/embed/XXX
  const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  return null;
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  url,
  autoplay = true,
  className = '',
}) => {
  const videoId = useMemo(() => extractVideoId(url), [url]);

  if (!videoId) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-900 text-gray-500 text-xs ${className}`}
      >
        Invalid video URL
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=1&rel=0&modestbranding=1&playsinline=1`;

  return (
    <iframe
      src={embedUrl}
      className={className}
      style={{ border: 'none', width: '100%', height: '100%' }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="YouTube video player"
    />
  );
};
