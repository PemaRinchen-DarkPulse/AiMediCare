import React from "react";

const InputWithLabel = (props) => {
  return (
    <div className={props.className}>
      <label htmlFor={props.htmlFor} className="form-label">
        {props.labelText}
      </label>
      <input
        type={props.type}
        className="form-control"
        name={props.name}
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange} 
      />
    </div>
  );
};

export default InputWithLabel;
