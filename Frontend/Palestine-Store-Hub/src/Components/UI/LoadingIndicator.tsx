import React from "react";
import { MdShoppingBag } from "react-icons/md";

interface LoadingIndicatorProps {
  message: string;
  style?: React.CSSProperties;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message, style }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute", // Relative to the parent container
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.8)", // Slightly transparent
        ...style,
      }}
    >
      <MdShoppingBag
        size={60}
        color="#0078D7"
        style={{
          animation: "bounce 1s ease-in-out infinite",
        }}
      />
      <p
        style={{
          fontSize: "18px",
          color: "#333",
          fontWeight: "600",
          margin: "16px 0 0",
        }}
      >
        {message}
      </p>
      <style>
        {`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-15px);
            }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingIndicator;
