import { useState } from "react";
import { loginUser } from "../api/auth.js";
import Button from "../components/Button.jsx";

export default function LoginPage({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const session = await loginUser({ email: email.trim(), password });
      onLogin(session);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="auth-visual">
          <div className="auth-brand">
            <span className="brand-mark">AI</span>
            <span>
              <strong>AICS Lab Hub</strong>
              <small>Internal Portal</small>
            </span>
          </div>
          <div className="auth-visual-copy">
            <p className="register-eyebrow">AICS LAB WORKSPACE</p>
            <h1>연구와 운영을<br />하나의 흐름으로</h1>
            <p>연구실 일정, 출결, 연구 성과와 내부 자료를 한 곳에서 관리하세요.</p>
          </div>
          <div className="auth-feature-list">
            <span>Research Management</span>
            <span>Lab Operations</span>
            <span>Team Collaboration</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-copy">
            <p className="register-eyebrow">WELCOME BACK</p>
            <h2>로그인</h2>
            <p>승인된 연구실 계정으로 로그인해 주세요.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>이메일</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="name@sch.ac.kr"
                autoFocus
              />
            </label>
            <label className="field">
              <span>비밀번호</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="비밀번호 입력"
              />
            </label>

            {error ? <div className="register-submit-error" role="alert">{error}</div> : null}

            <Button type="submit" variant="primary" className="login-submit" disabled={submitting}>
              {submitting ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="login-register-prompt">
            <span>아직 연구실 계정이 없나요?</span>
            <button type="button" onClick={onRegister}>회원가입 신청</button>
          </div>

          <p className="login-help">계정 승인이 필요한 경우 연구실 관리자에게 문의해 주세요.</p>
        </div>
      </section>
    </main>
  );
}
