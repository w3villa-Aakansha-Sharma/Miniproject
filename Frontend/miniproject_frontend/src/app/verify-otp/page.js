"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Style/verifyotp.css';

const OtpVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      localStorage.setItem('usertoken', token);
    } else {
      setErrorMessage('Token is missing or invalid');
    }
  }, [token]);

  const handleMobileNumberChange = (e) => {
    setMobileNumber(e.target.value);
  };

  const handleMobileNumberSubmit = async (e) => {
    e.preventDefault();

    if (!mobileNumber) {
      setErrorMessage('Mobile number is required');
      return;
    }

    if (!token) {
      setErrorMessage('Token is missing or invalid');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/send-otp', { mobileNumber, token });
      setOtpSent(true);
      setShowOtpForm(true);
      setMessage(response.data.msg);
      toast.success(response.data.msg, { icon: false, position: "top-center" });
    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrorMessage(error.response?.data?.msg || 'An error occurred while sending OTP');
      toast.error(error.response?.data?.msg || 'An error occurred while sending OTP', { icon: false, position: "top-center" });
    }
  };

  const handleChange = (e, index) => {
    const { value } = e.target;
    const newOtp = [...otp];
    newOtp[index] = value;

    if (value.length === 1 && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }

    if (value.length === 0 && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }

    setOtp(newOtp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (!token) {
      setErrorMessage('Token is missing or invalid');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/verify-otp', { otp: otpString, token });
      const { token: jwtToken } = response.data;
      if (jwtToken) {
        localStorage.setItem('authToken', jwtToken);
      }
      setMessage(response.data.msg);
      toast.success(response.data.msg, { icon: false, position: "top-center" });
      router.push(`/profile-upload?token=${token}`);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setErrorMessage(error.response?.data?.msg || 'An error occurred during OTP verification');
      toast.error(error.response?.data?.msg || 'An error occurred during OTP verification', { icon: false, position: "top-center" });
    }
  };

  const handleResendOtp = async () => {
    if (!token) {
      setResendMessage('Token is missing or invalid');
      toast.error('Token is missing or invalid', { icon: false, position: "top-center" });
      return;
    }

    setIsResending(true);
    setResendMessage('');

    try {
      const response = await axios.post('http://localhost:8000/api/resend-otp', { token });
      setResendMessage(response.data.msg || 'OTP has been resent.');
      toast.success(response.data.msg || 'OTP has been resent.', { icon: false, position: "top-center" });
    } catch (error) {
      console.error('Error resending OTP:', error);
      setResendMessage(error.response?.data?.msg || 'An error occurred while resending OTP.');
      toast.error(error.response?.data?.msg || 'An error occurred while resending OTP.', { icon: false, position: "top-center" });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="containers outer-container">
      <ToastContainer />
      <h1>We need to verify your Mobile Number</h1>
      <h4>Please enter your mobile number to receive an OTP</h4>

      {!showOtpForm ? (
        <div className="container">
          <div className="mobileNumberBox">
            <h2>Enter Mobile Number</h2>
            <form onSubmit={handleMobileNumberSubmit}>
              <div className="mobileNumberInputContainer">
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={handleMobileNumberChange}
                  placeholder="Enter your mobile number"
                  className="mobileNumberInput"
                />
              </div>
              <button type="submit" className="submitButton">Send OTP</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="container">
          <div className="otpBox">
            <h2>OTP Verification</h2>
            <form onSubmit={handleSubmit}>
              <div className="otpInputContainer">
                {otp.map((value, index) => (
                  <input
                    key={index}
                    autoComplete='off'
                    id={`otp-input-${index}`}
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(e, index)}
                    maxLength="1"
                    className="otpInput"
                  />
                ))}
              </div>
              <button type="submit" className="submitButton">Verify OTP</button>
            </form>

            <br />
            <p>
              Didn't receive the OTP?{' '}
              <button onClick={handleResendOtp} disabled={isResending} className="resendButton">
                {isResending ? 'Resending OTP...' : 'Resend OTP'}
              </button>
            </p>
            {resendMessage && <p className="resendMessage">{resendMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default OtpVerification;
