import React from 'react';

type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: React.CSSProperties['animationDuration'];
  freeze?: boolean;
};

const StarBorder = <T extends React.ElementType = 'button'>({
  as,
  className = '',
  color = 'white',
  speed = '6s',
  freeze = false,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || 'button';
  const thickness = 1;
  const lightLengthPercent = 27;
  const lightLength = `${lightLengthPercent}%`;
  const blurRadius = 2;
  const glowRadius = 6;

  return (
    <Component
      className={`relative block rounded-[20px] p-px ${className}`}
      {...(rest as any)}
      style={{
        ...(rest as any).style
      }}
    >
      {/* Static border */}
      <div 
        className="absolute inset-0 rounded-[20px] pointer-events-none opacity-30 border-2"
        style={{
          borderColor: color,
        }}
      />
      
      {/* Border container */}
      <div className="absolute inset-0 pointer-events-none rounded-[20px]">
        {/* Top border light */}
        <div
          className={`absolute top-0 left-0 ${freeze ? '' : 'animate-border-top'}`}
          style={{
            width: lightLength,
            height: `${thickness}px`,
            background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
            opacity: 0,
            filter: `blur(${blurRadius}px)`,
            boxShadow: `0 0 ${glowRadius}px ${color}`,
            animationDuration: freeze ? undefined : speed,
            animationFillMode: freeze ? undefined : 'both',
          }}
        />
        
        {/* Right border light */}
        <div
          className={`absolute right-0 top-0 ${freeze ? '' : 'animate-border-right'}`}
          style={{
            height: lightLength,
            width: `${thickness}px`,
            background: `linear-gradient(180deg, transparent 0%, ${color} 50%, transparent 100%)`,
            opacity: 0,
            filter: `blur(${blurRadius}px)`,
            boxShadow: `0 0 ${glowRadius}px ${color}`,
            animationDuration: freeze ? undefined : speed,
            animationFillMode: freeze ? undefined : 'both',
            animationDelay: `calc(${speed} * 0.25)`,
          }}
        />
        
        {/* Bottom border light */}
        <div
          className={`absolute bottom-0 left-0 ${freeze ? '' : 'animate-border-bottom'}`}
          style={{
            width: lightLength,
            height: `${thickness}px`,
            background: `linear-gradient(270deg, transparent 0%, ${color} 50%, transparent 100%)`,
            opacity: 0,
            filter: `blur(${blurRadius}px)`,
            boxShadow: `0 0 ${glowRadius}px ${color}`,
            animationDuration: freeze ? undefined : speed,
            animationFillMode: freeze ? undefined : 'both',
            animationDelay: `calc(${speed} * 0.5)`,
          }}
        />
        
        {/* Left border light */}
        <div
          className={`absolute left-0 top-0 ${freeze ? '' : 'animate-border-left'}`}
          style={{
            height: lightLength,
            width: `${thickness}px`,
            background: `linear-gradient(0deg, transparent 0%, ${color} 50%, transparent 100%)`,
            opacity: 0,
            filter: `blur(${blurRadius}px)`,
            boxShadow: `0 0 ${glowRadius}px ${color}`,
            animationDuration: freeze ? undefined : speed,
            animationFillMode: freeze ? undefined : 'both',
            animationDelay: `calc(${speed} * 0.75)`,
          }}
        />
      </div>
      
      {/* Content */}
      <div 
        className="relative z-10 w-full h-full text-base text-white py-4 px-[26px] box-border rounded-[calc(20px-1px)]"
        style={{
          background: 'rgba(0, 0, 0, 0.52)',
          borderRadius: `calc(20px - ${thickness}px)`,
        }}
      >
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
