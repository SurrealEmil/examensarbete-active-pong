import React, { useState, useEffect } from "react";
import { connectNewJoyCons } from "../JoyCon/index"
import '../UI/ConnectOverlay.css'

const ConnectOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "c") {
        setIsOpen((prevOpen) => !prevOpen)// Open modal when "C" is pressed
        if (setGamePaused) {}
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const handleConnect = async () => {
    await connectNewJoyCons();
    setIsOpen(false);
    // Resume game when closing the modal
    if (setGamePaused) {
      setGamePaused(false);
    }
  };

  return (
    <>
     {/*  <button onClick={() => setIsOpen(true)} className="connect-btn">
        Connect Joy-Cons
      </button> */}

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div class="connect">🎮 Connect</div>
            <div class="joycons">Your JoyCons</div>
            <p></p>
            <button onClick={handleConnect} className="connect-btn">
              Start Connection
            </button>
        
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectOverlay;
