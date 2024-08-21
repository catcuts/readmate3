import React, { useState, useEffect, useRef } from 'react';
import fileUploadButtonImg from '@assets/img/fileUploadButton.svg';
import msgSendButtonImg from '@assets/img/msgSendButton.svg';

const ChatInput = ({
  onTextChange,
  onFileChange,
  onSend,
  placeholder,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const sendButtonRef = useRef(null);
  const fileUploadButtonRef = useRef(null);
  const fileInputRef = useRef(null);

  const adjustTextareaHeight = () => {
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
  };

  const handleTextChange = () => {
    // 更新消息输入框的值
    setText(textareaRef.current.value);
    // 调整输入框高度
    adjustTextareaHeight();
    // 调用回调函数
    if (onTextChange) {
      onTextChange(textareaRef.current.value);
    }
  };
  
  const handleClickFileUpload = () => {
    // 触发文件上传按钮
    fileInputRef.current.click();
  }

  const handleFileChange = () => {
    // 调用回调函数
    if (onFileChange) {
      onFileChange(fileInputRef.current.files);
    }
  }
  
  const handleClickSend = () => {
    // 清空消息输入框
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    // 调整输入框高度
    adjustTextareaHeight();
    // 调用回调函数
    if (onSend) {
      onSend(textareaRef.current.value);
    }
  };
  return (
    <>
      <div className="relative bg-white rounded-lg border-2 border-solid border-gray-300">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          className="font-sans text-xl bg-transparent text-base p-2 rounded-lg resize-none overflow-y-auto border-none outline-none focus:border-none focus:ring-0 focus:outline-none"
          style={{ color: "#34495e", width: '100%', minHeight: '5em', maxHeight: '15em', border: 'none' }}
          placeholder={placeholder}
        />
        <div className="border-t border-gray-200"></div>
        <div className="flex justify-between items-center p-2">
          <img
            ref={fileUploadButtonRef}
            src={chrome.runtime.getURL(fileUploadButtonImg)}
            alt="Upload"
            className="w-6 h-6 cursor-pointer"
            onClick={handleClickFileUpload}
          />
          <img
          ref={sendButtonRef}
            src={chrome.runtime.getURL(msgSendButtonImg)}
            alt="Send"
            className="w-6 h-6 cursor-pointer"
            onClick={handleClickSend}
          />
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        multiple
      />
    </>
  );
}

export default ChatInput;