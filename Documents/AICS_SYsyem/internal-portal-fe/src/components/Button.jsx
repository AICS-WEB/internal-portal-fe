export default function Button({
  children,
  type = "button",
  variant = "secondary",
  size = "md",
  icon,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`.trim()}
      {...props}
    >
      {icon ? <span className="btn-icon">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}
