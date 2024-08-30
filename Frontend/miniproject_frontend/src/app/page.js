'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import './Style/homepage.css';

const HomePage = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 
    const apiurl=process.env.API_URL;
    console.log("this is apiurl",`${apiurl}`);
    

    const getAuthToken = () => {
        let authToken = localStorage.getItem('authToken');
        
        if (!authToken) {
            const cookies = document.cookie.split('; ');
            const authTokenCookie = cookies.find(row => row.startsWith('authToken='));
            if (authTokenCookie) {
                authToken = authTokenCookie.split('=')[1];
            }
        }
        
        return authToken;
    };

    useEffect(() => {
    
        const authToken = getAuthToken();
        console.log("this is home page",authToken);
        if (authToken) {
            try {
                
                const decodedToken = JSON.parse(atob(authToken.split('.')[1]));
                setUser(decodedToken);
            } catch (error) {
                console.error("Failed to decode token:", error);
                
                document.cookie = 'authToken=; Max-Age=0'; 
                setUser(null);
            }
        }
        setLoading(false); 
    }, []);

    const handleLoginClick = () => {
        router.push('/login');
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


    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="home-container">
            <nav className="navbar">
                <div className="logo">MyApp</div>
                <ul className="nav-links">
                    <li><a href="/">Home</a></li>
                    <li><a href="/dashboard">Dashboard</a></li>
                   
                    
                </ul>
            </nav>
            <div className="welcome-message">
                {user ? (
                    <>
                        <h1>Welcome back</h1>
                        <p>You are now logged in. Feel free to explore all the features MyApp has to offer!</p>
                    </>
                ) : (
                    <>
                        <h1>Welcome to MyApp!</h1>
                        <p>Sign in to unlock all features and enjoy a full experience with MyApp.</p>
                        <button className="login-button" onClick={handleLoginClick}>
                            Sign In
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;
