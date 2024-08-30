
"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdEmail } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { RotatingLines } from "react-loader-spinner";
import styles from "../Style/EmailVerification.module.css"

const EmailVerification = () => {
  const [message, setMessage] = useState('Click the button to verify your email.');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const handleVerification = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token');
      
      if (token) {
        try {
          const response = await axios.get(`http://localhost:8000/api/verify-email?token=${token}`);
          if (isMounted) {
            setMessage(response.data.msg);
            setTimeout(() => {
              router.push(`/verify-otp?token=${token}`);
            }, 2000);
          }
        } catch (error) {
          if (isMounted) {
            setMessage('Email verification failed. Invalid or expired link.');
            console.error('Verification error:', error);
          }
        }
      } else {
        if (isMounted) {
          setMessage('No token provided.');
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };

    handleVerification();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div style={styles.container}>
      <div style={styles.icon}>
        <MdEmail size={100} color="#7d2ae8" />
      </div>
      {isLoading ? (
        <div style={styles.loader}>
          <RotatingLines
            visible={isLoading}
            height="96"
            width="96"
            color="grey"
            strokeWidth="5"
            animationDuration="0.75"
            ariaLabel="rotating-lines-loading"
          />
          <p style={styles.message}>Verifying...</p>
        </div>
      ) : (
        <>
          <h1 style={styles.title}>Email Verification</h1>
          <p style={styles.message}>{message}</p>
        </>
      )}
    </div>
  );
};


export default EmailVerification;
