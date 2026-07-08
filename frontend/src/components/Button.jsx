import "./Button.css";

/**
 * Reusable Button component
 * variant: "primary" | "secondary" | "outline" | "danger"
 * size: "sm" | "md" | "lg"
 */
const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  fullWidth = false,
  style = {},
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`btn btn--${variant} btn--${size}${fullWidth ? " btn--full" : ""}${disabled ? " btn--disabled" : ""}`}
    >
      {children}
    </button>
  );
};

export default Button;
