import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Assuming you're using react-router for slug in URL
import { collection, query, where, getDocs } from "firebase/firestore"; // Firestore imports for querying documents
import { db } from '../firebase'; // Import your Firebase configuration

export default function TermsConditions() {
    const pathname = window.location.href;
    const parts = pathname.split("sites/");
    var slug;
    
    if (parts.length > 1) {
      slug = parts[1].split("/")[0];
    }

    const [clinicName, setClinicName] = useState('');

    useEffect(() => {
        const fetchClinicName = async () => {
            try {
                // Query Firestore to get the clinic data based on the slug
                console.log(slug);
                const clinicQuery = query(collection(db, "global-sections"), where("slug", "==", slug));
                const querySnapshot = await getDocs(clinicQuery);

                if (!querySnapshot.empty) {
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        setClinicName(data.name); // Set the clinic name from Firestore
                    });
                } else {
                    console.log("No clinic found with the provided slug.");
                }
            } catch (error) {
                console.error("Error fetching clinic data:", error);
            }
        };

        fetchClinicName();
    }, [slug]);

    return (
        <>
            <section id="terms">
                <div className="bg-white"> {/* Removed dark:bg-slate-900 */}
                    <div className="max-w-2xl mx-auto p-5">
                        <h1 className="text-3xl font-semibold mb-4 text-blue-500 text-center">
                            {clinicName} Terms and Conditions {/* Dynamically use the clinic name */}
                        </h1>
                        <p className="text-gray-600">
                            Welcome to {clinicName}. By accessing or using our services, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
                        </p>
                        <section className="my-6">
                            <h2 className="text-lg font-semibold">General</h2>
                            <p className="text-gray-600">
                                These terms and conditions govern your use of {clinicName}’s website and services.
                            </p>
                            <p className="text-gray-600">We require 24 hours' notice for any cancellations or rescheduling.</p>
                        </section>
                        <section className="mb-6">
                            <h2 className="text-lg font-semibold">Services</h2>
                            <p className="text-gray-600">
                                It is your responsibility to arrive on time for your appointment. If you are late, we may need to reschedule your appointment to ensure other clients are not inconvenienced.
                            </p>
                            <p className="text-gray-600">
                                We reserve the right to refuse treatment to any animal if it is deemed necessary for health, safety, or ethical reasons.
                            </p>
                        </section>
                        <section className="mb-6">
                            <h2 className="text-lg font-semibold">Medical Records</h2>
                            <p className="text-gray-600">
                                {clinicName} will take all reasonable care in providing services to your pet. However, we cannot be held liable for any unforeseen complications or adverse reactions resulting from treatments.
                            </p>
                            <p className="text-gray-600">
                                You agree to indemnify and hold {clinicName} harmless from any claims, damages, or expenses arising from your use of our services.
                            </p>
                        </section>
                        <section className="mb-6">
                            <h2 className="text-lg font-semibold">Privacy</h2>
                            <p className="text-gray-600">
                                We are committed to protecting your privacy. All personal information collected will be used in accordance with our Privacy Policy.
                            </p>
                            <p className="text-gray-600">
                                We may use your contact information to send you updates, reminders, and promotional materials related to our services.
                            </p>
                        </section>
                        <section className="mb-6">
                            <h2 className="text-lg font-semibold">Changes to Terms</h2>
                            <p className="text-gray-600">
                                {clinicName} reserves the right to modify these terms and conditions at any time. Any changes will be posted on our website and will become effective immediately.
                            </p>
                            <p className="text-gray-600">
                                Your continued use of our services after any changes constitutes your acceptance of the new terms and conditions.
                            </p>
                        </section>
                        <section className="mb-6">
                            <h2 className="text-lg font-semibold">Governing Law</h2>
                            <p className="text-gray-600">
                                These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which {clinicName} operates.
                            </p>
                            <p className="text-gray-600">
                                Any disputes arising out of or in connection with these terms and conditions shall be subject to the exclusive jurisdiction of the courts in that jurisdiction.
                            </p>
                        </section>
                    </div>
                </div>
            </section>
        </>
    );
}
