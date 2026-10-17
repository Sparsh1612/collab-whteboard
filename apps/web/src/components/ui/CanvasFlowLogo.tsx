import React from 'react';

interface CanvasFlowLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

export const CanvasFlowLogo: React.FC<CanvasFlowLogoProps> = ({
  size = 20,
  className = '',
  showWordmark = true,
}) => {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Geometric CanvasFlow Mark: Flowing continuous node connector */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 text-blue-500 transition-transform duration-fast"
      >
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="2"
          fill="currentColor"
          fillOpacity="0.95"
        />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="2"
          fill="currentColor"
          fillOpacity="0.95"
        />
        <path
          d="M10 6.5C14 6.5 14 17.5 17.5 17.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {showWordmark && (
        <span className="text-sm font-semibold tracking-tight text-white">
          Canvas<span className="text-blue-500 font-semibold">Flow</span>
        </span>
      )}
    </div>
  );
};
