"use client"
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MdError } from 'react-icons/md';
import "../Style/payment.css"

const PaymentFailure = () => {
  const router = useRouter();

 

  return (
    <div className="payment-result">
      <div className="container">
        <MdError className="icon" />
        <h1>Payment Failed</h1>
        <p>Unfortunately, your payment could not be processed. Please try again later or contact support if the issue persists.</p>
        <button onClick={() => router.push('/dashboard')}>Retry Payment</button>
      </div>
    </div>
  );
};

export default PaymentFailure;
