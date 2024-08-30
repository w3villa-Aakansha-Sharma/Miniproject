'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { RotatingLines } from "react-loader-spinner";
import { MdEmail } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import '../Style/EmailVerification.css';

const EmailVerification = () => {
    const router = useRouter();
    const [message, setMessage] = useState('Verifying email .......');
    const [isLoading, setIsLoading] = useState(true);
    const [showInitialMessage, setShowInitialMessage] = useState(true);
    const hasCalledApi = useRef(false);
    const [status, setStatus] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowInitialMessage(false);
            handleVerification();
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleVerification = async () => {
        if (hasCalledApi.current) return;
        hasCalledApi.current = true;

        setIsLoading(true);
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');
        
        if (token) {
            try {
                setToken(token);
                const response = await axios.get(`http://localhost:8000/api/verify-email?token=${token}`);
                setStatus(response.status);
                setMessage(response.data.msg);
            } catch (error) {
                setMessage('Email verification failed. Invalid or expired link.');
                console.error('Verification error:', error);
            }
        } else {
            setMessage('No token provided.');
        }
        setIsLoading(false);
    };

    return (
        <div className="container">
            <div className="background-animation"></div>
            <div className="icon-container">
                <MdEmail size={150} color="#7d2ae8" />
            </div>
            <h1 className="title">{message}</h1>
            {isLoading && (
                <div className="loader-container">
                    <RotatingLines
                        visible={isLoading}
                        secondaryColor="#9e3e96"
                        height="100"
                        width="100"
                        color="#7d2ae8"
                        ariaLabel="rotating-lines-loading"
                    />
                </div>
            )}
            
            {!isLoading && status === 200 && (
                <button className="continue-button" onClick={() => router.push(`/verify-otp?token=${token}`)}>
                    Continue
                </button>
            )}
        </div>
    );
};

export default EmailVerification;
