declare module 'react-webcam' {
    import { Component, RefObject } from 'react';

    export interface WebcamProps {
        audio?: boolean;
        audioConstraints?: MediaStreamConstraints['audio'];
        disablePictureInPicture?: boolean;
        forceScreenshotSourceSize?: boolean;
        imageSmoothing?: boolean;
        mirrored?: boolean;
        minScreenshotHeight?: number;
        minScreenshotWidth?: number;
        onUserMedia?: (stream: MediaStream) => void;
        onUserMediaError?: (error: string | DOMException) => void;
        screenshotFormat?: 'image/webp' | 'image/png' | 'image/jpeg';
        screenshotQuality?: number;
        videoConstraints?: MediaStreamConstraints['video'];
        style?: React.CSSProperties;
        className?: string;
    }

    export default class Webcam extends Component<WebcamProps> {
        getScreenshot(): string | null;
    }
}
