import React from "react";

const InputWithLabel = (props) => {
  return (
    <div className="col mb-3">
      <label htmlFor={props.htmlFor} className="form-label">
        {props.labelText}
      </label>
      <input
        type={props.type}
        className="form-control"
        name={props.name}
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange} // Use the handler passed from parent
      />
    </div>
  );
};

export default InputWithLabel;
