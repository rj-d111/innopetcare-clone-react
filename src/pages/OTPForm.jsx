import React, { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase"; // Adjust the path to your Firebase config
import { toast } from "react-toastify";

const OTPForm = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);

  const sendOtp = async () => {
    if (!email) {
      toast.error("Please enter a valid email.");
      return;
    }

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP

    try {
      const sendOtpFunction = httpsCallable(functions, "sendOtp");
      await sendOtpFunction({ email, otp: generatedCode });
      setGeneratedOtp(generatedCode); // Store OTP locally for verification
      toast.success("OTP sent to your email!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    }
  };

  const verifyOtp = () => {
    if (otp === generatedOtp) {
      toast.success("OTP verified successfully!");
      // Proceed to the next step
    } else {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="otp-container">
      <h2>Verify Email</h2>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="input"
        />
      </div>

      <div className="form-group">
        <label>OTP</label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter the OTP"
          className="input"
        />
      </div>

      <div className="button-group">
        <button onClick={sendOtp} className="btn send-otp">
          Send OTP
        </button>
        <button onClick={verifyOtp} className="btn verify-otp">
          Verify OTP
        </button>
      </div>
    </div>
  );
};

export default OTPForm;
