import React, { useState, useEffect } from "react";
import { addDoc, updateDoc, doc, collection, getDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { ref, getStorage, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";

export default function DonationSectionModal({ projectId, closeModal, onSectionAdded, selectedSection }) {
  const [title, setTitle] = useState("");
  const [subtext, setSubtext] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("carousel");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0); // Track the current slide index
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedSection) {
      setTitle(selectedSection.sectionTitle);
      setSubtext(selectedSection.sectionSubtext);
      setContent(selectedSection.sectionContent);
      setType(selectedSection.sectionType);
      setImagePreviews(selectedSection.sectionImages || []);
      setCurrentSlide(0); // Reset slide index when a new section is loaded
    } else {
      setTitle("");
      setSubtext("");
      setContent("");
      setType("carousel");
      setImagePreviews([]);
      setCurrentSlide(0);
    }
  }, [selectedSection]);

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImages(selectedFiles);

    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previewUrls);
    setCurrentSlide(0); // Reset to the first slide
  };

  const deleteExistingImages = async () => {
    if (selectedSection && selectedSection.sectionImages) {
      const storage = getStorage();
      const deletePromises = selectedSection.sectionImages.map((url) => {
        const imageRef = ref(storage, url);
        return deleteObject(imageRef).catch((error) => {
          console.error("Error deleting image from storage:", error);
        });
      });
      await Promise.all(deletePromises);
    }
  };

  const uploadImages = async () => {
    const storage = getStorage();
    const imageUrls = await Promise.all(
      images.map((image) => {
        const imageRef = ref(storage, `donations/${uuidv4()}-${image.name}`);
        const uploadTask = uploadBytesResumable(imageRef, image);

        return new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      })
    );
    return imageUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
  
    try {
      // Retain existing images if no new images are uploaded
      let imageUrls = selectedSection?.sectionImages || [];
  
      // If new images are selected, delete existing images and upload new ones
      if (images.length > 0) {
        await deleteExistingImages();
        imageUrls = await uploadImages();
      }
  
      const sectionData = {
        sectionTitle: title,
        sectionSubtext: subtext,
        sectionContent: content,
        sectionType: type,
        sectionImages: imageUrls, // Use existing images if no new ones were uploaded
        projectId,
      };

          // Add the `sectionCreated` field only if creating a new section
    if (!selectedSection) {
        sectionData.sectionCreated = new Date(); // Set to the current date and time
      }
  
      if (selectedSection) {
        const sectionDocRef = doc(db, "donations", projectId, "sections", selectedSection.id);
        await updateDoc(sectionDocRef, sectionData);
        toast.success("Section successfully updated");
      } else {
        const sectionsCollectionRef = collection(db, "donations", projectId, "sections");
        await addDoc(sectionsCollectionRef, sectionData);
        toast.success("Section successfully added");
      }
  
      onSectionAdded();
      closeModal();
    } catch (error) {
      console.error("Error adding/updating section:", error);
      toast.error("Failed to save section");
    } finally {
      setIsSaving(false);
    }
  };
  

  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % imagePreviews.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? imagePreviews.length - 1 : prevSlide - 1
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Donations Page Section</h2>
        <IoClose className="text-red-600 text-2xl cursor-pointer" onClick={closeModal} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-6">
        {/* Left Column: Form Inputs */}
        <div className="w-1/2 flex flex-col space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Subtext</label>
            <input
              type="text"
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium">Images (Multiple Allowed)</label>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="carousel">Carousel</option>
              <option value="grid">Grid</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center"
            disabled={isSaving}
          >
            {isSaving ? <Spinner /> : selectedSection ? "Update Section" : "Save Section"}
          </button>
        </div>
  
        {/* Right Column: Web Preview */}
        <div className="w-1/2 h-[70vh] overflow-auto">
          <div className="mockup-window border border-base-300">
            <div className="border-t border-base-300 flex flex-col items-center p-8">
              <h3 className="text-lg font-semibold text-center">{title || "Section Title"}</h3>
              <p className="text-sm text-gray-600 mb-4 text-center">{subtext || "Section Subtext"}</p>
              <p className="text-[0.5rem] text-left w-full mb-4">{content || "Content goes here..."}</p>
              {imagePreviews.length > 0 ? (
                type === "carousel" ? (
                  <div className="carousel w-full relative">
                    <img src={imagePreviews[currentSlide]} alt={`Slide ${currentSlide + 1}`} className="w-full" />
                    <div className="absolute left-5 right-5 top-1/2 transform -translate-y-1/2 flex justify-between">
                      <button type="button" onClick={handlePrevSlide} className="btn btn-circle">❮</button>
                      <button type="button" onClick={handleNextSlide} className="btn btn-circle">❯</button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {imagePreviews.map((url, index) => (
                      <img key={index} src={url} alt={`Grid ${index + 1}`} className="w-full h-40 object-cover" />
                    ))}
                  </div>
                )
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center mt-4 rounded-lg">
                  <span className="text-gray-400">Image Preview</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
  
  );
}
