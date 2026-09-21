import test from "node:test";
import assert from "node:assert/strict";
import { searchPortal } from "../src/utils/search.js";
import { projectStatus, projectStatusLabel, projectMonth, projectMonthPayload, validateProject } from "../src/utils/projects.js";
import { formatDateOnly } from "../src/utils/format.js";

test("global search finds different resources, Korean labels and separated words", () => {
  const data = {
    researchProjects: [{ id: 1, title: "로봇 학습", funding_agency: "한국 연구재단", status: "active" }],
    publications: [{ id: 2, title: "로봇 연구", authors_text: "홍길동" }],
  };
  const user = { role: "member" };
  assert.equal(searchPortal(data, "로봇", user).length, 2);
  assert.equal(searchPortal(data, "연구재단 로봇", user)[0].item.id, 1);
  assert.equal(searchPortal(data, "진행 중", user)[0].item.id, 1);
  assert.deepEqual(searchPortal(data, "없는 검색어", user), []);
  assert.deepEqual(searchPortal(data, "   ", user), []);
});

test("search respects role restrictions and does not search credential secrets", () => {
  const data = { sharedCredentials: [
    { id: 1, title: "서버", min_role: "admin", password: "secret" },
    { id: 2, title: "공용", min_role: "member", password: "secret" },
  ], users: [{ id: 3, name: "서버 관리자" }] };
  assert.equal(searchPortal(data, "서버", { role: "member" }).length, 0);
  assert.equal(searchPortal(data, "서버", { role: "admin" }).length, 2);
  assert.equal(searchPortal(data, "secret", { role: "admin" }).length, 0);
});

test("closed project date comes from the project's end date, not legacy status text", () => {
  assert.equal(projectStatus("closed 2022.04"), "closed");
  assert.equal(projectStatusLabel({ status: "closed 2022.04", end_date: "2026-09-30" }), "종료 (2026.09)");
  assert.equal(projectStatusLabel({ status: "closed 2022.04" }), "종료");
  assert.equal(projectStatusLabel({ status: "active" }), "진행 중");
});

test("project submission validates title, dates, integer order and normalizes legacy status", () => {
  assert.throws(() => validateProject({ title: " " }), /과제명/);
  assert.throws(() => validateProject({ title: "과제", start_date: "2026-10-01", end_date: "2026-09-01" }), /종료일/);
  assert.throws(() => validateProject({ title: "과제", display_order: 1.5 }), /정수/);
  assert.equal(validateProject({ title: " 과제 ", status: "closed 2022.04" }).status, "closed");
  assert.equal(validateProject({ title: " 과제 " }).title, "과제");
});

test("project dates round-trip the server's year.month format through month inputs", () => {
  assert.equal(projectMonth("2026.03"), "2026-03");
  assert.equal(projectMonth("2026-03-01T00:00:00.000Z"), "2026-03");
  assert.equal(projectMonthPayload("2026-03"), "2026.03");
  assert.equal(projectMonthPayload(""), null);
  assert.throws(() => projectMonthPayload("2026-13"), /연·월/);
  assert.equal(formatDateOnly("2026-03"), "2026.03");
  assert.equal(projectStatusLabel({ status: "closed 2022.04", end_date: "2026-09" }), "종료 (2026.09)");
});
