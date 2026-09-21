import "./Badge.css";

const Badge = ({ children, variant = "default" }) => {
  return (
    <span className={`badge badge-${variant}`}>
      <span className="badge-dot"></span>
      {children}
    </span>
  );
};

export default Badge;