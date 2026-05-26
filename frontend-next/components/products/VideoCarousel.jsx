'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';

const GOLD = '#B8941E';
const DARK = '#1A1515';
const CREAM = '#F5F0E6';

function parseVideoLinks(rawLinks) {
  if (!rawLinks) return [];
  return rawLinks
    .split(',')
    .map((link) => link.trim())
    .filter(Boolean)
    .map((link, i) => {
      let host = 'other';
      let embedCode = link;
      let thumbnailUrl = null;
      const lower = link.toLowerCase();

      if (lower.includes('wistia.com')) {
        host = 'wistia';
        const m = link.match(/\/medias\/([a-z0-9]+)/i);
        embedCode = m ? m[1] : link;
        thumbnailUrl = `https://fast.wistia.com/embed/medias/${embedCode}/swatch`;
      } else if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
        host = 'youtube';
        const m = link.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        embedCode = m ? m[1] : link;
        thumbnailUrl = `https://img.youtube.com/vi/${embedCode}/hqdefault.jpg`;
      } else if (lower.includes('vimeo.com')) {
        host = 'vimeo';
        const m = link.match(/vimeo\.com\/(\d+)/);
        embedCode = m ? m[1] : link;
        // Vimeo thumbnails require API, use fallback
      }

      return { id: `video-${i}`, title: `Vidéo ${i + 1}`, host, embed_code: embedCode, rawLink: link, thumbnailUrl };
    });
}

function getEmbedUrl(video) {
  const { host, embed_code } = video;
  switch (host) {
    case 'youtube':
      return `https://www.youtube.com/embed/${embed_code}`;
    case 'vimeo':
      return `https://player.vimeo.com/video/${embed_code}`;
    case 'wistia':
    default:
      return `https://fast.wistia.net/embed/iframe/${embed_code}`;
  }
}

export default function VideoCarousel({ videoLinks }) {
  const videos = parseVideoLinks(videoLinks);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeDot, setActiveDot] = useState(0);
  const scrollRef = useRef(null);

  const hasVideos = videos.length > 0;

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 176; // 160px + 16px gap
    const index = Math.round(scrollLeft / cardWidth);
    setActiveDot(index);
  };

  return (
    <>
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-2 py-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {hasVideos ? (
            videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="snap-start flex-shrink-0 w-[160px] cursor-pointer group"
                onClick={() => setSelectedVideo(video)}
              >
                <div
                className="relative w-[160px] h-[284px] rounded-xl overflow-hidden shadow-md transition-shadow group-hover:shadow-xl"
                style={{ backgroundColor: DARK }}
              >
                {/* Thumbnail background */}
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${DARK} 0%, #2a2222 100%)`,
                    }}
                  />
                )}

                {/* Dark overlay for play button visibility */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg"
                    style={{ backgroundColor: GOLD }}
                  >
                    <Play size={28} fill={CREAM} color={CREAM} />
                  </div>
                </div>

                <div
                  className="absolute bottom-0 left-0 right-0 p-3"
                  style={{
                    background: `linear-gradient(to top, rgba(26,21,21,0.95) 0%, transparent 100%)`,
                  }}
                >
                  <p
                    className="text-sm font-semibold line-clamp-2"
                    style={{ color: CREAM }}
                  >
                    {video.title}
                  </p>
                </div>
              </div>
              </motion.div>
            ))
          ) : (
            // Placeholders when no videos
            [0, 1].map((i) => (
              <div
                key={`placeholder-${i}`}
                className="snap-start flex-shrink-0 w-[160px]"
              >
                <div
                  className="relative w-[160px] h-[284px] rounded-xl overflow-hidden"
                  style={{ backgroundColor: `${DARK}30`, border: `2px dashed ${DARK}20` }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${GOLD}20` }}
                    >
                      <Play size={18} fill={`${CREAM}60`} color={`${CREAM}60`} />
                    </div>
                    <p className="text-xs text-center px-2" style={{ color: `${CREAM}50` }}>
                      {i === 0 ? 'Vidéo bientôt dispo' : 'En cours de création'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Navigation dots */}
        {hasVideos && videos.length > 1 && (
          <div className="flex items-center justify-center gap-2 py-3">
            {videos.map((_, i) => (
              <button
                key={`dot-${i}`}
                onClick={() => {
                  const container = scrollRef.current;
                  if (!container) return;
                  const cardWidth = 176;
                  container.scrollTo({ left: i * cardWidth, behavior: 'smooth' });
                  setActiveDot(i);
                }}
                className="transition-all duration-300"
                aria-label={`Go to slide ${i + 1}`}
              >
                <div
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === activeDot ? '24px' : '8px',
                    height: '8px',
                    backgroundColor: i === activeDot ? GOLD : `${CREAM}40`,
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(26,21,21,0.9)' }}
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative w-[360px] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 right-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
                style={{ color: CREAM }}
                aria-label="Close"
              >
                <X size={24} />
              </button>

              <div className="rounded-xl overflow-hidden shadow-2xl" style={{ backgroundColor: DARK }}>
                <div style={{ position: 'relative', paddingBottom: '177.78%', height: 0 }}>
                  <iframe
                    src={getEmbedUrl(selectedVideo)}
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 'none' }}
                    allow="autoplay; fullscreen; encrypted-media"
                    allowFullScreen
                    title={selectedVideo.title}
                  />
                </div>
              </div>

              <p
                className="mt-4 text-center text-lg font-semibold"
                style={{ color: CREAM }}
              >
                {selectedVideo.title}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
