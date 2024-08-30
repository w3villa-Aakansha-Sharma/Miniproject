"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';


import '../Style/checkout.css';
import CheckoutForm from '../checkoutform/page';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51PoNWSEj9itDV9LGVvNGGCToxFdDaXREJc5qSGHJxULZlyTHDzZ8PIJsTciocDHltHpIuAYBDBJ7GPXfhHGKv1zx0054KagvrE');

const Checkout = () => {
  const router = useRouter();
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const selectedPlan = queryParams.get('plan');
    setPlan(selectedPlan);
  }, []);

  const planDetails = {
   
    silver: {
      title: 'Silver Plan',
      description: 'Enjoy additional features and enhanced support.',
      price: '$10/month'
    },
    gold: {
      title: 'Gold Plan',
      description: 'Get full access to all features and premium support.',
      price: '$30/month'
    }
  };

  const planInfo = planDetails[plan] || {};

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h1 className="checkout-title">Checkout</h1>
        <div className="plan-summary">
          <h2 className="plan-title">{planInfo.title || 'Select a Plan'}</h2>
          <p className="plan-description">{planInfo.description || 'Please select a valid plan.'}</p>
          <h3 className="plan-price">{planInfo.price || '-'}</h3>
        </div>
        <div className="payment-info">
          <h2>Payment Information</h2>
          <p>Please enter your payment details to complete the purchase.</p>
          <Elements stripe={stripePromise}>
            <CheckoutForm plan={plan} />
          </Elements>
        </div>
        <button onClick={() => router.push('/dashboard')} className="back-button">Back to Dashboard</button>
      </div>
    </div>
  );
};

export default Checkout;
