export default function BrandMark({ className = "" }) {
  return (
    <img
      className={`brand-mark ${className}`.trim()}
      src="/Logo/aics-favicon.png"
      alt=""
      aria-hidden="true"
    />
  );
}
