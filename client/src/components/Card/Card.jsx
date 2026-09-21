import "./Card.css";

const Card = ({
  children,
  className = "",
  hover = false,
  padding = "medium",
}) => {
  return (
    <div
      className={`card card-padding-${padding} ${
        hover ? "card-hover" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;