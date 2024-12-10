import React, { useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight  } from "react-icons/md";


function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative">
      <div className="w-full h-60 bg-gray-200 rounded-lg overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={`Post image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Render buttons only if there are more than one image */}
      {images.length > 1 && (
        <>
          {/* Left Button */}
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
          >
            <MdKeyboardArrowLeft />
          </button>
          {/* Right Button */}
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
          >
            <MdKeyboardArrowRight />
          </button>
        </>
      )}
    </div>
  );
}

export default ImageCarousel;
