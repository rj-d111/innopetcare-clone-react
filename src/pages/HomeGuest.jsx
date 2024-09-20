import React from "react";

export default function HomeGuest() {
  return (
    <section
      className="bg-cover bg-center pt-40"
      style={{ backgroundImage: "url('images/background-pet.jpg')" }}
    >
      <div className="container mx-auto text-center py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          Your furry friends deserve the best.
        </h1>
        <p className="text-xl md:text-2xl text-white mt-4">
          Create a website that reflects your passion for animal care with our
          easy-to-use CMS. No coding required!
        </p>
        <a
          href="/login"
          className="inline-block mt-8 bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold"
        >
          Get Started
        </a>
      </div>
    </section>
  );
}
