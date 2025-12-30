
import React from 'react';
import { NavigationDirection } from '../types';

interface NavigationControlsProps {
    onNavigate: (direction: NavigationDirection) => void;
    onExit: () => void;
    isLoading: boolean;
}

const NavButton: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode; label: string; className?: string }> = 
({ onClick, disabled, children, label, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-12 h-12 md:w-14 md:h-14 bg-gray-800/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center
            hover:bg-indigo-600/80 disabled:bg-gray-700/50 disabled:cursor-not-allowed transition-all transform hover:scale-110 ${className}`}
        aria-label={label}
    >
        {children}
    </button>
);

export const NavigationControls: React.FC<NavigationControlsProps> = ({ onNavigate, onExit, isLoading }) => {
    return (
        <div className="absolute inset-0 flex flex-col justify-between items-center p-4 md:p-8 z-20 pointer-events-none">
            {/* Top right exit button */}
             <div className="w-full flex justify-end pointer-events-auto">
                <button
                    onClick={onExit}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-700/80 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-red-600 disabled:bg-gray-700/50 transition-colors"
                >
                    Çık
                </button>
            </div>

            {/* Bottom center controls */}
            <div className="flex items-center gap-4 md:gap-8 pointer-events-auto">
                {/* D-Pad */}
                <div className="grid grid-cols-3 grid-rows-3 gap-2 w-40 h-40">
                    <div className="col-start-2 row-start-1 flex justify-center items-center">
                        <NavButton onClick={() => onNavigate('up')} disabled={isLoading} label="Yukarı bak">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        </NavButton>
                    </div>
                    <div className="col-start-1 row-start-2 flex justify-center items-center">
                        <NavButton onClick={() => onNavigate('left')} disabled={isLoading} label="Sola kaydır">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </NavButton>
                    </div>
                    <div className="col-start-3 row-start-2 flex justify-center items-center">
                        <NavButton onClick={() => onNavigate('right')} disabled={isLoading} label="Sağa kaydır">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </NavButton>
                    </div>
                    <div className="col-start-2 row-start-3 flex justify-center items-center">
                         <NavButton onClick={() => onNavigate('down')} disabled={isLoading} label="Aşağı bak">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </NavButton>
                    </div>
                </div>

                {/* Zoom Controls */}
                <div className="flex flex-col gap-2">
                     <NavButton onClick={() => onNavigate('forward')} disabled={isLoading} label="İlerle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </NavButton>
                     <NavButton onClick={() => onNavigate('backward')} disabled={isLoading} label="Geri git">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </NavButton>
                </div>
            </div>
        </div>
    );
};
