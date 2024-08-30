"use client"
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const CheckoutForm = ({ plan }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const usertoken = localStorage.getItem('usertoken');
  const router = useRouter();

  useEffect(() => {
    const getAuthToken = () => {
      let authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        const cookies = document.cookie.split('; ');
        console.log('Cookies:', cookies);
        
        const authTokenCookie = cookies.find(row => row.startsWith('authToken='));
        console.log('AuthToken Cookie:', authTokenCookie);
  
        if (authTokenCookie) {
          authToken = authTokenCookie.split('=')[1];
          console.log('Auth token from cookie:', authToken);
        } else {
          console.log('No auth token found in cookies');
        }
      }
  
      return authToken;
    };
  
    const authToken = getAuthToken();
  
    if (authToken) {
      validateToken(authToken);
    } else {
      router.push('/login');
    }
  }, [router]);

  const validateToken = async (token) => {
    try {
      const response = await axios.post('http://localhost:8000/api/validate-token', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setUser(response.data.user);
      } else {
        throw new Error('Token validation failed.');
      }
    } catch (error) {
      console.error("Failed to validate token:", error);
      localStorage.removeItem('authToken');
      router.push('/login');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!stripe || !elements) return;
  
    setLoading(true);
  
    try {
      const { data: { clientSecret } } = await axios.post('http://localhost:8000/api/create-payment-intent', { plan, usertoken });
  
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });
      console.log(paymentIntent);
  
      if (error) {
        console.error('Payment error:', error);
        router.push('/payment-failure');
      } else if (paymentIntent.status === 'succeeded') {
        router.push('/payment-success');
      }
    } catch (error) {
      console.error('Error during payment:', error);
      router.push('/payment-failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <label>
        <span>Card Details</span>
        <CardElement options={{ hidePostalCode: true }} />
      </label>
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default CheckoutForm;
