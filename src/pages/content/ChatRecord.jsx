import React, { useState, useEffect, useRef } from 'react';
import File from '@pages/content/File';
import Filelist from '@pages/content/Filelist';

const ChatRecord = ({ data }) => {
  const isUser = data.role === 'user';
  const alignmentClass = isUser ? 'justify-end' : 'justify-start';
  const bgColorClass = isUser ? 'bg-blue-400' : 'bg-gray-100';
  const textColorClass = isUser ? 'text-white' : 'text-gray-800';

  return (
    <div className={`flex ${alignmentClass} mb-4`}>
      <div className={`max-w-[90%] inline-block rounded-2xs p-3 ${bgColorClass} ${textColorClass}`}>
        {data.content.map((item, index) => (
          <div key={index}>
            {item.attachmentsWithDetail && item.attachmentsWithDetail.length > 0 && (
              <>
                <Filelist files={item.attachmentsWithDetail.map((attachment, index) => ({ name: attachment.name, size: 0 }))} />
                {/* 分隔线 */}
                <div className="border-t border-gray-200 my-2" />
              </>
            )}
            {item.type === 'text' && <p className='m-0 break-words'>{item.text}</p>}
            {item.type === 'image' && (
              <div>
                {item.image_url && (
                  <img src={item.image_url.url} alt={item.image_url.detail} className="max-w-full h-auto rounded-2xs" />
                )}
                {item.image_file && (
                  <div className="text-sm text-gray-600">
                    Image file: {item.image_file.file_id} - {item.image_file.detail}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatRecord;