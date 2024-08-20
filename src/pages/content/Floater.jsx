import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';
import avatarDefault from '@assets/img/floaterAvatar.svg';
import avatarOnStandbyDefault from '@assets/img/floaterAvatarOnStandby.svg';
import closeButtonImg from '@assets/img/floaterCloseButton.svg';
import fileUploadButtonImg from '@assets/img/fileUploadButton.svg';
import msgSendButtonImg from '@assets/img/msgSendButton.svg';
import Overlay from '@pages/content/Overlay';
import Bubble from '@pages/content/Bubble';
import File from '@pages/content/File';
import eventbus from '@pages/content/eventbus';
import { Input } from 'postcss';

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
  const [message, setMessage] = useState('');
  const [isBubblePinned, setIsBubblePinned] = useState(false); // 新增状态，用于控制Bubble是否定住
  const [hasDragged, setHasDragged] = useState(false); // 新增状态，用于跟踪是否发生了拖拽
  const [isAutoCloseDisabled, setIsAutoCloseDisabled] = useState(false); // 新增状态，用于控制是否暂时停用自动收起
  const avatarRef = useRef(null);
  const bubbleRef = useRef(null);
  const bubbleContentRef = useRef(null);
  const pageSummaryRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const fileContainerRef = useRef(null);

  useEffect(() => {
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
    // console.log(`handleMouseEnterIntoAvatar`, e);
    if (status !== 'hidden' && status !== 'active') {
      // 注：这里 多了一个 status !== 'active' 的判断，
      //     这是因为偶现当鼠标移入Bubble再选择文件后，
      //     尽管鼠标在Bubble之外，也会触发一个鼠标移入事件，
      //     原因未知，暂时通过这个判断来避免这个问题。
      // 鼠标进入头像区域，头像进入激活状态
      setStatus('active');
      eventbus.emit('FloaterActivated');
      setIsAutoCloseDisabled(false); // 重新启用自动收起
    }
  };

  const handleMouseLeaveFromAvatar = () => {
    // console.log(`handleMouseLeaveFromAvatar:` + 
    //   `isDragging: ${isDragging}, ` +
    //   `isBubblePinned: ${isBubblePinned}, ` +
    //   `isAutoCloseDisabled: ${isAutoCloseDisabled}`
    // );
    if (status !== 'hidden' && !isDragging && !isBubblePinned && !isAutoCloseDisabled) {
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
    setIsBubblePinned(false); // 重置Bubble定住状态
    eventbus.emit('FloaterHidden');
  };

  const handleStartDragAvatar = (e, data) => {
    console.log('handleStartDragAvatar:', data);
    // 开始拖动，头像进入拖动状态
    setIsDragging(true);
    setHasDragged(false); // 重置拖拽状态
  };

  const handleDragAvatar = () => {
    setHasDragged(true); // 如果发生了拖拽，设置状态为true
  };

  const handleStopDragAvatar = (e, data) => {
    console.log('handleStopDragAvatar:', data);
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
    console.log(`handleAvatarClick: hasDragged: ${hasDragged}, status: ${status}, isBubblePinned: ${isBubblePinned}`);
    if (!hasDragged) { // 只有在没有发生拖拽的情况下才触发点击事件
      if (status === 'active') {
        if (isBubblePinned) {
          // 如果Bubble已经定住，点击头像会收起Bubble
          setStatus('standby');
          setIsBubblePinned(false);
        } else {
          // 如果Bubble没有定住，点击头像会定住Bubble
          setIsBubblePinned(true);
        }
      } else if (status === 'standby') {
        // 如果是待命状态，点击头像会激活并定住Bubble
        setStatus('active');
        setIsBubblePinned(true);
      }
    }
    setHasDragged(false); // 重置拖拽状态
  };

  const handleAvatarDoubleClick = () => {
    console.log(`handleAvatarDoubleClick: status: ${status}, isDocking: ${isDocking}`);
    // 双击头像，头像自动回到右侧边缘
    setPosition({ x: 0, y: usingInitY });
    setIsDocking(true);
  };

  const backgroundImageUrl = status === 'standby' ? avatarOnStandby : avatar;
  const backgroundImage = /^https?:\/\//.test(backgroundImageUrl) ? backgroundImageUrl : chrome.runtime.getURL(backgroundImageUrl);

  const bubblePosition = { x: 100, y: 100 };

  // 新增的处理函数
  const handleSummarize = () => {
    console.log('Summarize page');
    // 在这里添加总结页面的逻辑
  };

  const handleFileUpload = (event) => {
    // console.log('handleFileUpload');
    const newFiles = Array.from(event.target.files || event.dataTransfer.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
    setIsAutoCloseDisabled(true); // 禁用自动收起
    // console.log('handleFileUpload - isAutoCloseDisabled:', isAutoCloseDisabled);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleFileUpload(event);
  };

  const handleClickFileInput = () => {
    // console.log('handleClickFileInput');
    setIsAutoCloseDisabled(true); // 禁用自动收起
    // console.log('handleClickFileInput - isAutoCloseDisabled:', isAutoCloseDisabled);
    fileInputRef.current.click();
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    adjustTextareaHeight(e.target);
    updateBubbleHeight();
  };

  const adjustTextareaHeight = (textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
  };

  const handleSendMessage = () => {
    // 这里是发送消息的空函数
    console.log('Sending message:', message);
    // 清空消息输入框
    setMessage('');
    if (messageInputRef.current) {
      messageInputRef.current.style.height = 'auto';
    }
  };

  return (
    <>
      <Overlay visible={isDragging} />
      <Draggable
        handle='.floater-avatar'
        onStart={handleStartDragAvatar}
        onDrag={handleDragAvatar}
        onStop={handleStopDragAvatar}
        position={position}
      >
        <div  // 包含 Avatar 和 Bubble 的容器
          className={`fixed z-50 ${status === 'hidden' ? 'hidden' : 'block'}`}
          style={{
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
                  className="absolute top-0 right-0 w-4 h-4 z-50"
                  style={{
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
                className="flex items-center justify-between p-2 bg-gray-100 rounded-lg"
                style={{ color: "#34495e" }}
              >
                <button
                  onClick={handleSummarize}
                  className="text-xl bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded"
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
              <div
                ref={fileContainerRef}
                className="border-2 border-dashed border-gray-300 rounded-lg p-2 cursor-pointer"
                onClick={handleClickFileInput}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {selectedFiles.length === 0 ? (
                  <>
                    <p className="text-gray-500 text-center text-xl" style={{ color: "#34495e" }}>上传文档</p>
                    <p className="text-gray-500 text-center" style={{ color: "#34495e" }}>点击或拖拽文件到此处</p>
                  </>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex-grow overflow-y-auto mb-2" style={{ maxHeight: '120px' }}>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedFiles.map((file, index) => (
                          <File index={index} file={file} onRemove={handleRemoveFile} />
                        ))}
                      </div>
                    </div>
                    <div className="w-full h-10 bg-gray-50 rounded-lg flex items-center justify-center text-xl text-gray-300 cursor-pointer hover:bg-gray-100" style={{ color: "#34495e" }}>
                      + 继续追加文档 +
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                />
              </div>
              <div className="text-left text-xl" style={{ color: "#34495e" }}>同时</div>
              <Input></Input>
              <div className="relative bg-white rounded-lg border-2 border-solid border-gray-300">
                <textarea
                  ref={messageInputRef}
                  value={message}
                  onChange={handleMessageChange}
                  className="font-sans text-xl bg-transparent text-base p-2 rounded-lg resize-none overflow-y-auto border-none outline-none focus:border-none focus:ring-0 focus:outline-none"
                  style={{ color: "#34495e", width: '100%', minHeight: '5em', maxHeight: '15em', border: 'none' }}
                  placeholder="向我提问"
                />
                <div className="border-t border-gray-200"></div>
                <div className="flex justify-between items-center p-2">
                  <img
                    src={chrome.runtime.getURL(fileUploadButtonImg)}
                    alt="Upload"
                    className="w-6 h-6 cursor-pointer"
                    onClick={handleClickFileInput}
                  />
                  <img
                    src={chrome.runtime.getURL(msgSendButtonImg)}
                    alt="Send"
                    className="w-6 h-6 cursor-pointer"
                    onClick={handleSendMessage}
                  />
                </div>
              </div>
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