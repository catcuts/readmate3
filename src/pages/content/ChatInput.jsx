import React, { useState, useEffect, useRef } from 'react';
import fileUploadButtonImg from '@assets/img/fileUploadButton.svg';
import msgSendButtonImg from '@assets/img/msgSendButton.svg';
import combineList from '@utils/combine-list';

const ChatInput = ({
  files = [],
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
      // 通知父组件高度变化
      if (onTextChange) {
        onTextChange({ target: { value: text }, height: newHeight });
      }
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);

  const handleTextChange = (e) => {
    // 更新消息输入框的值
    setText(e.target.value);
    // 调整输入框高度会在useEffect中处理
  };
  
  const handleClickFileUpload = () => {
    // 触发文件上传按钮
    fileInputRef.current.click();
  }

  const handleFileChange = (event) => {
    // 调用回调函数
    if (onFileChange) {
      const addSelectedFiles = Array.from(event.target.files || event.dataTransfer.files);
      onFileChange(combineList(files, addSelectedFiles, { key: 'name' }), 'ChatInput');
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
      onSend(text);
    }
  };

  return (
    <>
      <div className="relative bg-white rounded-2xs border-2 border-solid border-gray-300">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          className="font-sans text-xl bg-transparent text-base p-2 rounded-2xs resize-none overflow-y-auto border-none outline-none focus:border-none focus:ring-0 focus:outline-none"
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