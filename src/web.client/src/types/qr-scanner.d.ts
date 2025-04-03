// qr-scanner.d.ts
declare module 'qr-scanner' {
    export type ScanResult = {
        data: string;
        cornerPoints: { x: number; y: number }[];
        binaryData: Uint8Array;
    };

    export type Camera = {
        id: string;
        label: string;
    };

    export default class QrScanner {
        constructor(
            video: HTMLVideoElement,
            onDecode: (result: ScanResult) => void,
            options?: {
                returnDetailedScanResult?: boolean;
                deviceId?: string;
            }
        );

        start(): Promise<void>;
        stop(): void;
        destroy(): void;

        static listCameras(skipIfDuplicated?: boolean): Promise<Camera[]>;
    }
}