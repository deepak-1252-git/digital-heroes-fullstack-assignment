import "./Button.css";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  type = "button",
  loading = false,
  disabled = false,
  onClick,
  className = "",
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <span className="btn-loader">
          <span></span>
          <span></span>
          <span></span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;