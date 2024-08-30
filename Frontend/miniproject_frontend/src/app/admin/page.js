"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import jwt from 'jsonwebtoken';
import { useRouter } from "next/navigation";
import "../Style/admin.css"; // Import the CSS file

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15); // Set initial limit to 15
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState(""); // Filter by user plan (tier)
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const router=useRouter('')
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

        if (decoded.role !== 'admin') {
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
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8000/api/userdata", {
          params: {
            page,
            limit, // Ensure limit is set to 15
            search,
            planFilter, // Include the new plan filter in the API call
          },
        });
        setUsers(response.data.data); 
        setTotalUsers(response.data.total); 
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, limit, search, planFilter]); // Ensure all dependencies are added

  const handleSearchChange = (e) => setSearch(e.target.value);
  const handlePlanFilterChange = (e) => setPlanFilter(e.target.value); 
  const handlePageChange = (newPage) => setPage(newPage);

  const totalPages = Math.ceil(totalUsers / limit);

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={handleSearchChange}
        />
        <select value={planFilter} onChange={handlePlanFilterChange}>
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
        </select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="user-table">
            <thead>
              <tr>
                <th>Unique Reference ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Tier</th>
                <th>Mobile Number</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.unique_reference_id}>
                  <td>{user.unique_reference_id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.tier}</td>
                  <td>{user.mobile_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={page === index + 1 ? "active-page" : ""}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}