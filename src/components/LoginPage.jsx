import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); 

    try {
      const response = await fetch(`https://fgpt-backend.onrender.com/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/chat');
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false); 
    }
  };

  const handleGoogleLogin = () => {
    alert("Google login clicked! (Mock implementation)");
    navigate('/chat');
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <button className="shadow__btn">
          Chat with Fgpt
        </button>
        <h2>Login</h2>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            disabled={isLoading} 
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            disabled={isLoading} 
          />
        </div>
        <button type="submit" disabled={isLoading}>
          Log in
        </button>
        <p>
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            style={{ color: 'blue', cursor: 'pointer' }}
          >
            Sign up
          </span>
        </p>
        {isLoading &&
          <section className="dots-container1">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </section>
        }

      </form>
    </div>
  );
};

export default LoginPage;
