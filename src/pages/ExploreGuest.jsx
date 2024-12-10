import React from "react";

export default function ExploreGuest() {
  return (
    <div className="px-4 md:px-16 py-10">
      {/* First Section */}
      <div className="mb-16">
        <h1 className="text-2xl md:text-4xl font-bold text-yellow-800 text-center mb-10">
          Explore InnoPetCare
        </h1>
        <div className="carousel w-full h-[75vh]">
          <div id="item1" className="carousel-item w-full ">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/fbpQjWWxtM8"
              title="InnoPetCare"
              className="rounded-lg"
              allowFullScreen
            ></iframe>
          </div>
          <div id="item2" className="carousel-item w-full">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/qSrWOFENK1U"
              title="InnoPetCare Site Overview"
              className="rounded-lg"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        <div className="flex w-full justify-center gap-2 py-2">
          <a href="#item1" className="btn bg-yellow-800 text-white hover:bg-yellow-900">
            1
          </a>
          <a href="#item2" className="btn bg-yellow-800 text-white hover:bg-yellow-900">
            2
          </a>
        </div>
      </div>

      {/* Another Section */}
      <div className="mb-16">
        <h1 className="text-2xl md:text-4xl font-bold text-yellow-800 text-center mb-10">
          How to Create a Veterinary Clinic or Animal Shelter Site
        </h1>
        <div className="text-center h-[80vh]">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/axEFDOKeBtk"
            title="How to Create a Veterinary Clinic or Animal Shelter Site in InnoPetCare CMS site"
            className="rounded-lg"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Another Section */}
      <div className="mb-16">
        <h1 className="text-2xl md:text-4xl font-bold text-yellow-800 text-center mb-10">
          InnoPetCare App
        </h1>
        <div className="w-full flex justify-center h-[70vh] align-middle">
          <div className="carousel carousel-center bg-neutral rounded-box space-x-4 p-4">
            <div className="carousel-item">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/KVTFzqDwrP4"
                title="InnoPetCareApp Overview"
                className="rounded-box"
                allowFullScreen
              ></iframe>
            </div>
            <div className="carousel-item">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/wrhqs893spM"
                title="Login as Veterinary Clinic User in InnoPetCare App"
                className="rounded-box"
                allowFullScreen
              ></iframe>
            </div>
            <div className="carousel-item">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/syIu3ZzdHDY"
                title="Login as Animal Shelter User in InnoPetCare App"
                className="rounded-box"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
