import "./Loader.css";

const Loader = ({ size = "medium", text = "" }) => {
  return (
    <div className={`loader-container loader-${size}`}>
      <div className="loader-spinner"></div>

      {text && <p>{text}</p>}
    </div>
  );
};

export default Loader;