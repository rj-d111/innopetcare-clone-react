// CanvasDisplay.js
import React from "react";
import CanvasWeb from "../components/design/CanvasWeb";
import CanvasMobile from "../components/design/CanvasMobile";

const CanvasDisplay = ({ isWebVersion, formData, imagePreview }) => {
  return (
    <div className="h-[calc(100vh-64px)] overflow-auto w-full">
      {isWebVersion ? (
        <CanvasWeb formData={formData} imagePreview={imagePreview} />
      ) : (
        <CanvasMobile />
      )}
    </div>
  );
};

export default CanvasDisplay;
