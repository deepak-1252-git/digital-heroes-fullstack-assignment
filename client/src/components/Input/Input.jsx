import "./Input.css";

const Input = ({
  label,
  error,
  helper,
  id,
  className = "",
  ...props
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id}>
          {label}
        </label>
      )}

      <input
        id={id}
        className={error ? "input-error" : ""}
        {...props}
      />

      {error && (
        <span className="input-message input-message-error">
          {error}
        </span>
      )}

      {!error && helper && (
        <span className="input-message">
          {helper}
        </span>
      )}
    </div>
  );
};

export default Input;