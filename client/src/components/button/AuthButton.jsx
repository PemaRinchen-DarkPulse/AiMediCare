import React from 'react'

const AuthButton = ({ text, onClick, className, type }) => {
    return (
      <button className={className} type={type} onClick={onClick}>
        {text}
      </button>
    );
  };

export default AuthButton
