import React, { useState, useEffect, useRef, useContext } from 'react';
import ChatRecord from '@pages/content/ChatRecord';
import Filelist from '@pages/content/Filelist';
import ChatInput from '@pages/content/ChatInput';
import eventbus from '@pages/content/eventbus';
import { ZIndexContext } from '.';

const Chatbox = ({ chatRecords }) => {
  const [status, setStatus] = useState('hidden');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [inputHeight, setInputHeight] = useState(0);
  const [width, setWidth] = useState(30); // 新增：初始宽度为 25%
  const isDragging = useRef(false); // 新增：使用 ref 来跟踪拖动状态
  const maxZIndex = useContext(ZIndexContext);
  const chatboxRef = useRef(null);
  const chatRecordsRef = useRef(null);
  const inputSectionRef = useRef(null);
  const dragHandleRef = useRef(null); // 新增：拖拽句柄的引用

  useEffect(() => {
    const showChatbox = () => {
      setStatus('active');
    };

    const hideChatbox = () => {
      setStatus('hidden');
    };

    eventbus.on('FloaterHidden', showChatbox);

    return () => {
      eventbus.off('FloaterHidden', showChatbox);
    }
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === inputSectionRef.current) {
          setInputHeight(entry.contentRect.height);
        }
      }
    });

    if (inputSectionRef.current) {
      resizeObserver.observe(inputSectionRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (chatboxRef.current && chatRecordsRef.current) {
      const chatboxHeight = chatboxRef.current.clientHeight;
      const recordsHeight = chatboxHeight - inputHeight;
      chatRecordsRef.current.style.height = `${Math.max(Math.min(recordsHeight, 600), 200)}px`;
    }
  }, [inputHeight]);

  // 新增：处理拖拽开始
  const handleDragStart = (e) => {
    console.log('[Chatbox] Drag start.');
    e.preventDefault();
    isDragging.current = true; // 直接设置 ref 的值
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  };

  // 新增：处理拖拽
  const handleDrag = (e) => {
    console.log(`[Chatbox] Dragging ... isDragging: ${isDragging.current}`);
    if (!isDragging.current) return;
    const chatboxRect = chatboxRef.current.getBoundingClientRect();
    const newWidth = (window.innerWidth - e.clientX) / window.innerWidth * 100;
    setWidth(Math.max(20, Math.min(80, newWidth))); // 限制宽度在 20% 到 80% 之间
  };

  // 新增：处理拖拽结束
  const handleDragEnd = () => {
    console.log(`[Chatbox] Drag end. isDragging: ${isDragging.current}`);
    isDragging.current = false;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  const handleFileChange = (newFiles) => {
    setSelectedFiles(newFiles);
  };

  const handleClickFileInput = () => {
    console.log('[Chatbox] Clicked file input.');
  };

  const handleRemoveFile = (index, removedFile, newFiles) => {
    setSelectedFiles(newFiles);
  };

  const handleMessageChange = (e) => {
    console.log('[Chatbox] Message changed:', e.target.value);
  };

  const handleSendMessage = (message) => {
    // 这里是发送消息的空函数
    console.log('[Chatbox] Sending message:', message);
  };

  return (
    <div
      ref={chatboxRef}
      className={
        `fixed bg-white h-full mx-auto p-4 rounded-2xs shadow flex flex-col overflow-hidden`
      }
      style={{
        zIndex: maxZIndex,
        top: 0,
        right: 0,
        opacity: 1,
        boxSizing: 'border-box',
        width: `${width}%`, // 使用状态中的宽度
        maxWidth: '80%', // 最大宽度设置为 80%
        minWidth: '20%', // 最小宽度设置为 20%
      }}
    >
      {/* 新增：拖拽句柄 */}
      <div
        ref={dragHandleRef}
        className="absolute left-0 top-0 bottom-0 w-1 bg-gray-300 cursor-ew-resize"
        onMouseDown={handleDragStart}
      />
      <div
        ref={chatRecordsRef}
        className="flex-grow overflow-y-scroll mb-4"
      >
        {
          chatRecords.map((record) => (
            <ChatRecord key={record.id} data={record} />
          ))
        }
      </div>
      <div
        ref={inputSectionRef}
        className="mt-auto"
      >
        <Filelist
          files={selectedFiles}
          onFileRemove={handleRemoveFile}
        />
        <ChatInput
          files={selectedFiles}
          onTextChange={handleMessageChange}
          onFileChange={handleFileChange}
          onSend={handleSendMessage} 
        />
      </div>
    </div>
  );
};

export default Chatbox;