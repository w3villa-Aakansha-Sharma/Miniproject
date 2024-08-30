"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUserCircle } from 'react-icons/fa';
import '../Style/profile-upload.css';

const ProfileUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const router = useRouter();

  
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = queryParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload', { icon: false, position: 'top-center' });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('profilePicture', file);
    if (token) {
      formData.append('token', token); 
    }

    try {
      const response = await axios.post('http://localhost:8000/api/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = response.data.url;

      toast.success('Profile picture uploaded successfully', { icon: false, position: 'top-center' });

      setTimeout(() => {
        router.push(`/dashboard?token=${token}`);
      }, 1000);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error(
        error.response?.data?.msg || 'An error occurred while uploading profile picture',
        { icon: false, position: 'top-center' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className="profile-upload-container">
      <ToastContainer />
      <div className="upload-card">
        <h1 className="title">Upload Your Profile Picture</h1>
        <FaUserCircle className="user-icon" />
        <form onSubmit={handleUpload} className="upload-form">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
          <button type="submit" className="upload-button" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
          <button type="button" onClick={handleSkip} className="skip-button">
            Skip
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileUpload;
