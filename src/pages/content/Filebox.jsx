import React, { useState, useEffect, useRef, useContext } from 'react';
import File from '@pages/content/File';
import combineList from '@utils/combine-list';
import substractList from '@utils/substract-list';
import { ZIndexContext } from '.';

const Filebox = ({
  files = [],
  onFileInput,
  onFileChange,
  onFileRemove,
}) => {
  const [selectedFiles, setSelectedFiles] = useState(files);
  useEffect(() => {
    console.log('[Filebox] useEffect onFileChange', files.isFileChangedByFilebox);
    if (!files.isFileChangedByFilebox) {
      console.log('[Filebox] useEffect onFileChange', files);
      setSelectedFiles(files);
      if (onFileChange) {
        const newFiles = [...files];
        newFiles.isFileChangedByFilebox = true;
        if (onFileChange) {
          onFileChange(newFiles, 'Filebox - useEffect');
        }
      }
    }
  }, [files]);
  const fileContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const maxZIndex = useContext(ZIndexContext);

  const handleClickFileInput = () => {
    fileInputRef.current.click();
    if (onFileInput) {
      onFileInput();
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleFileChange(event);
  };

  const handleFileChange = (event) => {
    const addSelectedFiles = Array.from(event.target.files || event.dataTransfer.files);
    // 注意去重
    setSelectedFiles(prevFiles => combineList(prevFiles, addSelectedFiles, { key: 'name' }));
    // 调用回调函数
    if (onFileChange) {
      console.log('[Filebox] handleFileChange onFileChange');
      onFileChange(combineList(selectedFiles, addSelectedFiles, { key: 'name', flag: 'isFileChangedByFilebox' }), 'Filebox - handleFileChange');
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prevFiles => substractList(prevFiles, [selectedFiles[index]], { key: 'name' }));
    if (onFileRemove) {
      onFileRemove(index, selectedFiles[index], substractList(files, [selectedFiles[index]], { key: 'name', flag: 'isFileChangedByFilebox' })); 
    }
  }

  return (
    <div
      ref={fileContainerRef}
      className="border-2 border-dashed border-gray-300 rounded-2xs p-2 cursor-pointer"
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
                <File index={index} file={file} onFileRemove={handleRemoveFile} />
              ))}
            </div>
          </div>
          <div className="w-full h-10 bg-gray-50 rounded-2xs flex items-center justify-center text-xl text-gray-300 cursor-pointer hover:bg-gray-100" style={{ color: "#34495e" }}>
            + 继续追加文档 +
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        multiple
      />
    </div>
  );
};

export default Filebox;