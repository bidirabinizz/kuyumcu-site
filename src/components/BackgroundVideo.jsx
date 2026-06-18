'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function BackgroundVideo() {
  const [showVideo, setShowVideo] = useState(true);
  const [videoUrl, setVideoUrl] = useState('https://linki.ax/uploads/backgrounds/9ffec930f2decea4d7b82a3349c53ef7.mp4');
  const [videoOpacity, setVideoOpacity] = useState('0.35');

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'PREVIEW_UPDATE' && event.data.data.settings) {
        const sObj = event.data.data.settings;
        if (sObj.show_video !== undefined) setShowVideo(String(sObj.show_video) === 'true');
        if (sObj.bg_video_url) setVideoUrl(sObj.bg_video_url);
        if (sObj.video_opacity !== undefined) {
          let op = parseFloat(sObj.video_opacity);
          if (op > 1) op = op / 100;
          setVideoOpacity(op.toString());
        }
      }
    };
    window.addEventListener('message', handleMessage);

    const loadSettings = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('*');
        if (!error && data) {
          const sObj = {};
          data.forEach(item => { sObj[item.key] = item.value; });
          if (sObj.show_video !== undefined) setShowVideo(sObj.show_video === 'true');
          if (sObj.bg_video_url) setVideoUrl(sObj.bg_video_url);
          if (sObj.video_opacity) setVideoOpacity(sObj.video_opacity);
        }
      } catch (err) {
        console.warn('Failed to load video settings from Supabase, using default.', err);
      }
    };

    loadSettings();
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!showVideo || !videoUrl) return null;

  return (
    <div className="video-bg-container">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="video-bg"
        preload="auto"
        style={{ opacity: parseFloat(videoOpacity) }}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
    </div>
  );
}
