'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';

import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Style/login.css';
import Link from 'next/link';
import { FaGoogle, FaGithub, FaLinkedinIn } from 'react-icons/fa'; 

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [info, setInfo] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [hash, setHash] = useState('');
    const [userRole, setUserRole] = useState('');
    const router = useRouter();
    const [token, setToken] = useState('');

   
    const handleGoogleSignIn = () => {
        try {
            window.location.href = 'http://localhost:8000/api/auth/google';
        } catch (error) {
            console.error('Google Sign-In failed:', error);
            toast.error('Failed to initiate Google Sign-In', { position: "top-center" });
        }
    };

    const handleGithubSignIn = () => {
        try {
            window.location.href = 'http://localhost:8000/api/auth/github';
        } catch (error) {
            console.error('GitHub Sign-In failed:', error);
            toast.error('Failed to initiate GitHub Sign-In', { position: "top-center" });
        }
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
    
        try {
            const response = await axios.post('http://localhost:8000/api/login', {
                email,
                password
            });
    
            if (response.status === 200) {
                setSuccessMessage(response.data.msg);
                localStorage.setItem('authToken', response.data.token);
                let storedToken = localStorage.getItem('authToken');
                console.log(storedToken);
                
                const decoded = jwt.decode(storedToken);
    
                if (decoded) {
                    console.log('Decoded JWT:', decoded);
    
                    if (decoded.role === 'admin') {
                        router.push('/admin');
                    } else if (decoded.role === 'user') {
                        router.push('/dashboard');
                    } else {
                        console.error('Unexpected role:', decoded.role);
                        setError('An unexpected role was detected.');
                        toast.error('An unexpected role was detected.', { position: 'top-center' });
                    }
                } else {
                    console.error('Failed to decode JWT.');
                    setError('Failed to decode token. Please try again.');
                    toast.error('Failed to decode token. Please try again.', { position: 'top-center' });
                }
                
            } else if (response.status === 201) {
                setInfo(response.data.msg);
                setHash(response.data.verification_hash);
                toast.info(response.data.msg, {
                    position: 'top-center',
                    autoClose: false,
                    closeOnClick: false,
                    draggable: false,
                    closeButton: CustomCloseButton,
                    transition: Slide,
                });
            } else if (response.status === 204) {
                setInfo(response.data.msg);
                toast.info(response.data.msg, {
                    position: 'top-center',
                    autoClose: false,
                    closeOnClick: false,
                    draggable: false,
                    closeButton: CustomCloseButton,
                    transition: Slide,
                });
                router.push('/admin');
            } else {
                setError(response.data.msg || 'Unexpected status code');
                toast.error(response.data.msg || 'Unexpected status code', { position: 'top-center' });
            }
        } catch (error) {
            console.error('Error during login:', error.response?.data || error.message);
            setError('An error occurred. Please try again.');
            toast.error('An error occurred. Please try again.', { position: 'top-center' });
        }
    
        setIsLoading(false);
    };
    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleRedirect = () => {
        if (hash) {
            router.push(`/verify-otp?token=${hash}`);
        } else {
            console.error('Verification hash is missing.');
        }
    };

    const CustomCloseButton = ({ closeToast }) => (
        <button
            style={{
                border: 'none',
                backgroundColor: 'black',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                marginLeft: '10px'
            }}
            onClick={() => {
                closeToast();
                handleRedirect();
            }}
        >
            OK
        </button>
    );

    return (
        <div className="container">
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
                    <div className="form login_form">
                        <form onSubmit={handleSubmit}>
                            <h2>Login</h2>
                            <div className="input_box">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <i className="uil uil-envelope-alt email"></i>
                            </div>
                            <div className="input_box">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <i className="uil uil-lock password"></i>
                                <i
                                    className={`uil uil-eye${showPassword ? '' : '-slash'} pw_hide`}
                                    onClick={togglePasswordVisibility}
                                ></i>
                            </div>
                            
                            <button type="submit" className="button" disabled={isLoading}>
                                {isLoading ? 'Loading...' : 'Login Now'}
                            </button>
                            <div className="social_login_container">
                                <p>Or sign in with:</p>
                                <div className="social_login_buttons">
                                    <button onClick={handleGoogleSignIn}><FaGoogle className="social_icon google" /></button>
                                    <FaGithub onClick={handleGithubSignIn} className="social_icon facebook" />
                                    <FaLinkedinIn className="social_icon linkedin" />
                                </div>
                            </div>
                            <p className='message'>Don't Have an account? <Link href="/signup">Create new Account</Link></p>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
