import "./Card.css";

/**
 * Reusable Card component
 * variant: "default" | "highlight" | "stat"
 */
const Card = ({ children, className = "", variant = "default", style = {} }) => (
  <div className={`card card--${variant} ${className}`} style={style}>
    {children}
  </div>
);

export default Card;
