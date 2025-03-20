import React, { useState, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';
import './LobbyCameraOverlay.css'

/* QrScanner.WORKER_PATH = '/assets/qr-scanner-worker.min.js' */


interface LobbyCameraOverlayProps {
  onComplete: (data: string) => void;
  searchingText?: string;
}

const LobbyCameraOverlay: React.FC<LobbyCameraOverlayProps> = ({ onComplete, searchingText}) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let qrScanner: QrScanner | undefined
    if(videoRef.current){
      qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('Detailed scan result: ', result)
          onComplete(result.data)
          /* qrScanner?.stop() */
        },
        {returnDetailedScanResult: true}
      )
      qrScanner.start().catch((err: any) => {
        console.error('Failed to start QR scanner:', err)
        setError('Failed to start QR scanner. Please check camera permissions')
      })
    }

    return () => {
      qrScanner?.stop()
    }
  }, [onComplete])

return (
  <div className="overlay">
  <video ref={videoRef} style={{ width: '60%' }} />
  <div className="searching-text">
    {searchingText}
  </div>
  {error && <p className="error-message">{error}</p>}
</div>
      );
    };
    

export default LobbyCameraOverlay;
