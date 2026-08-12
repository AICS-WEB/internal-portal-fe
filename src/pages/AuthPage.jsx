import { useState } from "react";
import Button from "../components/Button.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

const authTabs = [
  { id: "login", label: "로그인" },
  { id: "register", label: "회원가입" },
  { id: "resetRequest", label: "비밀번호 재설정" },
  { id: "reset", label: "재설정 완료" },
];

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function AuthPage({ auth, onApply, onSuccess, showToast }) {
  const [tab, setTab] = useState("login");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    studentId: "",
    department: "",
    program: "",
    enrollmentYear: "",
    researchTopic: "",
    profileImage: "",
    phone: "",
    bio: "",
    githubUrl: "",
    linkedinUrl: "",
    resetToken: "",
    newPassword: "",
  });

  const update = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (tab === "login") {
        await auth.login({ email: form.email, password: form.password });
        showToast("로그인되었습니다.");
        onSuccess?.();
      }
      if (tab === "register") {
        if (form.password !== form.confirmPassword) {
          throw new Error("비밀번호 확인이 일치하지 않습니다.");
        }
        await auth.register({
          email: form.email,
          password: form.password,
          name: form.name,
          studentId: form.studentId,
          department: form.department,
          program: form.program,
          enrollmentYear: form.enrollmentYear,
          researchTopic: form.researchTopic,
          profileImage: form.profileImage,
          phone: form.phone,
          bio: form.bio,
          githubUrl: form.githubUrl,
          linkedinUrl: form.linkedinUrl,
        });
        showToast("회원가입 신청이 접수되었습니다. 관리자 승인 후 로그인할 수 있습니다.");
        setTab("login");
      }
      if (tab === "resetRequest") {
        await auth.requestPasswordReset(form.email);
        showToast("비밀번호 재설정 요청이 접수되었습니다.");
        setTab("reset");
      }
      if (tab === "reset") {
        if (form.newPassword !== form.confirmPassword) {
          throw new Error("새 비밀번호 확인이 일치하지 않습니다.");
        }
        await auth.resetPassword({ token: form.resetToken, newPassword: form.newPassword });
        showToast("비밀번호가 재설정되었습니다.");
        setTab("login");
      }
    } catch (error) {
      showToast(error.message || "요청 처리에 실패했습니다.", "warning");
    } finally {
      setSubmitting(false);
    }
  };

  const enterPreview = () => {
    auth.enterPreview();
    showToast("읽기 전용 UI 미리보기로 입장했습니다.");
    onSuccess?.();
  };

  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <span className="brand-mark">AI</span>
        <div><strong>AICS Lab</strong><span>Internal Portal</span></div>
      </section>

      <section className="panel auth-panel">
        <SectionHeader title="AICS Lab에 오신 것을 환영합니다" description={auth.authError || "승인된 연구실 구성원 계정으로 로그인해 주세요."} />
        <div className="filter-tabs" role="tablist" aria-label="인증 화면 선택">
          {authTabs.map((item) => (
            <button key={item.id} type="button" className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>
              {item.label}
            </button>
          ))}
        </div>

        <form className="form-grid auth-form" onSubmit={submit} aria-busy={submitting}>
          {tab !== "reset" ? (
            <Field label="email">
              <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
            </Field>
          ) : null}

          {tab === "login" ? (
            <Field label="password">
              <input type="password" value={form.password} onChange={(event) => update("password", event.target.value)} required />
            </Field>
          ) : null}

          {tab === "register" ? (
            <>
              <Field label="password">
                <input type="password" value={form.password} onChange={(event) => update("password", event.target.value)} required />
              </Field>
              <Field label="confirm_password">
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => update("confirmPassword", event.target.value)}
                  required
                />
              </Field>
              <Field label="name">
                <input value={form.name} onChange={(event) => update("name", event.target.value)} required />
              </Field>
              <Field label="studentId">
                <input value={form.studentId} onChange={(event) => update("studentId", event.target.value)} required />
              </Field>
              <Field label="department">
                <input value={form.department} onChange={(event) => update("department", event.target.value)} required />
              </Field>
              <Field label="program">
                <input value={form.program} onChange={(event) => update("program", event.target.value)} required />
              </Field>
              <Field label="enrollmentYear">
                <input value={form.enrollmentYear} onChange={(event) => update("enrollmentYear", event.target.value)} required />
              </Field>
              <Field label="researchTopic">
                <input value={form.researchTopic} onChange={(event) => update("researchTopic", event.target.value)} />
              </Field>
              <Field label="phone">
                <input value={form.phone} onChange={(event) => update("phone", event.target.value)} />
              </Field>
              <Field label="bio">
                <textarea rows={3} value={form.bio} onChange={(event) => update("bio", event.target.value)} />
              </Field>
              <Field label="githubUrl">
                <input type="url" value={form.githubUrl} onChange={(event) => update("githubUrl", event.target.value)} />
              </Field>
              <Field label="linkedinUrl">
                <input type="url" value={form.linkedinUrl} onChange={(event) => update("linkedinUrl", event.target.value)} />
              </Field>
            </>
          ) : null}

          {tab === "reset" ? (
            <>
              <Field label="token">
                <input value={form.resetToken} onChange={(event) => update("resetToken", event.target.value)} required />
              </Field>
              <Field label="newPassword">
                <input type="password" value={form.newPassword} onChange={(event) => update("newPassword", event.target.value)} required />
              </Field>
              <Field label="confirm_password">
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => update("confirmPassword", event.target.value)}
                  required
                />
              </Field>
            </>
          ) : null}

          <div className="button-row">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "처리 중" : authTabs.find((item) => item.id === tab)?.label}
            </Button>
            <Button variant="secondary" onClick={onApply}>
              지원 페이지
            </Button>
          </div>
        </form>

        <div className="preview-entry">
          <div>
            <strong>백엔드 없이 화면만 확인하기</strong>
            <p>관리자 메뉴를 포함한 내부 UI에 읽기 전용으로 진입합니다. 실제 데이터는 생성되지 않습니다.</p>
          </div>
          <Button variant="secondary" onClick={enterPreview}>UI 미리보기</Button>
        </div>
      </section>
    </main>
  );
}
