"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import '../Style/signup.css';
import Link from 'next/link';
import { FaGoogle, FaFacebookF, FaLinkedinIn } from 'react-icons/fa'; // Import icons
import { useRouter } from 'next/navigation';


export default function RegisterForm() {
    const route = useRouter();
    const token = localStorage.getItem('authToken');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [isRegistering, setIsRegistering] = useState(false);
    const [showResendButton, setShowResendButton] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [showResendNote, setShowResendNote] = useState(false);
    const [timer, setTimer] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);
    const [isRegisterButtonClicked, setIsRegisterButtonClicked] = useState(false);
    const [socialSignup, setSocialSignup] = useState(false);

    useEffect(() => {
        if (timer === 0 && showResendNote) {
            setShowResendButton(true);
        }
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            setTimerInterval(interval);
            return () => clearInterval(interval);
        }
    }, [timer, showResendNote]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const errorList = [];
        
        // Password validation regex
        const passwordValidation = {
            length: /.{8,}/, // At least 8 characters long
            uppercase: /[A-Z]/, // Contains at least one uppercase letter
            lowercase: /[a-z]/, // Contains at least one lowercase letter
            number: /[0-9]/, // Contains at least one number
            specialChar: /[!@#$%^&*(),.?":{}|<>]/, // Contains at least one special character
        };
    
        if (formData.password !== formData.confirmPassword) {
            errorList.push("Passwords do not match.");
            return errorList; // Return immediately after finding the first error
        }
    
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errorList.push("Invalid email address.");
            return errorList; // Return after finding an email validation error
        }
    
        if (!passwordValidation.length.test(formData.password)) {
            errorList.push("Password must be at least 8 characters long.");
            return errorList; // Return after finding a length validation error
        }
        if (!passwordValidation.uppercase.test(formData.password)) {
            errorList.push("Password must contain at least one uppercase letter.");
            return errorList; // Return after finding an uppercase validation error
        }
        if (!passwordValidation.lowercase.test(formData.password)) {
            errorList.push("Password must contain at least one lowercase letter.");
            return errorList; // Return after finding a lowercase validation error
        }
        if (!passwordValidation.number.test(formData.password)) {
            errorList.push("Password must contain at least one number.");
            return errorList; // Return after finding a number validation error
        }
        if (!passwordValidation.specialChar.test(formData.password)) {
            errorList.push("Password must contain at least one special character.");
            return errorList; // Return after finding a special character validation error
        }
    
        return errorList; // If no errors, return an empty array
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (formErrors.length > 0) {
            formErrors.forEach(error => toast.error(error, { position: "top-center" }));
            return;
        }

        setIsRegistering(true);
        setIsRegisterButtonClicked(true);
        setShowResendButton(false);
        setShowResendNote(false);
        setTimer(0);

        try {
            const response = await axios.post('http://localhost:8000/api/register', formData);
            console.log(response);
            if (response.status === 201) { 
                toast.success(response.data.msg, { position: "top-center" });
                setShowResendNote(true);
                setTimer(120);  // Start the timer for 2 minutes
            }else if(response.status === 207){
                const verificationHash = response.data.verificationHash; 
            
                toast.success(response.data.msg || 'Proceeding to OTP verification...', { position: "top-center" });

                // Wait for the toast to be visible for a moment, then navigate
                setTimeout(() => {
                    route.push(`/verify-otp?token=${verificationHash}`);
                }, 4000); 
            }
             else {
                toast.error(response.data.msg || 'Registration failed', { position: "top-center" });
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Registration failed', { position: "top-center" });
        } finally {
            setIsRegistering(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            const response = await axios.post('http://localhost:8000/api/resend-credentials', formData);
            if (response.status === 200 || response.status === 302) {  // Check for both 200 and 302
                toast.success(response.data.msg, { position: "top-center" });
                setTimer(120);  // Restart the timer for 2 minutes
            } else {
                toast.error(response.data.msg || 'Failed to resend credentials.', { position: "top-center" });
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Failed to resend credentials.', { position: "top-center" });
        } finally {
            setIsResending(false);
        }
    };

    const handleGoogleSignIn = async () => {
        const token = localStorage.getItem('authToken');

        if (token) {
            route.push('/dashboard');
        } else {
            try {
                const response = await axios.get('http://localhost:8000/api/auth/google', { withCredentials: true });
                // if (response.data.token) {
                //     localStorage.setItem('authToken', response.data.token);
                //     route.push('/dashboard');
                // } 
            } catch (error) {
                console.error('Google Sign-In failed:', error);
                toast.error('Failed to initiate Google Sign-In', { position: "top-center" });
            }
        }
    };

    const handleGithubSignin = async () => {
        try {
            window.location.href = 'http://localhost:8000/api/auth/github';
        } catch (error) {
            console.error('Github Sign-In failed:', error);
            toast.error('Failed to initiate Github Sign-In', { position: "top-center" });
        }
    };

    return (
        <div className='container'>
            <ToastContainer />
            <header className="header">
                <nav className="nav">
                    <a href="#" className="nav_logo">MyApp</a>
                    <ul className="nav_items">
                        <li className="nav_item">
                            <a href="/" className="nav_link">Home</a>
                            <a href="/dashboard" className="nav_link">Dashboard</a>
                           
                        </li>
                    </ul>
                </nav>
            </header>
            <section className="home">
                <div className="form_container">
                    <div className="form register_form">
                        {!socialSignup && (
                            <form onSubmit={handleSubmit}>
                                <h2>Register</h2>
                                <div className="input_box">
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Enter your username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        autoComplete='off'
                                        required
                                    />
                                </div>
                                <div className="input_box">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete='off'
                                        required
                                    />
                                </div>
                                <div className="input_box">
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Create password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        autoComplete='off'
                                        required
                                    />
                                </div>
                                <div className="input_box">
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        autoComplete='off'
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className={`register-button ${isRegistering ? 'disabled' : ''}`}
                                    disabled={isRegistering || isRegisterButtonClicked}
                                >
                                    {isRegistering ? 'Registering...' : 'Register'}
                                </button>
                                <div className="social_login_container">
                                    <p>Or sign up with:</p>
                                    <div className="social_login_buttons">
                                        <button onClick={handleGoogleSignIn}><FaGoogle className="social_icon google" /></button>
                                        <button><FaFacebookF className="social_icon facebook" /></button>
                                        <button><FaLinkedinIn className="social_icon linkedin" /></button>
                                    </div>
                                </div>
                                <br />
                                {showResendNote && !showResendButton && (
                                    <div className='resend-note'>
                                        <p><span className='note'>Note</span>If you did not receive credentials, you can resend the credentials after {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)} minutes.</p>
                                    </div>
                                )}
                                {showResendButton && (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={isResending}
                                        className={`resend-button ${isResending ? 'disabled' : ''}`}
                                    >
                                        {isResending ? 'Resending Credentials...' : 'Resend Credentials'}
                                    </button>
                                )}
                                <p className='message'>Already Have an account? <Link href="/login">Log in</Link></p>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
