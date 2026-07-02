import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import Login from './components/Login';
import FileTree from './components/FileTree';
import Chat from './components/Chat';

/**
 * Web IDE 통합 마스터 제어 어플리케이션
 * 아키텍처: 단방향 데이터 흐름(Unidirectional Data Flow)을 유지하며 인증 상태와 현재 활성화된 파일 코드를 최상위 계층에서 오케스트레이션합니다.
 */
export default function App() {
  const [user, setUser] = useState(null); // 유저 인증 상태 관리 State
  const [currentFile, setCurrentFile] = useState({
    name: 'App.jsx',
    content: '// 가상 파일 시스템이 성공적으로 마운트되었습니다.\nconsole.log("Welcome to Web IDE!");'
  });

  // 1. 유저 인증 예외 처리 (로그인이 안 되어 있으면 무조건 로그인 창 표시)
  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#1e1e1e', color: '#fff', overflow: 'hidden' }}>
      
      {/* 가상 파일 탐색기 파트 */}
      <div style={{ width: '240px' }}>
        <FileTree onSelectFile={(file) => setCurrentFile(file)} />
      </div>

      {/* 중앙 코드 에디터 파트 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '40px', background: '#2d2d2d', display: 'flex', alignItems: 'center', paddingLeft: '20px', borderBottom: '1px solid #252526', fontSize: '12px', fontFamily: 'monospace' }}>
          📌 Active: {currentFile.name}
        </div>
        <div style={{ flex: 1 }}>
          <Editor
            height="100%"
            theme="vs-dark"
            language="javascript"
            value={currentFile.content}
            onChange={(newValue) => setCurrentFile({ ...currentFile, content: newValue || '' })}
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
        </div>
      </div>

      {/* 우측 협업 채팅 파트 */}
      <div style={{ width: '280px' }}>
        <Chat user={user} />
      </div>

    </div>
  );
}