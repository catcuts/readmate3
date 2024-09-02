import React, { useState, useEffect, useRef, useContext } from 'react';
import File from '@pages/content/File';
import combineList from '@utils/combine-list';
import substractList from '@utils/substract-list';
import { ZIndexContext } from '.';

const Filelist = ({
  files = [],
  onFileInput,
  onFileChange,
  onFileRemove,
}) => {
  const [selectedFiles, setSelectedFiles] = useState(files);
  const fileContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const maxZIndex = useContext(ZIndexContext);

  useEffect(() => {
    console.log('[Filelist] useEffect onFileChange', files.isFileChangedByFilelist);
    if (!files.isFileChangedByFilelist) {
      console.log('[Filelist] useEffect onFileChange', files);
      setSelectedFiles(files);
      if (onFileChange) {
        const newFiles = [...files];
        newFiles.isFileChangedByFilelist = true;
        if (onFileChange) {
          onFileChange(files, 'Filelist - useEffect');
        }
      }
    }
  }, [files]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === fileContainerRef.current) {
          if (onFileChange) {
            const newFiles = [...files];
            newFiles.isFileChangedByFilelist = true;
            onFileChange(newFiles, 'Filelist - ResizeObserver');
          }
        }
      }
    });

    if (fileContainerRef.current) {
      resizeObserver.observe(fileContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [files]);

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
      onFileChange(combineList(selectedFiles, addSelectedFiles, { key: 'name', flag: 'isFileChangedByFilelist' }), 'Filelist - handleFileChange');
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prevFiles => substractList(prevFiles, [selectedFiles[index]], { key: 'name' }));
    if (onFileRemove) {
      onFileRemove(index, selectedFiles[index], substractList(files, [selectedFiles[index]], { key: 'name', flag: 'isFileChangedByFilelist' }));
    }
  }

  return (
    selectedFiles.length === 0 ?
      null
      :
      ( 
        onFileInput || onFileChange || onFileRemove ?
          <div
            ref={fileContainerRef}
            className="border-2 border-dashed border-gray-300 rounded-2xs p-2 cursor-pointer"
            onClick={handleClickFileInput}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col h-full">
              <div className="flex-grow overflow-y-auto" style={{ maxHeight: '120px' }}>
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                      <File index={index} file={file} onFileRemove={handleRemoveFile} />
                  ))}
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
          </div>
          :
          <div className="flex flex-col h-full">
            <div className="flex-grow">
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                    <File index={index} file={file} />
                ))}
              </div>
            </div>
          </div>
      )
  );
};

export default Filelist;