import React, { useState } from 'react';

/**
 * 로그인 및 회원가입 관리 컴포넌트
 * 기능: 유저의 인증 상태를 관리하고, 로그인/회원가입 폼을 전환하는 샌드박스 시스템입니다.
 */
export default function Login({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // 추후 백엔드(Firebase 또는 Spring/Node) API 연동 알고리즘이 들어갈 자리입니다.
    if (email && password) {
      alert(`${isSignUp ? '회원가입' : '로그인'} 성공!`);
      onLoginSuccess({ email, name: name || '사용자' });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1e1e1e', color: '#fff' }}>
      <div style={{ background: '#252526', padding: '40px', borderRadius: '8px', border: '1px solid #333', width: '320px' }}>
        <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'col', gap: '15px', marginTop: '20px' }}>
          {isSignUp && (
            <input 
              type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required
              style={{ padding: '10px', background: '#1e1e1e', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
            />
          )}
          <input 
            type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
            style={{ padding: '10px', background: '#1e1e1e', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
          />
          <input 
            type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
            style={{ padding: '10px', background: '#1e1e1e', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
          />
          <button type="submit" style={{ padding: '10px', background: '#007acc', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <p onClick={() => setIsSignUp(!isSignUp)} style={{ marginTop: '15px', textAlign: 'center', fontSize: '12px', color: '#007acc', cursor: 'pointer' }}>
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </p>
      </div>
    </div>
  );
}