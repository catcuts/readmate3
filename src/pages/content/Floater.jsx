import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { EventEmitter } from 'events';
import PropTypes from 'prop-types';
import avatarDefault from '@assets/img/floaterAvatar.svg';
import avatarOnStandbyDefault from '@assets/img/floaterAvatarOnStandby.svg';
import floaterAvatarCloseButton from '@assets/img/floaterAvatarCloseButton.svg';
import fileUploadButton from '@assets/img/fileUploadButton.svg';
import msgSendButton from '@assets/img/msgSendButton.svg';
import Overlay from '@pages/content/Overlay';
import Bubble from '@pages/content/Bubble';

const eventEmitter = new EventEmitter();

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

  console.log(`initX: ${initX}, initY: ${usingInitY}`);

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
  }, [status, selectedFiles]);

  const updateBubbleHeight = () => {
    if (fileContainerRef.current) {
      const fileContainerHeight = fileContainerRef.current.offsetHeight;
      setBubbleHeight(290 + Math.max(0, fileContainerHeight - 60)); // 基础高度290px，加上文件容器超出60px的部分
    }
  };

  const handleMouseEnterIntoAvatar = () => {
    if (status !== 'hidden') {
      // 鼠标进入头像区域，头像进入激活状态
      setStatus('active');
      eventEmitter.emit('FloaterActivated');
    }
  };

  const handleMouseLeaveFromAvatar = () => {
    if (status !== 'hidden' && !isDragging && !isBubblePinned) {
      // 鼠标离开头像区域，如果Bubble没有定住，头像回到待命状态
      setStatus('standby');
      eventEmitter.emit('FloaterStandby');
    }
  };

  const handleMouseDownOnCloseFlag = (e) => {
    e.stopPropagation(); // 阻止事件冒泡，确保不被 Draggable 捕获
  };

  const handleMouseUpOnCloseFlag = (e) => {
    // 点击关闭，头像进入隐藏状态
    setStatus('hidden');
    setIsBubblePinned(false); // 重置Bubble定住状态
    eventEmitter.emit('FloaterHidden');
  };

  const handleStartDragAvatar = () => {
    // 开始拖动，头像进入拖动状态
    setIsDragging(true);
    setHasDragged(false); // 重置拖拽状态
  };

  const handleDragAvatar = () => {
    setHasDragged(true); // 如果发生了拖拽，设置状态为true
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

    // // 停止拖动，头像进入待命状态
    // setStatus('standby');

    // 记录当前的高度到 localStorage
    localStorage.setItem('floaterInitY', newPosition.y);
  };

  const handleAvatarClick = () => {
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

  const backgroundImageUrl = status === 'standby' ? avatarOnStandby : avatar;
  const backgroundImage = /^https?:\/\//.test(backgroundImageUrl) ? backgroundImageUrl : chrome.runtime.getURL(backgroundImageUrl);

  console.log(`isDocking: ${isDocking}`);

  const bubblePosition = { x: 100, y: 100 };

  // 新增的处理函数
  const handleSummarize = () => {
    console.log('Summarize page');
    // 在这里添加总结页面的逻辑
  };

  const handleFileUpload = (event) => {
    const newFiles = Array.from(event.target.files || event.dataTransfer.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
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
    fileInputRef.current.click();
  };

  const getFileIcon = (fileType) => {
    // 这里可以根据文件类型返回不同的图标
    return '📄';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = () => {
    // 这里是发送消息的空函数
    console.log('Sending message:', message);
    // 清空消息输入框
    setMessage('');
  };

  return (
    <>
      <Overlay visible={isDragging} />
      <Draggable
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
        >
          <div  // Avatar
            style={{
              height,
              width,
              opacity: status === 'standby' ? 0.5 : 1,
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              cursor: 'pointer',
              transition: 'opacity 0.3s ease-in-out',
            }}
            onMouseEnter={handleMouseEnterIntoAvatar}
            onMouseLeave={handleMouseLeaveFromAvatar}
            onClick={handleAvatarClick}
          >
            {status === 'active' && (
              <div  // Close Button
                className="absolute top-0 right-0 w-4 h-4 z-50"
                style={{
                  backgroundImage: `url(${chrome.runtime.getURL(floaterAvatarCloseButton)})`,
                  backgroundSize: 'cover',
                  cursor: 'pointer',
                }}
                onMouseDown={handleMouseDownOnCloseFlag}
                onMouseUp={handleMouseUpOnCloseFlag}
              />
            )}
          </div>
          <Bubble
            position={bubblePosition}
            style={{
              position: 'absolute',
              top: `${parseInt(height)}px`,
              right: '0',
              height: `${bubbleHeight}px`,  // 使用动态计算的高度
              width: '300px',
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
            <div className="p-4 flex flex-col space-y-4">
              <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                <div className="flex-1 mr-2 overflow-hidden">
                  <div className="font-bold text-sm whitespace-nowrap overflow-hidden text-overflow-ellipsis">
                    {document.title || '未命名页面'}
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-overflow-ellipsis">
                    {window.location.href}
                  </div>
                </div>
                <button 
                  onClick={handleSummarize}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                >
                  总结本页
                </button>
              </div>
              <div
                ref={fileContainerRef}
                className="border-2 border-dashed border-gray-300 rounded-lg p-2 cursor-pointer"
                onClick={handleClickFileInput}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {selectedFiles.length === 0 ? (
                  <>
                    <p className="text-gray-500 text-center">阅读文档</p>
                    <p className="text-gray-500 text-center">点击或拖拽文件到此处</p>
                  </>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex-grow overflow-y-auto mb-2" style={{ maxHeight: '80px' }}>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="relative bg-gray-100 rounded-lg p-2 text-sm group">
                            <div className="flex items-center">
                              <div className="mr-2">{getFileIcon(file.type)}</div>
                              <div className="flex-1 overflow-hidden">
                                <div className="truncate">{file.name}</div>
                                <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile(index);
                              }}
                              className="absolute top-1 right-1 bg-gray-200 hover:bg-gray-300 border-0 rounded-full w-4 h-4 flex items-center justify-center text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="w-full h-10 bg-gray-50 rounded-lg flex items-center justify-center text-2xl text-gray-300 cursor-pointer hover:bg-gray-100">
                      +
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
              <div className="relative bg-white rounded-lg border-2 border-solid border-gray-300">
                <textarea
                  ref={messageInputRef}
                  value={message}
                  onChange={handleMessageChange}
                  className="font-sans text-base p-2 rounded-lg resize-none overflow-y-auto border-none ring-0 outline-none focus:border-none focus:ring-0 focus:outline-none"
                  style={{ width: '99%', minHeight: '2.5em', maxHeight: '150px' }}
                  placeholder="向我提问"
                />
                <div className="flex justify-between items-center p-2">
                  <img
                    src={chrome.runtime.getURL(fileUploadButton)}
                    alt="Upload"
                    className="w-6 h-6 cursor-pointer"
                    onClick={handleClickFileInput}
                  />
                  <img
                    src={chrome.runtime.getURL(msgSendButton)}
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