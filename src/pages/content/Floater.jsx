import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { EventEmitter } from 'events';
import PropTypes from 'prop-types';
import avatarDefault from '@assets/img/floaterAvatar.svg';
import avatarOnStandbyDefault from '@assets/img/floaterAvatarOnStandby.svg';
import floaterAvatarCloseButton from '@assets/img/floaterAvatarCloseButton.svg';
import Overlay from '@pages/content/Overlay';

const eventEmitter = new EventEmitter();

const Floater = ({
  avatar = avatarDefault,
  avatarOnStandby = avatarOnStandbyDefault,
  height = '50px',
  width = '50px',
  initX = 0,
  initY = '50%',
}) => {

  if (typeof initX === 'string' && initX.endsWith('%')) {
    initX = window.innerWidth * (parseInt(initX) / 100) - parseInt(width);
  }
  if (typeof initY === 'string' && initY.endsWith('%')) {
    initY = window.innerHeight * (parseInt(initY) / 100) - parseInt(height);
  }

  console.log(`initX: ${initX}, initY: ${initY}`);

  const [status, setStatus] = useState('standby');
  const [position, setPosition] = useState({ x: initX, y: initY });
  const [isDragging, setIsDragging] = useState(false);
  const [isDocking, setIsDocking] = useState(initX >= 0);

  const handleMouseEnterIntoAvatar = () => {
    if (status !== 'hidden') {
      // 鼠标进入头像区域，头像进入激活状态
      setStatus('active');
      eventEmitter.emit('FloaterActivated');
    }
  };

  const handleMouseLeaveFromAvatar = () => {
    if (status !== 'hidden' && !isDragging) {
      // 鼠标离开头像区域，头像回到待命状态
      setStatus('standby');
      eventEmitter.emit('FloaterStandby');
    }
  };

  const handleMouseClickOnCloseFlag = () => {
    console.log('handleMouseClickOnCloseFlag');
    // 点击关闭，头像进入隐藏状态
    setStatus('hidden');
    eventEmitter.emit('FloaterHidden');
  };

  const handleStartDragAvatar = () => {
    console.log('handleStartDragAvatar');
    // 开始拖动，头像进入拖动状态
    setIsDragging(true);
  };

  const handleStopDragAvatar = (e, data) => {
    // 停止拖动，头像退出拖动状态
    setIsDragging(false);

    const newPosition = { x: data.x, y: data.y };

    // 如果头像超出右侧边界，
    // 那么将头像移动到右侧边界，
    // 并且头像进入停靠状态
    if (newPosition.x >= 0) {
      newPosition.x = 0;
      setIsDocking(true);
    }
    // 如果头像没有超出右侧边界，
    // 那么头像退出停靠状态
    else {
      setIsDocking(false);
    }

    // 设置头像最新位置
    setPosition(newPosition);

    // 停止拖动，头像进入待命状态
    setStatus('standby');
  };

  const backgroundImageUrl = status === 'standby' ? avatarOnStandby : avatar;
  const backgroundImage = /^https?:\/\//.test(backgroundImageUrl) ? backgroundImageUrl : chrome.runtime.getURL(backgroundImageUrl);

  console.log(`isDocking: ${isDocking}`);

  return (
    <>
      <Overlay visible={isDragging} />
      <Draggable
        onStart={handleStartDragAvatar}
        onStop={handleStopDragAvatar}
        position={position}
      >
        <div
          className={`fixed z-50 ${status === 'hidden' ? 'hidden' : 'block'}`}
          style={{
            top: 0,
            right: isDocking && (status === 'standby') ? `-${parseInt(width) / 2}px` : '0',
            height,
            width,
            opacity: status === 'standby' ? 0.5 : 1,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            cursor: 'pointer',
            transition: 'right 0.3s ease-in-out, opacity 0.3s ease-in-out',
          }}
          onMouseEnter={handleMouseEnterIntoAvatar}
          onMouseLeave={handleMouseLeaveFromAvatar}
        >
          {status === 'active' && (
            <div
              className="absolute top-0 right-0 w-4 h-4 z-50"
              style={{
                backgroundImage: `url(${chrome.runtime.getURL(floaterAvatarCloseButton)})`,
                backgroundSize: 'cover',
                cursor: 'pointer',
              }}
              onClick={handleMouseClickOnCloseFlag}
            />
          )}
        </div>
      </Draggable>
    </>
  );
};

Floater.propTypes = {
  avatar: PropTypes.string,
  avatarOnStandby: PropTypes.string,
  height: PropTypes.string,
  width: PropTypes.string,
  initX: PropTypes.number || PropTypes.string,
  initY: PropTypes.number || PropTypes.string,
};

export default Floater;
