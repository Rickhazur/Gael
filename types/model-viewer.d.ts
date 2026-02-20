// Type declarations for @google/model-viewer
declare namespace JSX {
    interface IntrinsicElements {
        'model-viewer': ModelViewerJSX & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
}

interface ModelViewerJSX {
    src?: string;
    alt?: string;
    ar?: boolean;
    'ar-modes'?: string;
    'ar-scale'?: string;
    'auto-rotate'?: boolean;
    'camera-controls'?: boolean;
    'camera-orbit'?: string;
    'camera-target'?: string;
    'environment-image'?: string;
    exposure?: string;
    'field-of-view'?: string;
    'interaction-prompt'?: string;
    'interaction-prompt-style'?: string;
    'interaction-prompt-threshold'?: string;
    'ios-src'?: string;
    loading?: 'auto' | 'lazy' | 'eager';
    'max-camera-orbit'?: string;
    'min-camera-orbit'?: string;
    'min-field-of-view'?: string;
    'max-field-of-view'?: string;
    poster?: string;
    'reveal'?: string;
    'shadow-intensity'?: string;
    'shadow-softness'?: string;
    skybox?: string;
    'skybox-image'?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}
