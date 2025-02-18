// SignUpPage.jsx
import React, { useState } from 'react';
import './SignUpPage.css';
import { FaOutdent, FaRoute, FaSignOutAlt, FaUndoAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';



const SignUpPage = () => {

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true); 

    if (verificationCode !== generatedCode) {
        alert('Invalid verification code!');
        return;
    }

    try {
        const response = await fetch('https://fgpt-backend.onrender.com/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            alert('Sign up successful! Log in to continue.');
            navigate('/');
        } else {
            const data = await response.json();
            alert(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }

    setIsLoading(false); 
};



const sendVerificationCode = async () => {
  if(!email) {
      alert('Please enter your email!');
      return;
  }
  if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
  }
  if (password.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
  }

  setIsLoading(true); 
  try {
      const response = await fetch('https://fgpt-backend.onrender.com/api/auth/send-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
          setGeneratedCode(data.code);
          setIsCodeSent(true);
          alert('Verification code sent to your email.');
      } else {
          alert(data.error);
      }
  } catch (error) {
      console.error('Error:', error);
  }
  setIsLoading(false);
};



  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSignUp}>
        <h2>Sign Up</h2>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
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
          />
        </div>
        <div className="form-group">
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your password"
          />
        </div>
        {isCodeSent && (
          <div className="form-group">
            <label>Verification Code:</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              placeholder="Enter the verification code"
            />
          </div>
        )}
        <div className="button-container">
          {!isCodeSent ? (
            <button type="button" onClick={sendVerificationCode}>
              Send Verification Code
            </button>
          ) : (
            <button type="submit">Sign Up</button>
          )}
          <button onClick={() => navigate('/')}><FaSignOutAlt></FaSignOutAlt>         Log in</button>
        </div>
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

export default SignUpPage;
