import React from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

const Overlay = ({ visible, color, children }) => {
  if (!visible) return null;

  const overlayCustomBgClass = color.startsWith('bg-') ? color : ''; 
  const overlayCustomStyle = color.startsWith('bg-') ? {} : { backgroundColor: color };

  return createPortal(
    <div
      className={`${overlayCustomBgClass} fixed inset-0 flex justify-center items-center z-30`}
      style={overlayCustomStyle}
    >
      {children}
    </div>,
    document.body
  );
};

Overlay.propTypes = {
  visible: PropTypes.bool,
  color: PropTypes.string,
  children: PropTypes.node
};

Overlay.defaultProps = {
  visible: false,
  color: 'bg-black bg-opacity-0',
  children: null
};

export default Overlay;
