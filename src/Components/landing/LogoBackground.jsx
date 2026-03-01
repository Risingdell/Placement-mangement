import React, { useState, useEffect } from 'react';
import logo from '../../assets/Srinivas_University_logo.gif';

const LogoBackground = ({ isActive }) => {
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const [glowIntensity, setGlowIntensity] = useState(0.3);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        setGlowIntensity(isActive ? 0.6 : 0.3);
    }, [isActive]);

    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0 animate-ambient-entrance">
            <div
                className="relative w-full h-full max-w-3xl transition-all duration-700 ease-out"
                style={{
                    transform: isActive ? 'scale(1.08) translateZ(10px)' : 'scale(1)',
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* Main logo with vibrant colors */}
                <div className="relative w-full h-full">
                    <img
                        src={logo}
                        alt="Srinivas University Logo"
                        className="w-full h-full object-contain relative z-10 transition-all duration-700 ease-out"
                        style={{
                            opacity: isActive ? 0.25 : 0.18,
                            filter: isActive
                                ? 'saturate(1.4) brightness(1.2) contrast(1.1)'
                                : 'saturate(1.1) brightness(1.05) contrast(1.05)',
                            mixBlendMode: 'normal',
                        }}
                        aria-hidden="true"
                    />

                    {/* Vibrant glow layer 1 - Yellow/Orange gradient (JS 30 style) */}
                    <div
                        className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out"
                        style={{
                            opacity: glowIntensity * 0.8,
                            background: `radial-gradient(circle 600px at ${mousePos.x}% ${mousePos.y}%,
                                rgba(251, 191, 36, 0.4) 0%,
                                rgba(245, 158, 11, 0.3) 25%,
                                rgba(249, 115, 22, 0.2) 50%,
                                transparent 70%)`,
                            filter: 'blur(60px)',
                            transform: 'translateZ(20px)',
                            transformStyle: 'preserve-3d',
                        }}
                    />

                    {/* Vibrant glow layer 2 - Indigo/Purple */}
                    <div
                        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
                        style={{
                            opacity: glowIntensity * 0.6,
                            background: `radial-gradient(circle 700px at ${100 - mousePos.x}% ${100 - mousePos.y}%,
                                rgba(99, 102, 241, 0.35) 0%,
                                rgba(139, 92, 246, 0.25) 30%,
                                rgba(168, 85, 247, 0.15) 60%,
                                transparent 75%)`,
                            filter: 'blur(70px)',
                            transform: 'translateZ(15px)',
                            transformStyle: 'preserve-3d',
                        }}
                    />

                    {/* Dynamic color shift layer - follows mouse closely */}
                    <div
                        className="absolute inset-0 pointer-events-none transition-all duration-300 ease-out"
                        style={{
                            opacity: isActive ? glowIntensity * 1.2 : glowIntensity * 0.5,
                            background: `radial-gradient(circle 400px at ${mousePos.x}% ${mousePos.y}%,
                                rgba(253, 224, 71, 0.5) 0%,
                                rgba(251, 191, 36, 0.35) 20%,
                                rgba(245, 158, 11, 0.2) 40%,
                                transparent 60%)`,
                            filter: 'blur(50px)',
                            mixBlendMode: 'screen',
                            transform: 'translateZ(25px)',
                            transformStyle: 'preserve-3d',
                        }}
                    />

                    {/* Outer atmospheric glow */}
                    <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-out"
                        style={{
                            opacity: isActive ? 0.4 : 0.2,
                            background: `radial-gradient(ellipse 120% 100% at 50% 50%,
                                rgba(251, 191, 36, 0.15) 0%,
                                rgba(99, 102, 241, 0.1) 40%,
                                transparent 70%)`,
                            filter: 'blur(80px)',
                            transform: 'scale(1.3)',
                        }}
                    />

                    {/* Shimmer effect overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                        style={{
                            opacity: isActive ? 0.3 : 0,
                            background: `linear-gradient(135deg,
                                transparent 0%,
                                rgba(255, 255, 255, 0.1) 45%,
                                rgba(255, 255, 255, 0.2) 50%,
                                rgba(255, 255, 255, 0.1) 55%,
                                transparent 100%)`,
                            backgroundSize: '200% 200%',
                            animation: isActive ? 'shimmer 3s ease-in-out infinite' : 'none',
                        }}
                    />
                </div>

                {/* Depth shadow effect */}
                <div
                    className="absolute inset-0 pointer-events-none transition-all duration-700"
                    style={{
                        opacity: isActive ? 0.3 : 0.15,
                        background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0, 0, 0, 0.1) 70%)',
                        filter: 'blur(30px)',
                        transform: 'translateY(20px)',
                    }}
                />
            </div>
        </div>
    );
};

export default LogoBackground;
