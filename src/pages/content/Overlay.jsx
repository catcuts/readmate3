import React from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

const Overlay = ({ 
  children,
  className = '',
  style = {},
}) => {

  const useClassName = `fixed inset-0 flex justify-center items-center bg-opacity-0 ${className}`;
  const useStyle = style;

  return createPortal(
    <div
      className={useClassName}
      style={useStyle}
    >
      {children}
    </div>,
    document.body
  );
};

Overlay.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};

Overlay.defaultProps = {
  children: null,
  className: '',
  style: {},
};

export default Overlay;
