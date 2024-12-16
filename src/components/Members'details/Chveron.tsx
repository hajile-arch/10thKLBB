import React from "react";

interface ChevronProps {
  count: number; // Number of chevron lines to display
  color?: string; // Color of the chevron lines
  size?: number; // Size of the chevron
}

const Chevron: React.FC<ChevronProps> = ({ count, color = "white", size = 20 }) => {
  return (
    <div
      style={{
        position: "relative",
        width: size * 5,
        height: size * 2.5,
        backgroundColor: "black",
        clipPath: "polygon(50% 0, 100% 30%, 100% 100%, 0 100%, 0 30%)",
        display: "flex",
        flexDirection: "column-reverse",
        alignItems: "center",
        justifyContent: "flex-start",
        overflow: "hidden",
      }}
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: i * 8 + "%",
            width: "80%",
            height: "8%",
            borderBottom: `${size / 10}px solid ${color}`,
          }}
        />
      ))}
    </div>
  );
};

export default Chevron;
