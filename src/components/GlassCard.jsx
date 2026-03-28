import React from 'react';
import '../index.css';

const GlassCard = ({ children, className = '', style = {} }) => {
  return (
    <div className={`glass-card ${className}`} style={style}>
      {children}
    </div>
  );
};

export default GlassCard;
