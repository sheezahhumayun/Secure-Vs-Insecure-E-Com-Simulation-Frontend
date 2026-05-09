import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isSecure, setIsSecure] = useState(false);

  const toggleSecurity = async () => {
    const newMode = !isSecure;
    const res = await axios.post('http://localhost:5000/api/toggle-security', { isSecure: newMode });
    setIsSecure(res.data.isSecure);
  };
  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      alert(res.data.message);
    } catch (err) {
      alert("Login Failed");
    }
  };

  const postReview = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/reviews', { content: review });
      alert(res.data.message); // Only alerts if status is 200
      setReview(""); // Clear the textarea
      fetchReviews(); // Refresh the list
    } catch (err) {
      console.error("POST FAILED:", err);
      alert("Failed to post: " + (err.response?.data?.message || "Check Console"));
    }
  };

  const fetchReviews = async () => {
    const res = await axios.get('http://localhost:5000/api/reviews');
    setReviews(res.data);
  };

  const fetchProfile = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/profile/${id}`);
      setProfile(res.data);
    } catch (err) {
      // Instead of crashing, we show the security message from the server
      alert("SECURITY ALERT: " + (err.response?.data?.message || "Unauthorized Access"));
      setProfile(null); // Clear previous profile data
    }
  };

  const placeOrder = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/place-order', {
        item: "Expensive Laptop",
        price: 2000
      });
      alert(res.data.message);
    } catch (err) {
      // This catches the 403 Forbidden
      alert("CSRF BLOCK: " + (err.response?.data?.message || "Request Denied"));
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const cardStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginBottom: "20px"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    borderRadius: "8px",
    border: "1px solid #ccc"
  };

  const buttonStyle = {
    padding: "10px 15px",
    borderRadius: "8px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    cursor: "pointer",
    marginTop: "10px"
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f3f4f6",
      padding: "30px",
      fontFamily: "Arial"
    }}>
      <div style={{ ...cardStyle, textAlign: 'center', background: isSecure ? '#dcfce7' : '#fee2e2' }}>
        <h2 style={{ color: isSecure ? '#166534' : '#991b1b' }}>
          Current Status: {isSecure ? "🛡️ SECURE MODE" : "⚠️ INSECURE MODE"}
        </h2>
        <button style={{ ...buttonStyle, background: isSecure ? '#22c55e' : '#ef4444' }} onClick={toggleSecurity}>
          Switch to {isSecure ? "Insecure" : "Secure"} Mode
        </button>
      </div>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        Insecure E-Commerce Lab
      </h1>

      {/* LOGIN */}
      <div style={cardStyle}>
        <h3>Login</h3>
        <input
          style={inputStyle}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button style={buttonStyle} onClick={handleLogin}>Login</button>
      </div>

      {/* REVIEWS */}

      <h3>Product Reviews</h3>
      <textarea
        style={{ ...inputStyle, height: "80px" }}
        placeholder="Write a review..."
        onChange={(e) => setReview(e.target.value)}
      />
      <button style={buttonStyle} onClick={postReview}>Submit Review</button>

      <div style={{ marginTop: "15px" }}>
        {reviews.map((r, i) => (
          <div
            key={i}
            style={{ background: "#fafafa", border: "1px solid #ddd", borderRadius: "8px", margin: "10px 0", padding: "10px" }}
          >
            {isSecure ? (
              <p>{r.content}</p> // SECURE: React treats this as plain text
            ) : (
              <div dangerouslySetInnerHTML={{ __html: r.content }} /> // INSECURE
            )}
          </div>
        ))}
      </div>

      {/* IDOR */}
      <div style={cardStyle}>
        <h3>IDOR Lab: User Profile</h3>
        <button style={buttonStyle} onClick={() => fetchProfile(1)}>
          View My Profile (ID: 1)
        </button>

        {profile && (
          <div style={{
            marginTop: "15px",
            background: "#eef2ff",
            padding: "15px",
            borderRadius: "8px"
          }}>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role:</strong> {profile.role}</p>
          </div>
        )}
      </div>

      {/* CSRF */}
      <div style={cardStyle}>
        <h3>CSRF Lab: Checkout</h3>
        <button
          style={{ ...buttonStyle, background: "#dc2626" }}
          onClick={placeOrder}
        >
          Place Order ($2000)
        </button>
      </div>
    </div >
  );
}

export default App;