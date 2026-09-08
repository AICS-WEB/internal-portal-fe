import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { formatLabel } from "../utils/format.js";

export default function MyPage({ currentUser, actions }) {
  return (
    <div className="page-stack">
      <SectionHeader
        title="내 정보"
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
          <div className="profile-avatar">
            {currentUser.profile_image ? <img src={currentUser.profile_image} alt={`${currentUser.name} 프로필`} /> : currentUser.name?.slice(0, 1) || "-"}
          </div>
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
              <dt>학번</dt>
              <dd>{currentUser.student_id}</dd>
            </div>
            <div>
              <dt>소속 학과</dt>
              <dd>{currentUser.department}</dd>
            </div>
            <div>
              <dt>과정</dt>
              <dd>{formatLabel(currentUser.program)}</dd>
            </div>
            <div>
              <dt>입학 연도</dt>
              <dd>{currentUser.enrollment_year}</dd>
            </div>
            <div>
              <dt>연구 주제</dt>
              <dd>{currentUser.research_topic}</dd>
            </div>
            <div>
              <dt>GitHub 주소</dt>
              <dd>{currentUser.github_url || "-"}</dd>
            </div>
            <div>
              <dt>LinkedIn 주소</dt>
              <dd>{currentUser.linkedin_url || "-"}</dd>
            </div>
            <div>
              <dt>연락처</dt>
              <dd>{currentUser.phone || "-"}</dd>
            </div>
            <div>
              <dt>선호 언어</dt>
              <dd>{formatLabel(currentUser.preferred_language || "ko")}</dd>
            </div>
          </dl>
          <p className="muted-note">연락처는 연구실 내부 연락에만 사용합니다.</p>
          <p className="profile-bio">{formatLabel(currentUser.bio, "등록된 소개가 없습니다.")}</p>
        </article>
      </section>
    </div>
  );
}
