"use client";
import { useState } from "react";
import { api, authStore } from "../lib/api";
import { Button, Field, Notice } from "../components/ui";

type Mode = "login"|"register"|"reset-request"|"reset"|"apply";
export default function AuthPages({ onLogin, onPreview }:{onLogin:()=>void; onPreview:()=>void}) {
  const [mode,setMode]=useState<Mode>("login"); const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState("");
  async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");setMessage("");const values=Object.fromEntries(new FormData(e.currentTarget));try{
    if(mode==="login"){const data=await api.auth.login(values);authStore.save(data);onLogin();return;}
    if(mode==="register")await api.auth.register(values); if(mode==="reset-request")await api.auth.resetRequest(values); if(mode==="reset")await api.auth.reset(values); if(mode==="apply")await api.applications.publicCreate(values);
    setMessage(mode==="apply"?"지원서가 접수되었습니다.":mode==="register"?"계정 생성 요청이 완료되었습니다.":"요청이 접수되었습니다.");
  }catch(e){setError(e instanceof Error?e.message:"요청을 처리하지 못했습니다.");}finally{setBusy(false)}}
  const titles={login:"연구실 계정으로 로그인하세요.",register:"새 계정을 만듭니다.","reset-request":"비밀번호 재설정 링크를 요청합니다.",reset:"새 비밀번호를 설정합니다.",apply:"연구생 지원"};
  return <main className="auth-page"><section className="auth-brand"><div className="brand-mark large">A</div><h1>AICS Lab</h1><p>Internal Portal</p><span>연구 운영을 위한 하나의 차분한 작업 공간</span></section><section className="auth-panel"><div><button className="text-button" onClick={()=>setMode("login")}>{mode!=="login"?"← 로그인으로":""}</button><h2>{titles[mode]}</h2><form onSubmit={submit}>
    {mode==="apply"?<><Field label="이름"><input name="name" required/></Field><Field label="이메일"><input name="email" type="email" required/></Field><Field label="지원 학기"><input name="term" placeholder="예: 2026년 가을" required/></Field><Field label="지원 내용"><textarea name="message" rows={5} required/></Field></>:<><Field label="이메일"><input name="email" type="email" required/></Field>{mode!=="reset-request"&&<Field label={mode==="reset"?"새 비밀번호":"비밀번호"}><input name="password" type="password" required/></Field>}{mode==="register"&&<Field label="이름"><input name="name" required/></Field>}{mode==="reset"&&<Field label="재설정 토큰"><input name="token" required/></Field>}</>}
    {error&&<Notice tone="error">{error}</Notice>}{message&&<Notice tone="success">{message}</Notice>}<Button variant="primary" disabled={busy}>{busy?"처리 중...":mode==="login"?"Login":"Submit"}</Button>
  </form>{mode==="login"&&<><div className="preview-entry"><span>백엔드 없이 화면을 확인하려면</span><Button onClick={onPreview}>UI 미리보기</Button><small>실제 계정이 아니며 데이터 변경은 저장되지 않습니다.</small></div><div className="auth-links"><button onClick={()=>setMode("register")}>Create account</button><button onClick={()=>setMode("reset-request")}>Forgot password?</button><button onClick={()=>setMode("apply")}>Researcher application</button></div></>}{mode==="reset-request"&&<button className="under-link" onClick={()=>setMode("reset")}>재설정 토큰이 있나요?</button>}</div></section></main>;
}
