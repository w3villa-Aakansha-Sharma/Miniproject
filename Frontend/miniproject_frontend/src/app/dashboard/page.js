"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AiOutlineUser } from 'react-icons/ai';
import '../Style/dashboard.css';
import ProfileFormComponent from '../profile-update/page';
import '../Style/checkout.css';
import jwt from 'jsonwebtoken';

const Dashboard = () => {
  const [message, setMessage] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [blurBackground, setBlurBackground] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [tier, setTier] = useState("");
  const [showPlansOverlay, setShowPlansOverlay] = useState(false);
  const router = useRouter();
  const userToken = localStorage.getItem('usertoken');
  useEffect(() => {
    const getAuthToken = () => {
      let authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        const cookies = document.cookie.split(';');
        console.log(cookies);
        const authTokenCookie = cookies.find(row => row.startsWith(' authToken='));
        
        if (authTokenCookie) {
          authToken = authTokenCookie.split('=')[1];
        }
      }
  
      return authToken;
    };
  
    const authToken = getAuthToken();
    const decoded = jwt.decode(authToken);
    
    if (decoded) {
        console.log('Decoded JWT:', decoded);

        if (decoded.role !== 'user') {
          alert("You do not have access to this page")
          router.push('/login')
        }
    } else {
        console.error('Failed to decode JWT.');
        setError('Failed to decode token. Please try again.');
        toast.error('Failed to decode token. Please try again.', { position: 'top-center' });
    }
  
   
  }, [router]);

  useEffect(() => {
    const getAuthToken = () => {
      let authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        const cookies = document.cookie.split(';');
        console.log(cookies);
        const authTokenCookie = cookies.find(row => row.startsWith(' authToken='));
        
        if (authTokenCookie) {
          authToken = authTokenCookie.split('=')[1];
        }
      }
  
      return authToken;
    };
  
    const authToken = getAuthToken();
  
    if (authToken) {
      validateToken(authToken);
    } else {
      alert("i am not getting authToken");
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
        fetchProfileImageUrl(token);
        fetchCurrentPlan(token);
      } else {
        throw new Error('Token validation failed.');
      }
    } catch (error) {
      console.error("Failed to validate token:", error);
      localStorage.removeItem('authToken');
      router.push('/login');
    }
  };

  const fetchProfileImageUrl = async (token) => {
    try {
      const response = await axios.post('http://localhost:8000/api/users/profile', { token: userToken }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      setTier(data.tier);
      setUsername(data.username);
      setProfileImageUrl(data.profile_image_url || null);
    } catch (error) {
      console.error('Error fetching profile image:', error);
    }
  };

  const fetchCurrentPlan = async (token) => {
    try {
      const response = await axios.post('http://localhost:8000/api/users/profile', { token: userToken }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      setCurrentPlan(data.tier);
    } catch (error) {
      console.error('Error fetching current plan:', error);
    }
  };

  const handleLogout = () => {
    // Remove authToken from cookies
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  
    // Remove tokens from local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userToken');
  
    // Redirect to login page
    router.push('/login');
  };

  const handleProfileImageClick = () => {
    setShowProfileDetails(prev => !prev);
    setBlurBackground(prev => !prev);
  };

  const handleCloseProfileDetails = () => {
    setShowProfileDetails(false);
    setBlurBackground(false);
  };

  const handlePlanSelection = (plan) => {
    router.push(`/checkout?plan=${plan}`);
  };

  const handleUpgradeNowClick = () => {
    setShowPlansOverlay(true);
    setBlurBackground(true);
  };

  const handleClosePlansOverlay = () => {
    setShowPlansOverlay(false);
    setBlurBackground(false);
  };

  return (
    <div className={`dashboard-container ${blurBackground ? 'blurred' : ''}`}>
      <nav className="navbar">
        <div className="logo">MyApp</div>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/dashboard">Dashboard</a></li>
          {user && (
            <li>
              <a href="#" onClick={handleLogout}>Logout</a>
            </li>
          )}
        </ul>
        <div className="profile-container">
          {profileImageUrl ? (
            <img 
              src={profileImageUrl} 
              alt="Profile" 
              className="profile-image" 
              onClick={handleProfileImageClick} 
            />
          ) : (
            <AiOutlineUser className="default-user-icon" onClick={handleProfileImageClick} />
          )}
        </div>
      </nav>
      <main>
        <h1>Hello, {username}!</h1>
        <p>You're currently using the <strong>{tier}</strong> plan.</p>
        {tier !== 'gold' && (
          <>
            <p>Upgrade your plan to explore more features and get the best experience with MyApp.</p>
            <button className="plan-upgrade-button" onClick={handleUpgradeNowClick}>Upgrade Now</button>
          </>
        )}

        {/* Display all plan cards below the message */}
        <div className="plan-cards-section">
  <div className={`plan-card ${currentPlan === 'free' ? 'current-plan' : 'disabled-plan'}`}>
    <h2 className="plan-title">Free Plan</h2>
    <p className="plan-description">Basic access with limited support and features.</p>
    <h3 className="plan-price">Free</h3>
    <button
      className="plan-button"
     
      
    >
      {currentPlan === 'free' ? 'Your Current Plan' : 'Disabled'}
    </button>
  </div>

  <div className={`plan-card ${currentPlan === 'silver' ? 'current-plan' : 'disabled-plan'}`}>
    <h2 className="plan-title">Silver Plan</h2>
    <p className="plan-description">Enjoy additional features and support.</p>
    <h3 className="plan-price">$10/month</h3>
    <button
      className="plan-button"
     
      disabled={true} 
    >
      {currentPlan === 'silver' ? 'Your Current Plan' : 'Disabled'}
    </button>
  </div>

  <div className={`plan-card ${currentPlan === 'gold' ? 'current-plan' : 'disabled-plan'}`}>
    <h2 className="plan-title">Gold Plan</h2>
    <p className="plan-description">Get full access to all features and support.</p>
    <h3 className="plan-price">$30/month</h3>
    <button
      className="plan-button"
      
      disabled={true} 
    >
      {currentPlan === 'gold' ? 'Your Current Plan' : 'Disabled'}
    </button>
  </div>
</div>


        {showProfileDetails && (
          <div className="profile-form-overlay">
            <ProfileFormComponent onClose={handleCloseProfileDetails} />
          </div>
        )}

{showPlansOverlay && (
          <div className="plans-overlay">
            <div className="plans-container">
              <h1>Upgrade Your Plan</h1>
              <button className="close-button" onClick={handleClosePlansOverlay}></button>
              <div className="plans-grid">
                {tier === 'free' && (
                  <>
                    <div className="plan-card">
                      <h2 className="plan-title">Silver Plan</h2>
                      <p className="plan-description">Enjoy additional upgraded features and enhanced support.</p>
                      <h3 className="plan-price">$10/month</h3>
                      <button className="plan-button" onClick={() => handlePlanSelection('silver')}>Upgrade to Silver</button>
                    </div>
                    <div className="plan-card">
                      <h2 className="plan-title">Gold Plan</h2>
                      <p className="plan-description">Get full access to all upgraded features and premium support.</p>
                      <h3 className="plan-price">$30/month</h3>
                      <button className="plan-button" onClick={() => handlePlanSelection('gold')}>Upgrade to Gold</button>
                    </div>
                  </>
                )}
                {tier === 'silver' && (
                  <div className="plan-card">
                    <h2 className="plan-title">Gold Plan</h2>
                    <p className="plan-description">Get full access to all  upgradedfeatures and premium support.</p>
                    <h3 className="plan-price">$30/month</h3>
                    <button className="plan-button" onClick={() => handlePlanSelection('gold')}>Upgrade to Gold</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
