import React from 'react';

// Regular expression to detect URLs
const urlRegex = /(https?:\/\/[^\s]+)/g || /(www\.[^\s]+)/g || /(http?:\/\/[^\s]+)/g;



const LinkifyText = ({ text }) => {
  // Function to replace URLs with anchor tags
  const linkify = (text) => {
    return text?.split(urlRegex).map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return <>{linkify(text)}</>;
};

export default LinkifyText;