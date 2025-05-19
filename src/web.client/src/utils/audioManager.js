import { useState, useRef, useCallback } from 'react';

import hitSoundSrc from '../assets/Audio/soundeffects/hit.mp3';
import sideSoundSrc from '../assets/Audio/soundeffects/bounce.mp3';
import missSoundSrc from '../assets/Audio/soundeffects/miss.mp3';
import musicSoundSrc from '../assets/Audio/music/PongMusic.mp3'
import beatSoundSrc from '../assets/Audio/music/pong-beat.mp3'
import countLowSoundSrc from '../assets/Audio/soundeffects/CountLow-1.mp3';
import countHighSoundSrc from '../assets/Audio/soundeffects/CountHigh1Long.mp3';
import ballSoundSrc from '../assets/Audio/soundeffects/ball-2.mp3';
import gameEndSoundSrc from '../assets/Audio/soundeffects/lose-1.mp3';
import gameEndSound2Src from '../assets/Audio/soundeffects/lose-2.mp3';
import confirmSoundSrc from '../assets/Audio/soundeffects/confirm.mp3';

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
  const gameEndSound2Ref = useRef(null);
  const confirmSoundRef = useRef(null);


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
    musicSoundRef.current.volume = 0.75;
    musicSoundRef.current.loop = false;
  }

  if (!beatSoundRef.current) {
    beatSoundRef.current = new Audio(beatSoundSrc)
    beatSoundRef.current.volume = 0.9;
    beatSoundRef.current.loop = true;
  }

  if (!countLowSoundRef.current) {
    countLowSoundRef.current = new Audio(countLowSoundSrc);
    countLowSoundRef.current.volume = 0.7;
  }

  if (!countHighSoundRef.current) {
    countHighSoundRef.current = new Audio(countHighSoundSrc);
    countHighSoundRef.current.volume = 0.7;
  }

  if (!ballSoundRef.current) {
    ballSoundRef.current = new Audio(ballSoundSrc);
    ballSoundRef.current.volume = 1;
  }

  if (!gameEndSoundRef.current) {
    gameEndSoundRef.current = new Audio(gameEndSoundSrc);
    gameEndSoundRef.current.volume = 1;
  }

    if (!gameEndSound2Ref.current) {
    gameEndSound2Ref.current = new Audio(gameEndSound2Src);
    gameEndSound2Ref.current.volume = 1;
  }

  if (!confirmSoundRef.current) {
    confirmSoundRef.current = new Audio(confirmSoundSrc);
    confirmSoundRef.current.volume = 1;
  }

  const playHitSound = useCallback(() => {
      const sfx = hitSoundRef.current.cloneNode();
      sfx.currentTime = 0; 
      sfx.play().catch(error => console.error('Error playing hit sound:', error))   
  }, []);

  const playSideSound = useCallback(() => {
    const sfx = sideSoundRef.current.cloneNode();
    sfx.currentTime = 0; 
    sfx.play().catch(error => console.error('Error playing side sound:', error));  
  }, []);

  const playMissSound = useCallback(() => {
    const sfx = missSoundRef.current.cloneNode();
    sfx.currentTime = 0; 
    sfx.play().catch(error => console.error('Error playing miss sound:', error));  
  }, []);

  const playMusicSound = useCallback(() => {
    musicSoundRef.current.play().catch(error => console.error('Error playing music:', error));
    }
  , []) 

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
      const sfx = ballSoundRef.current.cloneNode();
      sfx.currentTime = 0;
      sfx.play().catch(error => console.error('Error playing ball sound:', error))  
  }
  , []);

  const playGameEndSound = useCallback(() => {   
      const sfx = gameEndSoundRef.current.cloneNode();
      sfx.currentTime = 0; 
      sfx.play().catch(error => console.error('Error playing game end sound:', error))
    }
  , []);

  const playGameEndSound2 = useCallback(() => {   
      const sfx = gameEndSound2Ref.current.cloneNode();
      sfx.currentTime = 0; 
      sfx.play().catch(error => console.error('Error playing game end sound:', error))
    }
  , []);

  const playConfirmSound = useCallback(() => { 
      const sfx = confirmSoundRef.current;  
      sfx.currentTime = 0; // Reset the sound to the beginning
      sfx.play().catch(error => console.error('Error playing confirm sound:', error))
  
  },[] )


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
    playGameEndSound2,
    playConfirmSound,
  };
};

export default audioManager;