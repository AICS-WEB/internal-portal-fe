import LoadingState from "./LoadingState.jsx";

export default function ProtectedRoute({ isReady, isAllowed, fallback, children }) {
  if (!isReady) return <LoadingState title="인증 상태 확인 중" />;
  if (!isAllowed) return fallback || null;
  return children;
}
