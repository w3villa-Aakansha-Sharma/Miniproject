import { useState, useCallback, useRef, useEffect } from 'react';
import debounce from 'lodash/debounce';
import axios from 'axios';
import { FaCamera } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import '../Style/profileForm.css';

const ProfileFormComponent = ({ onClose }) => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState('');
  const [tier, setTier] = useState('');
  const [location, setLocation] = useState({ lat: 20.5937, lng: 78.9629 });
  const [suggestions, setSuggestions] = useState([]);
  const fileInputRef = useRef(null);

  const apiKey = '784ad8b584de4c51a92e804022e784a1';

  useEffect(() => {
    const fetchProfileData = async () => {
      const usertoken = localStorage.getItem('usertoken');
      if (!usertoken) {
        console.error('User token is missing.');
        return;
      }

      try {
        const response = await axios.post('http://localhost:8000/api/users/profile', { token: usertoken });
        const data = response.data;
        console.log(data)

        setUsername(data.username || '');
        setAddress(data.address || '');
        setTier(data.tier || '');

        if ( data.latitude && data.longitude) {
          setLocation({ lat: data.latitude, lng: data.longitude });
        } else {
          setLocation({ lat: 20.5937, lng: 78.9629 });
        }

        setProfilePictureUrl(data.profile_image_url || null);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []);

  const fetchAddressSuggestions = useCallback(
    debounce(async (query) => {
      if (!query) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&countrycode=in`);
        const data = await response.json();
        const { results } = data;
        setSuggestions(results.map(result => ({
          label: result.formatted,
          lat: result.geometry.lat,
          lng: result.geometry.lng,
        })));
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        setSuggestions([]);
      }
    }, 300),
    []
  );

  const handleAddressChange = (e) => {
    const query = e.target.value;
    setAddress(query);
    fetchAddressSuggestions(query);
  };

  const handleSuggestionClick = (suggestion) => {
    setAddress(suggestion.label);
    setLocation({ lat: suggestion.lat, lng: suggestion.lng });
    setSuggestions([]);
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
      setProfilePictureUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('usertoken');
    if (!token) {
      console.error('User token is missing.');
      return;
    }

    try {
      let imageUrl = profilePictureUrl;

      if (profilePicture) {
        const imageFormData = new FormData();
        imageFormData.append('profilePicture', profilePicture);

        const storjResponse = await axios.post('http://localhost:8000/api/upload-profile-picture', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
        });

        imageUrl = storjResponse.data.url;
      }

      const updateFormData = { username, address, profilePicture: imageUrl, location, token };
      const updateResponse = await axios.put('http://localhost:8000/api/users/update', updateFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(updateResponse.data.message);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(128, 0, 128);
    doc.setFont("Helvetica", "bold");
    doc.text("Profile Information", 105, 20, { align: "center" });

    doc.setFontSize(15);
    doc.setTextColor(0, 0, 0);
    doc.text(`Username: ${username}`, 30, 40);
    doc.text(`Address: ${address}`, 30, 50);
    doc.text(`Tier: ${tier}`, 30, 60);
    doc.text(`Location: Lat: ${location.lat}, Lng: ${location.lng}`, 30, 70);

    if (profilePictureUrl) {
      const imgElement = document.querySelector('.profile-picture-preview');
      const canvas = await html2canvas(imgElement);
      const imgData = canvas.toDataURL('image/png');

      doc.addImage(imgData, 'PNG', 150, 40, 50, 50);
    }

    doc.save('profile-information.pdf');
  };

  return (
    <div className="profile-form-container">
      <button className="close-button" onClick={onClose}></button>
    
      <h2>Update Profile</h2>
      <div className="profile-picture-section">
        <label htmlFor="profilePicture" className="profile-picture-label">
          {profilePictureUrl ? (
            <img src={profilePictureUrl} alt="Profile" className="profile-picture-preview" />
          ) : (
            <div className="default-profile-picture">
              <span className="user-icon">👤</span>
              <FaCamera className="camera-icon" onClick={handleProfilePictureClick} />
            </div>
          )}
          <input
            type="file"
            id="profilePicture"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleProfilePictureChange}
          />
        </label>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            autoComplete='off'
            type="text"
            id="address"
            value={address}
            onChange={handleAddressChange}
            placeholder="Enter your address"
            className="address-input"
          />
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                  {suggestion.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="tier">Tier</label>
          <input
            type="text"
            id="tier"
            value={tier}
            disabled
          />
        </div>

        <div style={{ width: '100%', height: '200px', marginTop: '20px', marginBottom: '20px' }}>
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.05}%2C${location.lat - 0.05}%2C${location.lng + 0.05}%2C${location.lat + 0.05}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
            allowFullScreen
          ></iframe>
        </div>

        <button type="submit" className="update-button">Update Profile</button>
      </form>

      <button onClick={handleDownloadPDF} className="download-button">Download as PDF</button>
    </div>
  );
};

export default ProfileFormComponent;
