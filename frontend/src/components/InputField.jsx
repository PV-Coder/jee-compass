import "./InputField.css";

/**
 * Reusable InputField component with label and error display
 */
const InputField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  error = "",
  required = false,
}) => {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={name}>
          {label} {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input-field${error ? " input-field--error" : ""}`}
        autoComplete="off"
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default InputField;
