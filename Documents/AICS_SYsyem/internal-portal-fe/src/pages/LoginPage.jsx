import { useState } from "react";
import { loginUser, requestPasswordReset } from "../api/auth.js";
import BrandMark from "../components/BrandMark.jsx";
import Button from "../components/Button.jsx";

export default function LoginPage({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);

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

  const handleResetRequest = async (event) => {
    event.preventDefault();
    const normalizedEmail = resetEmail.trim();
    if (!normalizedEmail) {
      setResetError("가입한 이메일을 입력해 주세요.");
      return;
    }

    setResetSubmitting(true);
    setResetError("");
    setResetSent(false);
    try {
      await requestPasswordReset(normalizedEmail);
      setResetSent(true);
    } catch (resetRequestError) {
      setResetError(resetRequestError.message);
    } finally {
      setResetSubmitting(false);
    }
  };

  const closeResetMode = () => {
    setResetMode(false);
    setResetError("");
    setResetSent(false);
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="auth-visual">
          <div className="auth-brand">
            <BrandMark />
            <span>
              <strong>AICS Lab Hub</strong>
              <small>내부 운영 포털</small>
            </span>
          </div>
          <div className="auth-visual-copy">
            <p className="register-eyebrow">AICS 연구실 업무 공간</p>
            <h1>연구와 운영을<br />하나의 흐름으로</h1>
            <p>연구실 일정, 출결, 연구 성과와 내부 자료를 한 곳에서 관리하세요.</p>
          </div>
          <div className="auth-feature-list">
            <span>연구 관리</span>
            <span>연구실 운영</span>
            <span>구성원 협업</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-copy">
            <p className="register-eyebrow">{resetMode ? "PASSWORD RESET" : "WELCOME BACK"}</p>
            <h2>{resetMode ? "비밀번호 재설정" : "로그인"}</h2>
            <p>{resetMode ? "가입한 이메일로 재설정 안내를 받을 수 있습니다." : "승인된 연구실 계정으로 로그인해 주세요."}</p>
          </div>

          {resetMode ? (
            <form className="login-form" onSubmit={handleResetRequest}>
              <label className="field">
                <span>가입 이메일</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={resetEmail}
                  onChange={(event) => {
                    setResetEmail(event.target.value);
                    setResetError("");
                    setResetSent(false);
                  }}
                  placeholder="name@sch.ac.kr"
                  autoFocus
                />
              </label>
              {resetSent ? (
                <div className="reset-submit-success" role="status">
                  입력한 이메일로 재설정 안내를 발송했습니다. 받은편지함과 스팸함을 확인해 주세요.
                </div>
              ) : null}
              {resetError ? <div className="register-submit-error" role="alert">{resetError}</div> : null}
              <Button type="submit" variant="primary" className="login-submit" disabled={resetSubmitting}>
                {resetSubmitting ? "발송 중..." : "재설정 메일 발송"}
              </Button>
              <Button variant="ghost" onClick={closeResetMode} disabled={resetSubmitting}>로그인으로 돌아가기</Button>
            </form>
          ) : (
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
              <span className="field-label-row">
                <span>비밀번호</span>
              </span>
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
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => {
                  setResetEmail(email);
                  setResetMode(true);
                }}
              >
                비밀번호를 잊으셨나요?
              </button>
            </label>

            {error ? <div className="register-submit-error" role="alert">{error}</div> : null}

            <Button type="submit" variant="primary" className="login-submit" disabled={submitting}>
              {submitting ? "로그인 중..." : "로그인"}
            </Button>
          </form>
          )}

          {!resetMode ? <div className="login-register-prompt">
            <span>아직 연구실 계정이 없나요?</span>
            <button type="button" onClick={onRegister}>회원가입 신청</button>
          </div> : null}

          <p className="login-help">계정 승인이 필요한 경우 연구실 관리자에게 문의해 주세요.</p>
        </div>
      </section>
    </main>
  );
}
