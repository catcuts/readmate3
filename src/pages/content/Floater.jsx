import React, { useState, useEffect, useRef, useContext } from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';
import avatarDefault from '@assets/img/floaterAvatar.svg';
import avatarOnStandbyDefault from '@assets/img/floaterAvatarOnStandby.svg';
import closeButtonImg from '@assets/img/floaterCloseButton.svg';
import Overlay from '@pages/content/Overlay';
import Bubble from '@pages/content/Bubble';
import ChatInput from '@pages/content/ChatInput';
import File from '@pages/content/File';
import Filebox from '@pages/content/Filebox';
import eventbus from '@pages/content/eventbus';
import { ZIndexContext } from '.';

const Floater = ({
  avatar = avatarDefault,
  avatarOnStandby = avatarOnStandbyDefault,
  height = '50px',
  width = '50px',
  initX = 0,
  initY = '50%',
}) => {

  // 使用 localStorage 来存储和获取初始高度。注意：localStorage 存储的是字符串，所以需要转换为数字。
  const storedInitY = Number(localStorage.getItem('floaterInitY'));
  let usingInitY = storedInitY || initY;

  if (typeof initX === 'string' && initX.endsWith('%')) {
    initX = window.innerWidth * (parseInt(initX) / 100) - parseInt(width);
  }
  if (typeof usingInitY === 'string' && usingInitY.endsWith('%')) {
    usingInitY = window.innerHeight * (parseInt(usingInitY) / 100) - parseInt(usingInitY);
  }

  const [status, setStatus] = useState('standby');
  const [position, setPosition] = useState({ x: initX, y: usingInitY });
  const [isDragging, setIsDragging] = useState(false);
  const [isDocking, setIsDocking] = useState(initX >= 0);
  const [bubbleHeight, setBubbleHeight] = useState(0); // 控制 Bubble 的高度
  const [bubbleOpacity, setBubbleOpacity] = useState(0); // 控制 Bubble 的透明度
  const [selectedFiles, setSelectedFiles] = useState([]);
  const isBubblePinned = useRef(false); // 控制Bubble是否定住
  const hasDragged = useRef({ x: 0, y: 0 });  // 拖拽位移
  const isAutoCloseDisabled = useRef(false); // 控制是否暂时停用自动收起
  const avatarRef = useRef(null);
  const bubbleRef = useRef(null);
  const bubbleContentRef = useRef(null);
  const pageSummaryRef = useRef(null);
  const maxZIndex = useContext(ZIndexContext);

  useEffect(() => {
    console.log('[Floater] useEffect: selectedFiles', selectedFiles);
    if (status === 'active') {
      setBubbleOpacity(1); // 显示时设置 Bubble 透明度为 1，触发动画效果
      updateBubbleHeight();
    }
    else {
      setBubbleHeight(0); // 隐藏时设置 Bubble 高度为 0，触发动画效果
      setBubbleOpacity(0); // 隐藏时设置 Bubble 透明度为 0，触发动画效果
    }
  }, [status, selectedFiles/*Bubble高度要随文件列表而变化*/]);

  const updateBubbleHeight = () => {
    if (bubbleContentRef.current) {
      setBubbleHeight(bubbleContentRef.current.offsetHeight);
    }
  };

  const handleMouseEnterIntoAvatar = (e) => {
    // console.log(`[Floater] handleMouseEnterIntoAvatar`, e);
    if (status !== 'hidden' && status !== 'active') {
      // 注：这里 多了一个 status !== 'active' 的判断，
      //     这是因为偶现当鼠标移入Bubble再选择文件后，
      //     尽管鼠标在Bubble之外，也会触发一个鼠标移入事件，
      //     原因未知，暂时通过这个判断来避免这个问题。
      // 鼠标进入头像区域，头像进入激活状态
      setStatus('active');
      eventbus.emit('FloaterActivated');
      isAutoCloseDisabled.current = false; // 重新启用自动收起
    }
  };

  const handleMouseLeaveFromAvatar = () => {
    console.log(`[Floater] handleMouseLeaveFromAvatar: \n
      isDragging: ${isDragging}, \n
      isBubblePinned: ${isBubblePinned.current}, \n
      isAutoCloseDisabled: ${isAutoCloseDisabled.current}`
    );
    if (status !== 'hidden' && !isDragging && !isBubblePinned.current && !isAutoCloseDisabled.current) {
      // 鼠标离开头像区域，如果Bubble没有定住且自动收起未被禁用，头像回到待命状态
      setStatus('standby');
      eventbus.emit('FloaterStandby');
    }
  };

  const handleMouseDownOnCloseFlag = (e) => {
    e.stopPropagation(); // 阻止事件冒泡，确保不被 Draggable 捕获
  };

  const handleMouseUpOnCloseFlag = (e) => {
    // 点击关闭，头像进入隐藏状态
    setStatus('hidden');
    isBubblePinned.current = false; // 重置Bubble定住状态
    eventbus.emit('FloaterHidden');
  };

  const handleStartDragAvatar = (e, data) => {
    console.log('[Floater] handleStartDragAvatar:', data);
    // 开始拖动，头像进入拖动状态
    setIsDragging(true);
    hasDragged.current = { x: 0, y: 0 }; // 重置拖拽状态
  };

  const handleDragAvatar = (e, data) => {
    // 如果发生了拖拽，记录拖拽位移
    hasDragged.current = {
      x: hasDragged.current.x + Math.abs(data.deltaX),
      y: hasDragged.current.y + Math.abs(data.deltaY),
    };
  };

  const handleStopDragAvatar = (e, data) => {
    console.log('[Floater] handleStopDragAvatar:', data);
    // 停止拖动，头像退出拖动状态
    setIsDragging(false);

    const newPosition = { x: data.x, y: data.y };

    let isPositionNeedingChange = true;

    // 如果头像超出右侧边界，
    // 那么头像进入停靠状态
    if (newPosition.x >= 0) {
      newPosition.x = 0;
      setIsDocking(true);
    }
    // 如果头像没有超出右侧边界，但是超出左侧边界，
    // 那么头像 x = 移动之前的 x、y = 移动之前的 y
    else if (Math.abs(newPosition.x) > window.innerWidth - parseInt(width)) {
      isPositionNeedingChange = false;
    }
    // 如果头像没有超出边界，
    // 那么头像退出停靠状态
    else {
      setIsDocking(false);
    }

    // 如果已经确定不需要改变位置，就不再进行 y 的位置判断
    // 换句话说，如果还需要改变位置，就需要判断 y 的位置
    if (isPositionNeedingChange) {
      // 不论 x 在正常范围内与否，y 超出下边界
      // 那么头像 x = 移动之前的 x、y = 下边界 - 头像高度
      if (newPosition.y > window.innerHeight - parseInt(height)) {
        isPositionNeedingChange = false;
      }
      // 不论 x 在正常范围内与否，y 超出上边界
      // 那么头像 x = 移动之前的 x、y = 移动之前的 y
      else if (newPosition.y < 0) {
        isPositionNeedingChange = false;
      }
    }

    // 如果需要改变位置，就设置新位置并记录到 localStorage
    if (isPositionNeedingChange) {
      // 设置头像最新位置
      setPosition(newPosition);

      // // 停止拖动，头像进入待命状态
      // setStatus('standby');
  
      // 记录当前的高度到 localStorage
      localStorage.setItem('floaterInitY', newPosition.y);
    }
  };

  const handleAvatarClick = () => {
    console.log(`[Floater] handleAvatarClick: \n
      hasDragged: ${JSON.stringify(hasDragged.current)}, \n 
      status: ${status}, \n
      isBubblePinned: ${isBubblePinned.current} \n
      isAutoCloseDisabled: ${isAutoCloseDisabled.current}`);
    // 只有在没有发生拖拽的情况下才触发点击事件
    if (hasDragged.current.x < 5 && hasDragged.current.y < 5) {
      if (status === 'active') {
        if (isBubblePinned) {
          // 如果Bubble已经定住，点击头像会收起Bubble
          setStatus('standby');
          isBubblePinned.current = false;
        } else {
          // 如果Bubble没有定住，点击头像会定住Bubble
          isBubblePinned.current = true;
        }
      } else if (status === 'standby') {
        // 如果是待命状态，点击头像会激活并定住Bubble
        setStatus('active');
        isBubblePinned.current = true;
      }
    }
    hasDragged.current = { x: 0, y: 0 }; // 重置拖拽状态
  };

  const handleAvatarDoubleClick = () => {
    console.log(`[Floater] handleAvatarDoubleClick: status: ${status}, isDocking: ${isDocking}`);
    // 双击头像，头像自动回到右侧边缘
    setPosition({ x: 0, y: usingInitY });
    setIsDocking(true);
  };

  const backgroundImageUrl = status === 'standby' ? avatarOnStandby : avatar;
  const backgroundImage = /^https?:\/\//.test(backgroundImageUrl) ? backgroundImageUrl : chrome.runtime.getURL(backgroundImageUrl);

  const bubblePosition = { x: 100, y: 100 };

  // 新增的处理函数
  const handleSummarize = () => {
    console.log('[Floater] Summarize page');
    // 在这里添加总结页面的逻辑
  };

  const handleFileChange = (newFiles, meow) => {
    console.log(`[Floater] handleFileChange [${meow}]`);
    setSelectedFiles(newFiles);
    isAutoCloseDisabled.current = true; // 禁用自动收起
  };

  const handleClickFileInput = () => {
    console.log('[Floater] handleClickFileInput');
    isAutoCloseDisabled.current = true; // 禁用自动收起
  };

  const handleRemoveFile = (index, removedFile, newFiles) => {
    setSelectedFiles(newFiles);
    // if (newFiles.length === 0) {
    //   isAutoCloseDisabled.current = false; // 重新启用自动收起
    // }
  };

  const handleMessageChange = (e) => {
    updateBubbleHeight();
  };

  const handleSendMessage = (message) => {
    // 这里是发送消息的空函数
    console.log('[Floater] Sending message:', message);
  };

  return (
    <>
      {isDragging && <Overlay style={{ zIndex: maxZIndex - 1 }} />}
      <Draggable
        handle='.floater-avatar'
        onStart={handleStartDragAvatar}
        onDrag={handleDragAvatar}
        onStop={handleStopDragAvatar}
        position={position}
      >
        <div  // 包含 Avatar 和 Bubble 的容器
          className={`fixed ${status === 'hidden' ? 'hidden' : 'block'}`}
          style={{
            zIndex: maxZIndex,
            top: 0,
            right: isDocking && (status === 'standby') ? `-${parseInt(width) / 2}px` : '0',
            transition: 'right 0.3s ease-in-out',
          }}
          onMouseEnter={handleMouseEnterIntoAvatar}
          onMouseLeave={handleMouseLeaveFromAvatar}
        >
          {/* 新增的外壳 */}
          <div
            style={{
              width: `calc(${width} + 10px)`,
              height: `calc(${height} + 2px)`,
              backgroundColor: 'white',
              borderRadius: '50%',
              borderLeft: '1px solid #D3D3D3',
              borderTop: '1px solid #D3D3D3',
              borderBottom: '1px solid #D3D3D3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              opacity: status === 'standby' ? 0.5 : 1,
            }}
            onClick={handleAvatarClick}
            onDoubleClick={handleAvatarDoubleClick}
          >
            <div  // Avatar
              ref={avatarRef}
              className="floater-avatar"
              style={{
                height,
                width,
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                cursor: 'pointer',
                transition: 'opacity 0.3s ease-in-out',
                marginRight: '5px',
              }}
            >
              {status === 'active' && (
                <div  // Close Button
                  className="absolute top-0 right-0 w-4 h-4"
                  style={{
                    zIndex: maxZIndex + 1,
                    backgroundImage: `url(${chrome.runtime.getURL(closeButtonImg)})`,
                    backgroundSize: 'cover',
                    cursor: 'pointer',
                  }}
                  onMouseDown={handleMouseDownOnCloseFlag}
                  onMouseUp={handleMouseUpOnCloseFlag}
                />
              )}
            </div>
          </div>
          <Bubble
            ref={bubbleRef}
            position={bubblePosition}
            style={{
              position: 'absolute',
              // top: `calc(${parseInt(height)}px + 4px)`,
              right: '0',
              height: `${bubbleHeight}px`,  // 使用动态计算的高度
              width: '500px',
              opacity: bubbleOpacity,  // 使用动态计算的透明度
              border: '1px solid black',
              borderRadius: '10px',
              transition: 'height 0.3s ease-in-out, opacity 0.3s ease-in-out',
              ...(
                status === 'active' ?
                  {}
                  :
                  { overflow: 'hidden' }  // 确保隐藏时不显示内容
              ),
            }}
          >
            {/* 更新后的内容 */}
            <div
              ref={bubbleContentRef}
              className="p-4 flex flex-col space-y-4"
            >

              <div className="text-left text-2xl" style={{ color: "#34495e" }}>你好，即刻开始</div>

              <div
                ref={pageSummaryRef}
                className="flex items-center justify-between p-2 bg-gray-100 rounded-2xs"
                style={{ color: "#34495e" }}
              >
                <button
                  onClick={handleSummarize}
                  className="text-xl bg-blue-400 hover:bg-blue-500 text-white font-bold py-1 px-2 rounded-2xs"
                >
                  总结本页
                </button>
                <div className="flex-1 m-2 overflow-hidden">
                  <div className="font-bold truncate whitespace-nowrap overflow-hidden text-overflow-ellipsis">
                    {document.title || '未命名页面'}
                  </div>
                  <div className="text-sm text-gray-500 truncate whitespace-nowrap overflow-hidden text-overflow-ellipsis">
                    {window.location.href}
                  </div>
                </div>
              </div>

              <div className="text-left text-xl" style={{ color: "#34495e" }}>或者</div>

              <Filebox
                files={selectedFiles}
                onFileInputClick={handleClickFileInput}
                onFileChange={handleFileChange}
                onFileRemove={handleRemoveFile}
              />

              <div className="text-left text-xl" style={{ color: "#34495e" }}>同时</div>

              <ChatInput
                files={selectedFiles}
                onTextChange={handleMessageChange}
                onFileChange={handleFileChange}
                onSend={handleSendMessage}
              />

            </div>
          </Bubble>
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
  initX: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  initY: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default Floater;