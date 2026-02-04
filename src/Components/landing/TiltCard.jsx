import React, { useRef, useState, useEffect } from 'react';

const TiltCard = ({ children, onClick, className = '', onHoverChange, cardType }) => {
    const cardRef = useRef(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [lights, setLights] = useState({ x: 50, y: 50 });
    const [shadow, setShadow] = useState({ x: 0, y: 0, blur: 25 });
    const [isHovered, setIsHovered] = useState(false);

    // Configuration for the "physics" feel - reduced for subtlety
    const MAX_ROTATION = 6; // Reduced from 8 for more subtle effect
    const MAX_TRANSLATION_Z = 20; // Lift effect
    const SCALE_ON_HOVER = 1.02; // Subtle scale

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate percentage coordinates for light source
        const lightX = (x / rect.width) * 100;
        const lightY = (y / rect.height) * 100;

        // Calculate rotation with normalized coordinates
        const xPct = (x / rect.width) - 0.5;
        const yPct = (y / rect.height) - 0.5;

        // Subtle tilt that "leans" toward cursor
        const rX = yPct * -MAX_ROTATION;
        const rY = xPct * MAX_ROTATION;

        // Calculate dynamic shadow based on tilt
        // Shadow moves opposite to tilt direction
        const shadowX = -xPct * 15;
        const shadowY = -yPct * 15;
        const shadowBlur = 25 + Math.abs(xPct * 10) + Math.abs(yPct * 10);

        setRotation({ x: rX, y: rY });
        setLights({ x: lightX, y: lightY });
        setShadow({ x: shadowX, y: shadowY, blur: shadowBlur });
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (onHoverChange) onHoverChange(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (onHoverChange) onHoverChange(false);
        // Reset to neutral with smooth transition
        setRotation({ x: 0, y: 0 });
        setShadow({ x: 0, y: 0, blur: 25 });
        setLights({ x: 50, y: 50 });
    };

    return (
        <div
            ref={cardRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`tilt-card-wrapper group cursor-pointer ${className}`}
            style={{
                perspective: '1200px',
                transformStyle: 'preserve-3d',
            }}
        >
            <div
                className="tilt-card-inner bg-white rounded-3xl overflow-hidden backdrop-blur-sm"
                style={{
                    transform: isHovered
                        ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(${MAX_TRANSLATION_Z}px) scale(${SCALE_ON_HOVER})`
                        : 'rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)',
                    transition: isHovered
                        ? 'transform 0.1s cubic-bezier(0.03, 0.98, 0.52, 0.99)' // Fast follow with slight bounce
                        : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)', // Slow settle with ease-out
                    transformStyle: 'preserve-3d',
                    boxShadow: `${shadow.x}px ${shadow.y}px ${shadow.blur}px rgba(0, 0, 0, 0.15),
                                0 0 0 1px rgba(255, 255, 255, 0.1) inset`,
                    willChange: 'transform',
                }}
            >
                {/* Ambient light layer - very subtle */}
                <div
                    className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300"
                    style={{
                        opacity: isHovered ? 0.6 : 0,
                        background: `radial-gradient(circle 400px at ${lights.x}% ${lights.y}%, rgba(255, 255, 255, 0.4), transparent)`,
                        mixBlendMode: 'soft-light',
                    }}
                />

                {/* Directional glow based on cursor position */}
                <div
                    className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-500"
                    style={{
                        opacity: isHovered ? 0.3 : 0,
                        background: cardType === 'student'
                            ? `radial-gradient(circle 300px at ${lights.x}% ${lights.y}%, rgba(99, 102, 241, 0.15), transparent 70%)`
                            : `radial-gradient(circle 300px at ${lights.x}% ${lights.y}%, rgba(168, 85, 247, 0.15), transparent 70%)`,
                    }}
                />

                {/* Subtle edge highlight */}
                <div
                    className="absolute inset-0 z-10 pointer-events-none rounded-3xl"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.3s ease-out',
                        boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.2) inset',
                    }}
                />

                {/* Content Container with preserved 3D */}
                <div
                    className="relative z-20 h-full"
                    style={{
                        transformStyle: 'preserve-3d',
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default TiltCard;
