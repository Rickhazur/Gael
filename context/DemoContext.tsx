import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import demoData from '../data/demoData.json';

interface DemoContextType {
    isDemoMode: boolean;
    enableDemoMode: () => void;
    disableDemoMode: () => void;
    getDemoData: () => typeof demoData;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDemoMode, setIsDemoMode] = useState(false);

    useEffect(() => {
        // Check if demo mode is enabled in localStorage
        const demoEnabled = localStorage.getItem('nova_demo_mode') === 'true';
        setIsDemoMode(demoEnabled);
    }, []);

    const enableDemoMode = () => {
        setIsDemoMode(true);
        localStorage.setItem('nova_demo_mode', 'true');
    };

    const disableDemoMode = () => {
        setIsDemoMode(false);
        localStorage.removeItem('nova_demo_mode');
    };

    const getDemoData = () => demoData;

    return (
        <DemoContext.Provider value={{ isDemoMode, enableDemoMode, disableDemoMode, getDemoData }}>
            {children}
        </DemoContext.Provider>
    );
};

export const useDemo = (): DemoContextType => {
    const context = useContext(DemoContext);
    if (!context) {
        throw new Error('useDemo must be used within a DemoProvider');
    }
    return context;
};
