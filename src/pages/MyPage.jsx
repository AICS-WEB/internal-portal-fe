import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

export default function MyPage({ currentUser, actions }) {
  return (
    <div className="page-stack">
      <SectionHeader
        title="My Page"
        description="내 프로필과 공개 여부를 관리합니다."
        actions={
          <>
            <Button variant="secondary" onClick={actions.openPasswordChange}>비밀번호 변경</Button>
            <Button variant="primary" onClick={actions.updateCurrentUser}>프로필 수정</Button>
          </>
        }
      />

      <section className="profile-layout">
        <article className="profile-card">
          <div className="profile-avatar">{currentUser.name?.slice(0, 1) || "-"}</div>
          <h2>{currentUser.name}</h2>
          <p>{currentUser.email}</p>
          <div className="inline-gap center">
            <Badge value={currentUser.role} />
            <Badge value={currentUser.account_status} />
            <Badge value={currentUser.is_public ? "public" : "private"} />
          </div>
        </article>

        <article className="panel">
          <SectionHeader title="프로필 정보" />
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
              <dd>{currentUser.phone || "-"}</dd>
            </div>
            <div>
              <dt>preferred_language</dt>
              <dd>{currentUser.preferred_language || "ko"}</dd>
            </div>
          </dl>
          <p className="muted-note">phone은 연구실 내부 연락을 위한 전용 정보입니다.</p>
          <p className="profile-bio">{currentUser.bio || "등록된 소개가 없습니다."}</p>
        </article>
      </section>
    </div>
  );
}
