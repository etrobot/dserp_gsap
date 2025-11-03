import React from 'react';

type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: React.CSSProperties['animationDuration'];
  thickness?: number;
  freeze?: boolean;
};

const StarBorder = <T extends React.ElementType = 'button'>({
  as,
  className = '',
  color = 'white',
  speed = '6s',
  thickness = 1,
  freeze = false,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || 'button';
  const lightLengthPercent = 27;
  const lightLength = `${lightLengthPercent}%`;
  const blurRadius = 2;
  const glowRadius = 6;
  const sharedLightStyles = {
    opacity: 0,
    filter: `blur(${blurRadius}px)`,
    boxShadow: `0 0 ${glowRadius}px ${color}`,
    animationDuration: freeze ? undefined : speed,
    animationFillMode: freeze ? undefined : 'both',
    ['--border-light-length' as const]: lightLength,
  } as React.CSSProperties;

  return (
    <Component
      className={`relative block rounded-[20px] ${className}`}
      {...(rest as any)}
      style={{
        padding: `${thickness}px`,
        ...(rest as any).style
      }}
    >
      {/* Static border */}
      <div 
        className="absolute inset-0 rounded-[20px] pointer-events-none"
        style={{
          border: `${thickness}px solid rgba(100, 100, 100, 0.3)`,
        }}
      />
      
      {/* Border container */}
      <div className="absolute inset-0 pointer-events-none rounded-[20px]">
        {/* Top border light */}
        <div
          className={`absolute ${freeze ? '' : 'animate-border-top'}`}
          style={{
            top: 0,
            left: 0,
            width: lightLength,
            height: `${thickness}px`,
            background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
            ...sharedLightStyles,
          }}
        />
        
        {/* Right border light */}
        <div
          className={`absolute ${freeze ? '' : 'animate-border-right'}`}
          style={{
            right: 0,
            top: 0,
            height: lightLength,
            width: `${thickness}px`,
            background: `linear-gradient(180deg, transparent 0%, ${color} 50%, transparent 100%)`,
            animationDelay: `calc(${speed} * 0.25)`,
            ...sharedLightStyles,
          }}
        />
        
        {/* Bottom border light */}
        <div
          className={`absolute ${freeze ? '' : 'animate-border-bottom'}`}
          style={{
            bottom: 0,
            left: 0,
            width: lightLength,
            height: `${thickness}px`,
            background: `linear-gradient(270deg, transparent 0%, ${color} 50%, transparent 100%)`,
            animationDelay: `calc(${speed} * 0.5)`,
            ...sharedLightStyles,
          }}
        />
        
        {/* Left border light */}
        <div
          className={`absolute ${freeze ? '' : 'animate-border-left'}`}
          style={{
            left: 0,
            top: 0,
            height: lightLength,
            width: `${thickness}px`,
            background: `linear-gradient(0deg, transparent 0%, ${color} 50%, transparent 100%)`,
            animationDelay: `calc(${speed} * 0.75)`,
            ...sharedLightStyles,
          }}
        />
      </div>
      
      {/* Content */}
      <div 
        className="relative z-10 text-white text-[16px] py-[16px] px-[26px]"
        style={{
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.52)',
          boxSizing: 'border-box',
          borderRadius: `calc(20px - ${thickness}px)`,
        }}
      >
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;

// tailwind.config.js
// module.exports = {
//   theme: {
//     extend: {
//       animation: {
//         'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
//         'star-movement-top': 'star-movement-top linear infinite alternate',
//       },
//       keyframes: {
//         'star-movement-bottom': {
//           '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
//           '100%': { transform: 'translate(-100%, 0%)', opacity: '0' },
//         },
//         'star-movement-top': {
//           '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
//           '100%': { transform: 'translate(100%, 0%)', opacity: '0' },
//         },
//       },
//     },
//   }
// }
