import { useMemo, useState } from "react";
import { resetPassword } from "../api/auth.js";
import BrandMark from "../components/BrandMark.jsx";
import Button from "../components/Button.jsx";

export default function ResetPasswordPage({ onBackToLogin }) {
  const token = useMemo(() => new URLSearchParams(window.location.search).get("token")?.trim() || "", []);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("재설정 토큰이 없습니다. 이메일의 비밀번호 재설정 링크를 다시 열어 주세요.");
      return;
    }
    if (newPassword.length < 8) {
      setError("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ token, newPassword });
      setNewPassword("");
      setConfirmPassword("");
      setCompleted(true);
    } catch (resetError) {
      setError(resetError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel reset-password-panel">
        <div className="auth-visual">
          <div className="auth-brand">
            <BrandMark />
            <span>
              <strong>AICS Lab Hub</strong>
              <small>Internal Portal</small>
            </span>
          </div>
          <div className="auth-visual-copy">
            <p className="register-eyebrow">ACCOUNT SECURITY</p>
            <h1>안전하게<br />다시 시작하세요</h1>
            <p>새 비밀번호를 설정하면 이전 비밀번호로는 더 이상 로그인할 수 없습니다.</p>
          </div>
          <div className="auth-feature-list">
            <span>One-time link</span>
            <span>Secure password</span>
            <span>60-minute expiry</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-copy">
            <p className="register-eyebrow">PASSWORD RESET</p>
            <h2>{completed ? "변경 완료" : "새 비밀번호 설정"}</h2>
            <p>
              {completed
                ? "비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해 주세요."
                : "8자 이상의 새로운 비밀번호를 입력해 주세요."}
            </p>
          </div>

          {completed ? (
            <div className="reset-password-complete" role="status">
              <div className="reset-password-complete-icon" aria-hidden="true">✓</div>
              <p>새 비밀번호가 적용되었습니다.</p>
              <Button variant="primary" className="login-submit" onClick={onBackToLogin}>
                로그인하러 가기
              </Button>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              {!token ? (
                <div className="register-submit-error" role="alert">
                  올바르지 않은 접근입니다. 이메일에 포함된 재설정 링크를 이용해 주세요.
                </div>
              ) : null}

              <label className="field">
                <span>새 비밀번호</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="8자 이상 입력"
                  minLength={8}
                  disabled={!token || submitting}
                  autoFocus={Boolean(token)}
                />
              </label>

              <label className="field">
                <span>새 비밀번호 확인</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="새 비밀번호 다시 입력"
                  minLength={8}
                  disabled={!token || submitting}
                />
              </label>

              {error ? <div className="register-submit-error" role="alert">{error}</div> : null}

              <Button type="submit" variant="primary" className="login-submit" disabled={!token || submitting}>
                {submitting ? "변경 중..." : "비밀번호 변경"}
              </Button>
              <Button variant="ghost" onClick={onBackToLogin} disabled={submitting}>
                로그인 화면으로 돌아가기
              </Button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
