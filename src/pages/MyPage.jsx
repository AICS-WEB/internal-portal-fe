import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

export default function MyPage({ currentUser, actions }) {
  const profileFields = [
    { name: "name", label: "name", type: "text" },
    { name: "email", label: "email", type: "email" },
    { name: "student_id", label: "student_id", type: "text" },
    { name: "department", label: "department", type: "text" },
    { name: "program", label: "program", type: "text" },
    { name: "enrollment_year", label: "enrollment_year", type: "text" },
    { name: "research_topic", label: "research_topic", type: "text" },
    { name: "bio", label: "bio", type: "textarea" },
    { name: "github_url", label: "github_url", type: "url" },
    { name: "linkedin_url", label: "linkedin_url", type: "url" },
    { name: "phone", label: "phone", type: "tel" },
  ];

  const openProfileEdit = () => {
    actions.openForm({
      title: "프로필 수정",
      fields: profileFields,
      initialValues: currentUser,
      submitLabel: "저장",
      successMessage: "프로필이 수정되었습니다.",
      onSubmit: (values) => actions.updateCurrentUser(values),
    });
  };

  const openPasswordChange = () => {
    actions.openForm({
      title: "비밀번호 변경",
      fields: [
        { name: "current_password", label: "current_password", type: "password" },
        { name: "new_password", label: "new_password", type: "password" },
        { name: "confirm_password", label: "confirm_password", type: "password" },
      ],
      initialValues: {},
      submitLabel: "변경",
      successMessage: "비밀번호 변경 요청이 저장되었습니다.",
      onSubmit: () => {},
    });
  };

  return (
    <div className="page-stack">
      <SectionHeader title="My Page" description="내 프로필과 공개 여부를 관리합니다." />

      <section className="profile-layout">
        <article className="profile-card">
          <div className="profile-avatar">{currentUser.name.slice(0, 1)}</div>
          <h2>{currentUser.name}</h2>
          <p>{currentUser.email}</p>
          <div className="inline-gap center">
            <Badge value={currentUser.role} />
            <Badge value={currentUser.account_status} />
            <Badge value={currentUser.is_public ? "public" : "private"} />
          </div>
          <div className="button-row center">
            <Button variant="primary" onClick={openProfileEdit}>
              프로필 수정
            </Button>
            <Button variant="secondary" onClick={openPasswordChange}>
              비밀번호 변경
            </Button>
          </div>
        </article>

        <article className="panel">
          <SectionHeader
            title="프로필 정보"
            actions={
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={currentUser.is_public}
                  onChange={(event) => actions.updateCurrentUser({ is_public: event.target.checked })}
                />
                공개 프로필
              </label>
            }
          />
          <dl className="detail-grid">
            <div>
              <dt>student_id</dt>
              <dd>{currentUser.student_id}</dd>
            </div>
            <div>
              <dt>department</dt>
              <dd>{currentUser.department}</dd>
            </div>
            <div>
              <dt>program</dt>
              <dd>{currentUser.program}</dd>
            </div>
            <div>
              <dt>enrollment_year</dt>
              <dd>{currentUser.enrollment_year}</dd>
            </div>
            <div>
              <dt>research_topic</dt>
              <dd>{currentUser.research_topic}</dd>
            </div>
            <div>
              <dt>github_url</dt>
              <dd>{currentUser.github_url || "-"}</dd>
            </div>
            <div>
              <dt>linkedin_url</dt>
              <dd>{currentUser.linkedin_url || "-"}</dd>
            </div>
            <div>
              <dt>phone</dt>
              <dd>{currentUser.phone}</dd>
            </div>
          </dl>
          <p className="muted-note">phone은 연구실 내부 연락을 위한 전용 정보입니다.</p>
          <p className="profile-bio">{currentUser.bio}</p>
        </article>
      </section>
    </div>
  );
}
