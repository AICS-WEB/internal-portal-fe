import { useState } from "react";
import { applicationsApi } from "../api/applicationsApi.js";
import Button from "../components/Button.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function ApplyPage({ onBack, showToast }) {
  const [submitted, setSubmitted] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    targetTerm: "",
    name: "",
    email: "",
    phone: "",
    studentId: "",
    department: "",
    grade: "",
    interestArea: "",
    introduction: "",
    githubUrl: "",
    portfolioUrl: "",
    privacyConsent: false,
  });

  const update = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const data = await applicationsApi.submitApplication(form);
      setSubmitted(data);
      showToast("지원서가 접수되었습니다.");
    } catch (error) {
      showToast(error.message || "지원서 제출에 실패했습니다.", "warning");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="panel">
        <SectionHeader
          title="AICS Lab 지원"
          description="인증 없이 제출 가능한 공개 지원 페이지입니다."
          actions={
            <Button variant="secondary" onClick={onBack}>
              내부 포털
            </Button>
          }
        />

        {submitted ? (
          <div className="empty-state">
            <strong>접수가 완료되었습니다.</strong>
            <p>
              접수번호 {submitted.id} · 상태 {submitted.status}
            </p>
          </div>
        ) : (
          <form className="form-grid application-form" onSubmit={submit} aria-busy={submitting}>
            <Field label="targetTerm">
              <input value={form.targetTerm} onChange={(event) => update("targetTerm", event.target.value)} required />
            </Field>
            <Field label="name">
              <input value={form.name} onChange={(event) => update("name", event.target.value)} required />
            </Field>
            <Field label="email">
              <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
            </Field>
            <Field label="phone">
              <input value={form.phone} onChange={(event) => update("phone", event.target.value)} />
            </Field>
            <Field label="studentId">
              <input value={form.studentId} onChange={(event) => update("studentId", event.target.value)} />
            </Field>
            <Field label="department">
              <input value={form.department} onChange={(event) => update("department", event.target.value)} />
            </Field>
            <Field label="grade">
              <input value={form.grade} onChange={(event) => update("grade", event.target.value)} />
            </Field>
            <Field label="interestArea">
              <textarea rows={3} value={form.interestArea} onChange={(event) => update("interestArea", event.target.value)} />
            </Field>
            <Field label="introduction">
              <textarea rows={6} value={form.introduction} onChange={(event) => update("introduction", event.target.value)} />
            </Field>
            <Field label="githubUrl">
              <input type="url" value={form.githubUrl} onChange={(event) => update("githubUrl", event.target.value)} />
            </Field>
            <Field label="portfolioUrl">
              <input type="url" value={form.portfolioUrl} onChange={(event) => update("portfolioUrl", event.target.value)} />
            </Field>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={form.privacyConsent}
                onChange={(event) => update("privacyConsent", event.target.checked)}
                required
              />
              <span>개인정보 수집 및 이용에 동의합니다.</span>
            </label>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "제출 중" : "지원서 제출"}
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
