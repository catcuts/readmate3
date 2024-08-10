import React from 'react';
import PropTypes from 'prop-types';

const defaultBackgroundStyle = {
  background: undefined,
  backgroundColor: 'white',
  backgroundImage: undefined,
  backgroundPosition: undefined,
  backgroundSize: undefined,
  backgroundRepeat: undefined,
  backgroundAttachment: undefined,
  backgroundClip: undefined,
  backgroundOrigin: undefined,
  backgroundBlendMode: undefined,
};

const Bubble = ({
  children,
  direction = 'top',
  className = '',
  style = {},
}) => {

  const boxClassName = `absolute border-solid rounded-lg ${className}`;
  const boxStyle = {
    ...defaultBackgroundStyle,
    ...style,
  };

  const angleBackgroundStyle = {};
  for (const name in defaultBackgroundStyle) {
    if (boxStyle[name]) {
      const style = boxStyle[name] || defaultBackgroundStyle[name];
      if (style) {
        angleBackgroundStyle[name] = style;
      }
    }
  }

  const angleOpacityStyle = {
    opacity: boxStyle.opacity === undefined ? 1 : boxStyle.opacity,
  };

  const angleStyle = {
    position: 'absolute',
    top: '90%',
    left: '45%',
    height: '10px',
    width: '10px',
    borderTop: '1px solid black',
    borderLeft: '1px solid black',
    transform: 'rotate(45deg)',
    ...angleOpacityStyle,
    ...angleBackgroundStyle,
  };

  // console.log(`backgroundStyle: ${JSON.stringify(boxStyle)}`);
  // console.log(`angleStyle: ${JSON.stringify(angleStyle)}`);

  return (
    <>
      <div className={boxClassName} style={boxStyle}>
        {children}
      </div>
      <div style={angleStyle}></div>
    </>
  );
};

Bubble.propTypes = {
  children: PropTypes.node,
  direction: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Bubble;
