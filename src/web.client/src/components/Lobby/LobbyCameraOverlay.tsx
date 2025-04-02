import { useState, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';
import './LobbyCameraOverlay.css'


interface LobbyCameraOverlayProps {
    onComplete: (data: string) => void;
    searchingText?: string;
}

const LobbyCameraOverlay: React.FC<LobbyCameraOverlayProps> = ({ onComplete, searchingText }) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let qrScanner: QrScanner | undefined;

        QrScanner.listCameras(true).then(cameras => {
            // Debug: lista alla tillgängliga kameror
            console.log("Available cameras:", cameras);

            if (cameras.length === 0) {
                setError("No cameras found");
                return;
            }

            // Välj den externa kameran om du vet dess label, annars ta den som inte är default
            const externalCamera = cameras.find(cam => !cam.label.toLowerCase().includes("facetime"));
            const selectedCamera = externalCamera || cameras[0];

            if (videoRef.current) {
                qrScanner = new QrScanner(
                    videoRef.current,
                    (result) => {
                        console.log('Detailed scan result: ', result);
                        onComplete(result.data);
                    },
                    {
                        returnDetailedScanResult: true,
                        deviceId: selectedCamera.id
                    }
                );

                qrScanner.start().catch(err => {
                    console.error("Failed to start QR scanner:", err);
                    setError("Failed to start QR scanner. Please check camera permissions");
                });
            }
        }).catch(err => {
            console.error("Error listing cameras:", err);
            setError("Could not list cameras. Please check permissions");
        });

        return () => {
            qrScanner?.stop();
        };
    }, [onComplete]);

    return (
        <div className="overlay">
            <video className="video" ref={videoRef} />
            <div className="searching-text">
                {searchingText}
            </div>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};


export default LobbyCameraOverlay;