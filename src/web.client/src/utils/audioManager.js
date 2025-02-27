import { useState, useRef, useCallback } from 'react';

import hitSoundSrc from '../assets/Audio/Hit.wav';
import sideSoundSrc from '../assets/Audio/Bounce.wav';
import missSoundSrc from '../assets/Audio/Miss.wav';
import musicSoundSrc from '../assets/Audio/music/pong-music.mp3'
import beatSoundSrc from '../assets/Audio/music/pong-beat.mp3'

const audioManager = () => {
  const [audioEnabled, setAudioEnabled] = useState(false);

  const hitSoundRef = useRef(null);
  const sideSoundRef = useRef(null);
  const missSoundRef = useRef(null);
  const musicSoundRef = useRef(null)
  const beatSoundRef = useRef(null)

  if (!hitSoundRef.current) {
    hitSoundRef.current = new Audio(hitSoundSrc);
    hitSoundRef.current.volume = 1;
  }
  if (!sideSoundRef.current) {
    sideSoundRef.current = new Audio(sideSoundSrc);
    sideSoundRef.current.volume = 1;
  }
  if (!missSoundRef.current) {
    missSoundRef.current = new Audio(missSoundSrc);
    missSoundRef.current.volume = 1;
  }
  if (!musicSoundRef.current) {
    musicSoundRef.current = new Audio(musicSoundSrc)
    musicSoundRef.current.volume = 0.9;
    musicSoundRef.current.loop = true;
  }

  if (!beatSoundRef.current) {
    beatSoundRef.current = new Audio(beatSoundSrc)
    beatSoundRef.current.volume = 0.9;
    beatSoundRef.current.loop = true;
  }

  const playHitSound = useCallback(() => {
    if (audioEnabled) {
      hitSoundRef.current.play().catch(error => console.error('Error playing hit sound:', error));
    }
  }, [audioEnabled]);

  const playSideSound = useCallback(() => {
    if (audioEnabled) {
      sideSoundRef.current.play().catch(error => console.error('Error playing side sound:', error));
    }
  }, [audioEnabled]);

  const playMissSound = useCallback(() => {
    if (audioEnabled) {
      missSoundRef.current.play().catch(error => console.error('Error playing miss sound:', error));
    }
  }, [audioEnabled]);

  const playMusicSound = useCallback(() => {
    if (audioEnabled) {
    musicSoundRef.current.play().catch(error => console.error('Error playing music:', error));
    }
  }, [audioEnabled])

  const stopMusicSound = useCallback(() => {
    if( musicSoundRef.current) {
        musicSoundRef.current.pause()
        musicSoundRef.current.currentTime = 0;
      }
  }, [])

  const playBeatSound = useCallback(() => {
    if(audioEnabled) {
      beatSoundRef.current.play()
    }
  }, [audioEnabled])

  const stopBeatSound = useCallback(() => {
    if( beatSoundRef.current){
        beatSoundRef.current.pause()
        beatSoundRef.currentTime = 0;
    }
  }, [])



  return {
    audioEnabled,
    setAudioEnabled,
    playHitSound,
    playSideSound,
    playMissSound,
    playMusicSound,
    stopMusicSound,
    playBeatSound,
    stopBeatSound,
  };
};

export default audioManager;