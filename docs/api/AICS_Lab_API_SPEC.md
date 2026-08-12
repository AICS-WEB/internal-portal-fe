# AICS Lab Backend(내부 시스템) — API 명세서

- 내부시스템 관리자 메뉴에 외부 홈페이지 관리자 메뉴 버튼 기능 구현 후 한번에 내부시스템 관리자 페이지에서 관리 가능하게 통합

- 외부 홈페이지 API명세까지 더함.

- **Base URL**: http://localhost:4000

- **Response envelope**: { success, data, message }

- **Auth**: Authorization: Bearer \<accessToken\> (Public 표시된 것 제외)

- **RBAC 등급**: member \< manager \< admin

## 1. Auth — 인증 (/api/auth)

| **METHOD** | **URL**                          | **details**            | **auth** |
|------------|----------------------------------|------------------------|----------|
| POST       | /api/auth/register               | register account       | Public   |
| POST       | /api/auth/login                  | login, issue tokens    | Public   |
| POST       | /api/auth/refresh                | refresh access token   | Public   |
| POST       | /api/auth/logout                 | revoke refresh token   | Public   |
| POST       | /api/auth/password/reset-request | request password reset | Public   |
| POST       | /api/auth/password/reset         | confirm password reset | Public   |

## 2. Users — 사용자 프로필 (/api/users)

| **METHOD** | **URL**                    | **details**           | **auth**    |
|------------|----------------------------|-----------------------|-------------|
| GET        | /api/users/me              | get my profile        | Bearer      |
| GET        | /api/users/admin-dashboard | enter admin dashboard | Bearer+Role |

## 3. Attendance — 출결 (/api/attendance)

| **METHOD** | **URL**                   | **details** | **auth** |
|------------|---------------------------|-------------|----------|
| POST       | /api/attendance/check-in  | check in    | Bearer   |
| POST       | /api/attendance/check-out | check out   | Bearer   |

## 4. Leave — 휴가 (/api/leave)

| **METHOD** | **URL**                        | **details**   | **auth**    |
|------------|--------------------------------|---------------|-------------|
| POST       | /api/leave/requests            | request leave | Bearer      |
| PUT        | /api/leave/requests/:id/review | review leave  | Bearer+Role |

## 5. Calendar — 캘린더 (/api/calendar)

| **METHOD** | **URL**                             | **details**              | **auth** |
|------------|-------------------------------------|--------------------------|----------|
| POST       | /api/calendar/events                | create event             | Bearer   |
| GET        | /api/calendar/events                | list events              | Bearer   |
| GET        | /api/calendar/events/:id            | get event                | Bearer   |
| PATCH      | /api/calendar/events/:id            | update event             | Bearer   |
| DELETE     | /api/calendar/events/:id            | delete event             | Bearer   |
| POST       | /api/calendar/events/:id/exceptions | add recurrence exception | Bearer   |
| POST       | /api/calendar/events/:id/split      | split recurrence series  | Bearer   |

## 6. Notices — 공지사항 (/api/notices)

| **METHOD** | **URL**          | **details**                    | **auth**    |
|------------|------------------|--------------------------------|-------------|
| POST       | /api/notices     | create notice with attachments | Bearer+Role |
| GET        | /api/notices     | list notices                   | Bearer      |
| GET        | /api/notices/:id | get notice, increment view     | Bearer      |

## 7. Budget — 연구비 (/api/budget)

| **METHOD** | **URL**                         | **details**     | **auth**    |
|------------|---------------------------------|-----------------|-------------|
| POST       | /api/budget/expenses            | request expense | Bearer      |
| PUT        | /api/budget/expenses/:id/review | review expense  | Bearer+Role |

## 8. Publications — 논문 성과 (/api/publications)

| **METHOD** | **URL**               | **details**        | **auth** |
|------------|-----------------------|--------------------|----------|
| POST       | /api/publications     | create publication | Bearer   |
| GET        | /api/publications     | list publications  | Bearer   |
| GET        | /api/publications/:id | get publication    | Bearer   |
| PATCH      | /api/publications/:id | update publication | Bearer   |
| DELETE     | /api/publications/:id | delete publication | Bearer   |

## 9. Files — 파일 공유 (/api/files)

| **METHOD** | **URL**                 | **details**               | **auth** |
|------------|-------------------------|---------------------------|----------|
| POST       | /api/files              | create file meta          | Bearer   |
| GET        | /api/files              | list files                | Bearer   |
| GET        | /api/files/:id          | get file                  | Bearer   |
| GET        | /api/files/:id/download | download, increment count | Bearer   |
| PATCH      | /api/files/:id          | update file, bump version | Bearer   |
| DELETE     | /api/files/:id          | delete file               | Bearer   |

## 10. Procurement — 물품 구매 (/api/procurement)

| **METHOD** | **URL**                              | **details**      | **auth**    |
|------------|--------------------------------------|------------------|-------------|
| POST       | /api/procurement/requests            | request purchase | Bearer      |
| PUT        | /api/procurement/requests/:id/review | review purchase  | Bearer+Role |
| PUT        | /api/procurement/requests/:id/status | advance status   | Bearer+Role |

## 11. Credentials — 공용 비밀번호 (/api/credentials)

| **METHOD** | **URL**                     | **details**                   | **auth** |
|------------|-----------------------------|-------------------------------|----------|
| POST       | /api/credentials            | create credential (encrypted) | Bearer   |
| GET        | /api/credentials            | list credentials              | Bearer   |
| GET        | /api/credentials/:id        | get credential meta           | Bearer   |
| GET        | /api/credentials/:id/reveal | reveal password, log view     | Bearer   |
| POST       | /api/credentials/:id/copy   | log copy action               | Bearer   |
| PATCH      | /api/credentials/:id        | update credential             | Bearer   |
| DELETE     | /api/credentials/:id        | delete credential             | Bearer   |

## 12. Notifications — 시스템 알림 (/api/notifications)

| **METHOD** | **URL**                         | **details**           | **auth**    |
|------------|---------------------------------|-----------------------|-------------|
| GET        | /api/notifications              | list my notifications | Bearer      |
| GET        | /api/notifications/unread-count | get unread count      | Bearer      |
| POST       | /api/notifications              | send notification     | Bearer+Role |
| PATCH      | /api/notifications/read-all     | mark all read         | Bearer      |
| PATCH      | /api/notifications/:id/read     | mark one read         | Bearer      |

## 13. Applications (Public) — 연구생 지원 · 공개 (/api/public/applications)

| **METHOD** | **URL**                  | **details**        | **auth** |
|------------|--------------------------|--------------------|----------|
| POST       | /api/public/applications | submit application | Public   |

## 14. Applications (Admin) — 연구생 지원 · 관리자 (/api/applications)

| **METHOD** | **URL**               | **details**                | **auth**    |
|------------|-----------------------|----------------------------|-------------|
| GET        | /api/applications     | list applications          | Bearer+Role |
| GET        | /api/applications/:id | get application, mark read | Bearer+Role |
| PATCH      | /api/applications/:id | update status/memo         | Bearer+Role |
| DELETE     | /api/applications/:id | delete application         | Bearer+Role |

## 요약

| **도메인**                                | **엔드포인트 수** |
|-------------------------------------------|-------------------|
| Auth — 인증                               | 5                 |
| Users — 사용자 프로필                     | 2                 |
| Attendance — 출결                         | 2                 |
| Leave — 휴가                              | 2                 |
| Calendar — 캘린더                         | 7                 |
| Notices — 공지사항                        | 3                 |
| Budget — 연구비                           | 2                 |
| Publications — 논문 성과                  | 5                 |
| Files — 파일 공유                         | 6                 |
| Procurement — 물품 구매                   | 3                 |
| Credentials — 공용 비밀번호               | 7                 |
| Notifications — 시스템 알림               | 5                 |
| Applications (Public) — 연구생 지원 공개  | 1                 |
| Applications (Admin) — 연구생 지원 관리자 | 4                 |
| **총**                                    | **54**            |
