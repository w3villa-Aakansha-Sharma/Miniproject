"use client"
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MdCheckCircle } from 'react-icons/md';
import "../Style/payment.css"

const PaymentSuccess = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard or some other page after a delay
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000); // Redirect after 3 seconds
  }, [router]);

  return (
    <div className="payment-result">
      <div className="container">
        <MdCheckCircle className="icon" />
        <h1>Payment Successful!</h1>
        <p>Your payment has been processed successfully. You will be redirected to your dashboard shortly.</p>
        <button onClick={() => router.push('/dashboard')}>Go to Dashboard</button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
