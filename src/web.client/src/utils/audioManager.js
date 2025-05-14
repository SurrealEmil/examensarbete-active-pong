import { useState, useRef, useCallback } from 'react';

import hitSoundSrc from '../assets/Audio/Hit.wav';
import sideSoundSrc from '../assets/Audio/Bounce.wav';
import missSoundSrc from '../assets/Audio/Miss.wav';
import musicSoundSrc from '../assets/Audio/music/PongMusic.mp3'
import beatSoundSrc from '../assets/Audio/music/pong-beat.mp3'
import countLowSoundSrc from '../assets/Audio/soundeffects/CountLow-1.mp3';
import countHighSoundSrc from '../assets/Audio/soundeffects/CountHigh1Long.mp3';
import ballSoundSrc from '../assets/Audio/soundeffects/ball-2.mp3';
import gameEndSoundSrc from '../assets/Audio/soundeffects/lose-1.mp3';

const audioManager = () => {
  const [audioEnabled, setAudioEnabled] = useState(false);

  const hitSoundRef = useRef(null);
  const sideSoundRef = useRef(null);
  const missSoundRef = useRef(null);
  const musicSoundRef = useRef(null)
  const beatSoundRef = useRef(null)
  const countLowSoundRef = useRef(null);
  const countHighSoundRef = useRef(null);
  const ballSoundRef = useRef(null);
  const gameEndSoundRef = useRef(null);


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

  if (!countLowSoundRef.current) {
    countLowSoundRef.current = new Audio(countLowSoundSrc);
    countLowSoundRef.current.volume = 1;
  }

  if (!countHighSoundRef.current) {
    countHighSoundRef.current = new Audio(countHighSoundSrc);
    countHighSoundRef.current.volume = 1;
  }

  if (!ballSoundRef.current) {
    ballSoundRef.current = new Audio(ballSoundSrc);
    ballSoundRef.current.volume = 1;
  }

  if (!gameEndSoundRef.current) {
    gameEndSoundRef.current = new Audio(gameEndSoundSrc);
    gameEndSoundRef.current.volume = 1;
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

  const playCountLowSound = useCallback(() => {
    if (audioEnabled) {
      const sfx = countLowSoundRef.current;
      sfx.currentTime = 0; // Reset the sound to the beginning
      sfx.play().catch(error => console.error('Error playing count low sound:', error))
    }
  }
  , [audioEnabled]);

  const playCountHighSound = useCallback(() => {
    if (audioEnabled) {
      const sfx = countHighSoundRef.current;
      sfx.currentTime = 0; // Reset the sound to the beginning
      sfx.play().catch(error => console.error('Error playing count High sound:', error))
    }
  }
  , [audioEnabled]);

  const playBallSound = useCallback(() => {   
    if (audioEnabled) {
      const sfx = ballSoundRef.current;
      sfx.currentTime = 0; // Reset the sound to the beginning
      sfx.play().catch(error => console.error('Error playing ball sound:', error))
    }
  }
  , [audioEnabled]);

  const playGameEndSound = useCallback(() => {   
    if (audioEnabled) {
      const sfx = gameEndSoundRef.current;
      sfx.currentTime = 0; // Reset the sound to the beginning
      sfx.play().catch(error => console.error('Error playing game end sound:', error))
    }
  }
  , [audioEnabled]);


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
    playCountLowSound,
    playCountHighSound,
    playBallSound,
    playGameEndSound,
  };
};

export default audioManager;