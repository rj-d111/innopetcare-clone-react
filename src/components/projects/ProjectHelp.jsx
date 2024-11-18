import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import ProjectFooter from "./ProjectFooter";

export default function ProjectHelp() {
  const db = getFirestore();
  const [projectId, setProjectId] = useState("");
  const [isAnimalShelter, setAnimalShelter] = useState(false);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const { slug } = useParams();
  const headerColor = ownerDetails?.headerColor || '#F59E0B';


  // Fetch owner details from Firestore
  useEffect(() => {
    const fetchOwnerDetails = async () => {
      try {
        const globalSectionsQuery = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const globalSectionsSnapshot = await getDocs(globalSectionsQuery);

        if (!globalSectionsSnapshot.empty) {
          const globalSectionDoc = globalSectionsSnapshot.docs[0];
          const ownerData = globalSectionDoc.data();


          setOwnerDetails(ownerData);
          setProjectId(globalSectionDoc.id);
        }
      } catch (error) {
        console.error("Error fetching owner details:", error);
      }
    };

    if (slug) {
      fetchOwnerDetails();
    }
  }, [slug, db]);

  // Fetch project type when projectId is set
  useEffect(() => {
    const fetchProjectType = async () => {
      if (!projectId) return;

      try {
        const projectDocRef = doc(db, "projects", projectId);
        const projectDoc = await getDoc(projectDocRef);

        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          setAnimalShelter(projectData.type === "Animal Shelter Site");
        }
      } catch (error) {
        console.error("Error fetching project type:", error);
      }
    };

    fetchProjectType();
  }, [projectId, db]);

  return (
    <>
      <div className="container mx-auto p-6 rounded-lg max-w-2xl">
        {isAnimalShelter ? (
          // Content for Animal Shelter
          <>
            <h2
              className="text-3xl font-bold text-center mb-4"
              style={{ color: headerColor }}
            >
              Help Information for {ownerDetails?.name || "Animal Shelter Site"}
            </h2>
            <section>
              <h3 className="font-semibold text-lg mb-2">Getting Started</h3>
              <p>
                <span className="font-bold">User Registration:</span> To create
                your account, click the "For Animal Shelter Admin" button on the
                homepage. Fill in the required details, including your email
                address, password, and organization information.
              </p>
              <p>
                <span className="font-bold">Initial Setup:</span> After
                registration, complete your shelter profile by adding essential
                information such as shelter name, address, contact details, and
                shelter description.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mt-6 mb-2">
                Managing Your Profile
              </h3>
              <p>
                <span className="font-bold">Updating Information:</span> Visit
                the "User Profile" section to update your personal and shelter
                details, including contact information and profile photo.
              </p>
              <p>
                <span className="font-bold">Changing Password:</span> To secure
                your account, navigate to "Privacy Settings" and select the
                "Change Password" option to set a new password.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mt-6 mb-2">
                Adoption Process
              </h3>
              <p>
                <span className="font-bold">Inquiring About Adoption:</span>{" "}
                Potential adopters can browse pets available for adoption and
                send inquiries through the Connected Care Center.
              </p>
              <p>
                <span className="font-bold">
                  Scheduling Appointments for Adoption:
                </span>{" "}
                Use the "Schedule Appointments" feature to arrange in-person
                visits for adopters to meet the pets.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mt-6 mb-2">
                Using Scheduling Tools
              </h3>
              <p>
                <span className="font-bold">Scheduling Appointments:</span>{" "}
                Organize adoption visits, volunteer shifts, visitor
                appointments, and supply donation drop-offs using the "Schedule
                Appointments" feature.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mt-6 mb-2">
                Feedback and Reports
              </h3>
              <p>
                <span className="font-bold">Submitting Feedback:</span> Share
                your insights and suggestions using the "Feedback" option in the
                Help section.
              </p>
              <p>
                <span className="font-bold">
                  Submitting a Report for Issues:
                </span>{" "}
                If you encounter any issues with the platform, go to the "Submit
                Report" section in the Help menu. Provide a detailed description
                of the issue, and our support team will address it promptly.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mt-6 mb-2">
                Data Privacy and Security
              </h3>
              <p>
                <span className="font-bold">Data Management:</span> Ensure
                compliance with data privacy regulations by reviewing and
                managing user consent and information in the "Privacy Settings"
                section.
              </p>
            </section>

            <div className="w-full max-w-2xl mx-auto mt-10">
              <h2 className="text-3xl font-bold text-center mb-8">FAQs</h2>
              {/* FAQ 1 */}
              <div
                tabIndex={0}
                className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4"
              >
                <div className="collapse-title text-lg font-semibold">
                  How do I create an account?
                </div>
                <div className="collapse-content">
                  <p>
                    Click the "For Animal Shelter Admin" button on the homepage,
                    enter your email, set a password, and complete the
                    registration form.
                  </p>
                </div>
              </div>
              {/* FAQ 2 */}
              <div
                tabIndex={0}
                className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4"
              >
                <div className="collapse-title text-lg font-semibold">
                  What should I do if I forget my password?
                </div>
                <div className="collapse-content">
                  <p>
                    Click the "Forgot Password?" link on the login page, enter
                    your email, and follow the reset instructions sent to your
                    inbox.
                  </p>
                </div>
              </div>
              {/* FAQ 3 */}
              <div
                tabIndex={0}
                className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4"
              >
                <div className="collapse-title text-lg font-semibold">
                  How do I schedule appointments for adoptions or donations?
                </div>
                <div className="collapse-content">
                  <p>
                    Go to the "Schedule Appointments" section, select the
                    appointment type, and fill in the necessary details.
                  </p>
                </div>
              </div>
              {/* FAQ 4 */}
              <div
                tabIndex={0}
                className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4"
              >
                <div className="collapse-title text-lg font-semibold">
                  How do adopters inquire about available pets?
                </div>
                <div className="collapse-content">
                  <p>
                    Adopters can use the Connected Care Center to send inquiries
                    about specific pets. Shelter admins can reply to guide them
                    through the adoption process.
                  </p>
                </div>
              </div>
              {/* FAQ 5 */}
              <div
                tabIndex={0}
                className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4"
              >
                <div className="collapse-title text-lg font-semibold">
                  What should I do if I encounter a technical issue?
                </div>
                <div className="collapse-content">
                  <p>
                    Navigate to the "Submit Report" section in the Help menu,
                    describe the issue in detail, and submit it for assistance.
                  </p>
                </div>
              </div>
              {/* FAQ 6 */}
              <div
                tabIndex={0}
                className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4"
              >
                <div className="collapse-title text-lg font-semibold">
                  How do I submit feedback about the platform?
                </div>
                <div className="collapse-content">
                  <p>
                    Navigate to the "Feedback" section under Help or contact our
                    support team directly.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Content for Veterinary Clinic
          <>
            <h2
              className="text-3xl font-bold mb-4 text-center"
              style={{ color: headerColor }}
            >
              Help Information for {ownerDetails?.name || "Veterinary Site"}
            </h2>
            <section>
              <h3 className="font-semibold text-lg mb-2">Getting Started</h3>
              <p>
                <span className="font-bold">
                  User Registration for Pet Owners:
                </span>{" "}
                If you’re a pet owner and a client of the clinic, click the
                "Register" button on the homepage. Fill out the required
                details, including your name, email address, and password to
                create your account.
              </p>
              <p>
                <span className="font-bold">Logging In:</span> To access your
                account, click the "Login" button on the homepage, enter your
                registered email and password, and sign in.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-lg mt-6 mb-2">
                Managing Your Profile
              </h3>
              <p>
                <span className="font-bold">Updating Information:</span> Go to
                the User Profile section to update your personal information,
                contact details, and profile picture.
              </p>
              <p>
                <span className="font-bold">Changing Password:</span> Navigate
                to "Privacy Settings" to securely update your password.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mt-6 mb-2">
                Appointments and Feedback
              </h3>
              <p>
                <span className="font-bold">Booking Appointments:</span> Pet
                owners can request consultations or check-ups through the
                Appointment Scheduler.
              </p>
              <p>
                <span className="font-bold">Submitting Feedback:</span> Use the
                Feedback Form available in the Help Section to share your
                thoughts.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mt-6 mb-2">
                Data Privacy and Security
              </h3>
              <p>
                <span className="font-bold">Data Management:</span> We
                prioritize your data privacy. Review and manage your data
                preferences in the Privacy Settings section of your profile.
              </p>
              <p>
                <span className="font-bold">Security Tips:</span> Keep your
                login credentials secure and update your password periodically
                in the Privacy Settings.
              </p>
            </section>

            <div className="w-full max-w-2xl mx-auto mt-10">
              <h2 className="text-3xl font-bold text-center mb-8">FAQs</h2>
              {/* FAQ 1 */}
              <div
                tabIndex={0}
                className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4"
              >
                <div className="collapse-title text-lg font-semibold">
                  How do I create an account?
                </div>
                <div className="collapse-content">
                  <p>
                    If you're a pet owner, click the "Register" button on the
                    homepage and fill out the required information to create an
                    account.
                  </p>
                </div>
              </div>
              {/* FAQ 2 */}
              <div
                tabIndex={0}
                className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4"
              >
                <div className="collapse-title text-lg font-semibold">
                  What should I do if I forget my password?
                </div>
                <div className="collapse-content">
                  <p>
                    Click the "Forgot Password?" link on the login page, enter
                    your registered email address, and follow the instructions
                    sent to your inbox.
                  </p>
                </div>
              </div>
              {/* FAQ 3 */}
              <div
                tabIndex={0}
                className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4"
              >
                <div className="collapse-title text-lg font-semibold">
                  How do I update my pet's information?
                </div>
                <div className="collapse-content">
                  <p>
                    Go to the Pet Records section in your profile, select your
                    pet's record, and update the necessary details.
                  </p>
                </div>
              </div>
              {/* FAQ 4 */}
              <div
                tabIndex={0}
                className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4"
              >
                <div className="collapse-title text-lg font-semibold">
                  How do I submit feedback or a report?
                </div>
                <div className="collapse-content">
                  <p>
                    Navigate to the Help Section and choose either Submit
                    Feedback to share your suggestions or Submit Report to
                    highlight any issues.
                  </p>
                </div>
              </div>
              {/* FAQ 5 */}
              <div
                tabIndex={0}
                className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4"
              >
                <div className="collapse-title text-lg font-semibold">
                  What if I encounter technical issues?
                </div>
                <div className="collapse-content">
                  <p>
                    Check our troubleshooting guide in the Help Section. If the
                    problem persists, reach out to our support team for
                    assistance.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <ProjectFooter />
    </>
  );
}
