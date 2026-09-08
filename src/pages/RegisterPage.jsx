import { useMemo, useState } from "react";
import { registerUser } from "../api/auth.js";
import BrandMark from "../components/BrandMark.jsx";
import Button from "../components/Button.jsx";

const currentYear = new Date().getFullYear();

const initialValues = {
  email: "",
  password: "",
  passwordConfirm: "",
  name: "",
  studentId: "",
  department: "",
  programLevel: "undergrad",
  graduateProgram: "master",
  enrollmentYear: String(currentYear),
  researchTopic: "",
  profileImage: "",
  phone: "",
  githubUrl: "",
  linkedinUrl: "",
};

function FieldError({ message }) {
  return message ? <span className="register-field-error">{message}</span> : null;
}

export default function RegisterPage({ onBack }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const selectedProgram = values.programLevel === "undergrad" ? "undergrad" : values.graduateProgram;
  const profileInitial = useMemo(() => values.name.trim().slice(0, 1) || "AI", [values.name]);

  const updateValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSubmitError("");
  };

  const validate = () => {
    const nextErrors = {};
    const enrollmentYear = Number(values.enrollmentYear);

    if (!values.email.trim()) nextErrors.email = "이메일을 입력해 주세요.";
    if (!values.password) nextErrors.password = "비밀번호를 입력해 주세요.";
    else if (values.password.length < 8) nextErrors.password = "비밀번호는 8자 이상이어야 합니다.";
    if (values.password !== values.passwordConfirm) nextErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    if (!values.name.trim()) nextErrors.name = "이름을 입력해 주세요.";
    if (!values.studentId.trim()) nextErrors.studentId = "학번을 입력해 주세요.";
    if (!values.department.trim()) nextErrors.department = "학과를 입력해 주세요.";
    if (!Number.isInteger(enrollmentYear)) nextErrors.enrollmentYear = "올바른 입학년도를 입력해 주세요.";
    if (!values.researchTopic.trim()) nextErrors.researchTopic = "연구 주제를 입력해 주세요.";
    if (!values.phone.trim()) nextErrors.phone = "전화번호를 입력해 주세요.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const user = await registerUser({
        email: values.email.trim(),
        password: values.password,
        name: values.name.trim(),
        studentId: values.studentId.trim(),
        department: values.department.trim(),
        program: selectedProgram,
        enrollmentYear: Number(values.enrollmentYear),
        researchTopic: values.researchTopic.trim(),
        profileImage: values.profileImage.trim() || null,
        phone: values.phone.trim(),
        bio: null,
        githubUrl: values.githubUrl.trim() || null,
        linkedinUrl: values.linkedinUrl.trim() || null,
      });
      setRegisteredUser(user);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (registeredUser) {
    return (
      <main className="register-shell">
        <section className="register-success-card">
          <div className="register-success-icon" aria-hidden="true">✓</div>
          <p className="register-eyebrow">AICS LAB MEMBERSHIP</p>
          <h1>가입 신청이 완료되었습니다</h1>
          <p>
            <strong>{registeredUser.name || values.name}</strong>님의 신청을 접수했습니다.
            관리자 승인 후 포털에 로그인할 수 있습니다.
          </p>
          <div className="register-success-info">
            <span>신청 이메일</span>
            <strong>{registeredUser.email || values.email}</strong>
          </div>
          <Button variant="primary" onClick={onBack}>로그인으로 돌아가기</Button>
        </section>
      </main>
    );
  }

  return (
    <main className="register-shell">
      <div className="register-layout">
        <aside className="register-intro">
          <button type="button" className="register-brand" onClick={onBack}>
            <BrandMark />
            <span>
              <strong>AICS Lab Hub</strong>
              <small>내부 포털</small>
            </span>
          </button>
          <div className="register-intro-copy">
            <p className="register-eyebrow">JOIN THE LAB</p>
            <h1>연구실 구성원 가입 신청</h1>
            <p>기본 정보와 연구 정보를 입력하면 관리자 검토 후 내부 포털 계정이 활성화됩니다.</p>
          </div>
          <ol className="register-steps">
            <li><span>1</span>가입 정보 입력</li>
            <li><span>2</span>관리자 확인</li>
            <li><span>3</span>계정 승인 및 로그인</li>
          </ol>
        </aside>

        <section className="register-card">
          <div className="register-card-header">
            <div>
              <p className="register-eyebrow">MEMBER REGISTRATION</p>
              <h2>회원가입</h2>
              <p>별표(*)가 표시된 항목은 필수입니다.</p>
            </div>
            <Button variant="ghost" onClick={onBack}>로그인</Button>
          </div>

          <form className="register-form" onSubmit={handleSubmit} noValidate>
            <fieldset className="register-section">
              <legend>계정 정보</legend>
              <div className="register-fields two-columns">
                <label className="field register-span-2">
                  <span>이메일 *</span>
                  <input type="email" autoComplete="email" value={values.email} onChange={(event) => updateValue("email", event.target.value)} placeholder="name@sch.ac.kr" aria-invalid={Boolean(errors.email)} />
                  <FieldError message={errors.email} />
                </label>
                <label className="field">
                  <span>비밀번호 *</span>
                  <input type="password" autoComplete="new-password" value={values.password} onChange={(event) => updateValue("password", event.target.value)} placeholder="8자 이상" aria-invalid={Boolean(errors.password)} />
                  <FieldError message={errors.password} />
                </label>
                <label className="field">
                  <span>비밀번호 확인 *</span>
                  <input type="password" autoComplete="new-password" value={values.passwordConfirm} onChange={(event) => updateValue("passwordConfirm", event.target.value)} placeholder="비밀번호 재입력" aria-invalid={Boolean(errors.passwordConfirm)} />
                  <FieldError message={errors.passwordConfirm} />
                </label>
              </div>
            </fieldset>

            <fieldset className="register-section">
              <legend>학적 정보</legend>
              <div className="register-fields two-columns">
                <label className="field">
                  <span>이름 *</span>
                  <input value={values.name} onChange={(event) => updateValue("name", event.target.value)} placeholder="홍길동" aria-invalid={Boolean(errors.name)} />
                  <FieldError message={errors.name} />
                </label>
                <label className="field">
                  <span>학번 *</span>
                  <input value={values.studentId} onChange={(event) => updateValue("studentId", event.target.value)} placeholder="20260000" aria-invalid={Boolean(errors.studentId)} />
                  <FieldError message={errors.studentId} />
                </label>
                <label className="field register-span-2">
                  <span>학과 *</span>
                  <input value={values.department} onChange={(event) => updateValue("department", event.target.value)} placeholder="컴퓨터소프트웨어공학과" aria-invalid={Boolean(errors.department)} />
                  <FieldError message={errors.department} />
                </label>
                <div className="register-choice-field register-span-2">
                  <span>과정 *</span>
                  <div className="register-radio-group">
                    <label><input type="radio" name="programLevel" value="undergrad" checked={values.programLevel === "undergrad"} onChange={(event) => updateValue("programLevel", event.target.value)} /><span>학부생</span></label>
                    <label><input type="radio" name="programLevel" value="graduate" checked={values.programLevel === "graduate"} onChange={(event) => updateValue("programLevel", event.target.value)} /><span>대학원생</span></label>
                  </div>
                </div>
                {values.programLevel === "graduate" ? (
                  <label className="field register-span-2">
                    <span>대학원 과정 *</span>
                    <select value={values.graduateProgram} onChange={(event) => updateValue("graduateProgram", event.target.value)}>
                      <option value="master">석사</option>
                      <option value="phd">박사</option>
                    </select>
                  </label>
                ) : null}
                <label className="field register-span-2">
                  <span>입학년도 *</span>
                  <input type="number" min="1990" max={currentYear + 1} value={values.enrollmentYear} onChange={(event) => updateValue("enrollmentYear", event.target.value)} aria-invalid={Boolean(errors.enrollmentYear)} />
                  <FieldError message={errors.enrollmentYear} />
                </label>
              </div>
            </fieldset>

            <fieldset className="register-section">
              <legend>연구 및 연락처</legend>
              <div className="register-fields two-columns">
                <label className="field register-span-2">
                  <span>연구 주제 *</span>
                  <textarea rows="4" value={values.researchTopic} onChange={(event) => updateValue("researchTopic", event.target.value)} placeholder="관심 연구 분야와 진행 중인 연구를 입력해 주세요." aria-invalid={Boolean(errors.researchTopic)} />
                  <FieldError message={errors.researchTopic} />
                </label>
                <label className="field register-span-2">
                  <span>전화번호 *</span>
                  <input type="tel" autoComplete="tel" value={values.phone} onChange={(event) => updateValue("phone", event.target.value)} placeholder="010-0000-0000" aria-invalid={Boolean(errors.phone)} />
                  <FieldError message={errors.phone} />
                </label>
                <label className="field">
                  <span>GitHub 주소</span>
                  <input type="url" value={values.githubUrl} onChange={(event) => updateValue("githubUrl", event.target.value)} placeholder="https://github.com/username" />
                </label>
                <label className="field">
                  <span>LinkedIn 주소</span>
                  <input type="url" value={values.linkedinUrl} onChange={(event) => updateValue("linkedinUrl", event.target.value)} placeholder="https://linkedin.com/in/username" />
                </label>
              </div>
            </fieldset>

            <fieldset className="register-section">
              <legend>프로필 이미지</legend>
              <div className="register-profile-field">
                <div className="register-profile-preview">
                  {values.profileImage ? <img src={values.profileImage} alt="프로필 미리보기" /> : <span>{profileInitial}</span>}
                </div>
                <label className="field">
                  <span>프로필 이미지 주소</span>
                  <input type="url" value={values.profileImage} onChange={(event) => updateValue("profileImage", event.target.value)} placeholder="https://example.com/profile.jpg" />
                  <small>이미지 업로드 기능이 연결되기 전까지 공개 이미지 주소를 사용합니다.</small>
                </label>
              </div>
            </fieldset>

            {submitError ? <div className="register-submit-error" role="alert">{submitError}</div> : null}

            <div className="register-form-footer">
              <p>가입 신청 시 입력 정보가 관리자 승인 검토에 사용됩니다.</p>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "신청 중..." : "가입 신청"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
