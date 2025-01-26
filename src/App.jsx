import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [canvasWidth, setCanvasWidth] = useState(300);
  const [canvasHeight, setCanvasHeight] = useState(300);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [customFont, setCustomFont] = useState(null);
  const [customFontName, setCustomFontName] = useState('');
  const [texts, setTexts] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedTextIndex, setSelectedTextIndex] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [showToolbar, setShowToolbar] = useState(true);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const presetFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact'];

  const handleCanvasWidthChange = (e) => {
    setCanvasWidth(parseInt(e.target.value, 10));
  };

  const handleCanvasHeightChange = (e) => {
    setCanvasHeight(parseInt(e.target.value, 10));
  };

  const handleBackgroundColorChange = (e) => {
    setBackgroundColor(e.target.value);
  };

  const handleFontChange = (e) => {
    setSelectedFont(e.target.value);
    if (selectedTextIndex !== null) {
      setTexts(texts.map((text, i) => i === selectedTextIndex ? { ...text, font: e.target.value } : text));
    }
  };

  const handleCustomFontUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fontName = file.name.split('.')[0];
        const newStyle = document.createElement('style');
        newStyle.appendChild(document.createTextNode(`
          @font-face {
            font-family: '${fontName}';
            src: url(${event.target.result}) format('truetype');
          }
        `));
        document.head.appendChild(newStyle);

        setCustomFont(event.target.result);
        setCustomFontName(fontName);
        setSelectedFont(fontName);
        if (selectedTextIndex !== null) {
          setTexts(texts.map((text, i) => i === selectedTextIndex ? { ...text, font: fontName } : text));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddText = () => {
    const newText = {
      content: '新文本',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      size: 30,
      color: '#000000',
      font: selectedFont,
      align: 'horizontal',
    };
    setTexts([...texts, newText]);
    setSelectedTextIndex(texts.length);
  };

  const handleTextChange = (e) => {
    if (selectedTextIndex !== null) {
      setTexts(texts.map((text, i) => i === selectedTextIndex ? { ...text, content: e.target.value } : text));
    }
  };

  const handleTextSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    if (selectedTextIndex !== null) {
      setTexts(texts.map((text, i) => i === selectedTextIndex ? { ...text, size: newSize } : text));
    }
  };

  const handleTextColorChange = (e) => {
    if (selectedTextIndex !== null) {
      setTexts(texts.map((text, i) => i === selectedTextIndex ? { ...text, color: e.target.value } : text));
    }
  };

  const handleTextAlignChange = (e) => {
    if (selectedTextIndex !== null) {
      setTexts(texts.map((text, i) => i === selectedTextIndex ? { ...text, align: e.target.value } : text));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
          const newImage = {
            src: event.target.result,
            x: canvasWidth / 2 - (img.width * scale) / 2,
            y: canvasHeight / 2 - (img.height * scale) / 2,
            width: img.width * scale,
            height: img.height * scale,
            originalWidth: img.width,
            originalHeight: img.height,
          };
          setImages([...images, newImage]);
          setSelectedImageIndex(images.length);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
  
    let clickedOnText = false;
    for (let i = texts.length - 1; i >= 0; i--) {
      const text = texts[i];
      const textWidth = canvasRef.current.getContext('2d').measureText(text.content).width;
      const textHeight = text.size;
  
      if (
        x >= text.x - textWidth / 2 &&
        x <= text.x + textWidth / 2 &&
        y >= text.y - textHeight / 2 &&
        y <= text.y + textHeight / 2
      ) {
        setSelectedTextIndex(i);
        setSelectedImageIndex(null);
        setIsDragging(true);
        setDragStartPos({ x: x - text.x, y: y - text.y });
        clickedOnText = true;
        break;
      }
    }
  
    if (!clickedOnText) {
      let clickedOnImage = false;
      for (let i = images.length - 1; i >= 0; i--) {
        const image = images[i];
        const resizeHandleSize = 10;
        const resizeHandleX = image.x + image.width - resizeHandleSize;
        const resizeHandleY = image.y + image.height - resizeHandleSize;
  
        if (
          x >= resizeHandleX &&
          x <= resizeHandleX + resizeHandleSize &&
          y >= resizeHandleY &&
          y <= resizeHandleY + resizeHandleSize
        ) {
          setSelectedImageIndex(i);
          setSelectedTextIndex(null);
          setIsResizing(true);
          setDragStartPos({ x, y });
          clickedOnImage = true;
          break;
        } else if (
          x >= image.x &&
          x <= image.x + image.width &&
          y >= image.y &&
          y <= image.y + image.height
        ) {
          setSelectedImageIndex(i);
          setSelectedTextIndex(null);
          setIsDragging(true);
          setDragStartPos({ x: x - image.x, y: y - image.y });
          clickedOnImage = true;
          break;
        }
      }
  
      if (!clickedOnImage) {
        setSelectedTextIndex(null);
        setSelectedImageIndex(null);
      }
    }
  };
  
  const handleTouchMove = (e) => {
    if (!isDragging && !isResizing) return;
  
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
  
    if (isDragging) {
      if (selectedTextIndex !== null) {
        setTexts(
          texts.map((text, i) =>
            i === selectedTextIndex
              ? { ...text, x: x - dragStartPos.x, y: y - dragStartPos.y }
              : text
          )
        );
      } else if (selectedImageIndex !== null) {
        setImages(
          images.map((image, i) =>
            i === selectedImageIndex
              ? { ...image, x: x - dragStartPos.x, y: y - dragStartPos.y }
              : image
          )
        );
      }
    } else if (isResizing && selectedImageIndex !== null) {
      setImages(
        images.map((image, i) => {
          if (i === selectedImageIndex) {
            const newWidth = image.width + (x - dragStartPos.x);
            const newHeight = image.height + (y - dragStartPos.y);
            const aspectRatio = image.originalWidth / image.originalHeight;
            const adjustedWidth = Math.max(newWidth, newHeight * aspectRatio);
            const adjustedHeight = Math.max(newHeight, newWidth / aspectRatio);
  
            return {
              ...image,
              width: adjustedWidth,
              height: adjustedHeight,
            };
          }
          return image;
        })
      );
      setDragStartPos({ x, y });
    }
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleDeleteText = () => {
    if (selectedTextIndex !== null) {
      setTexts(texts.filter((_, i) => i !== selectedTextIndex));
      setSelectedTextIndex(null);
    }
  };

  const handleDeleteImage = () => {
    if (selectedImageIndex !== null) {
      setImages(images.filter((_, i) => i !== selectedImageIndex));
      setSelectedImageIndex(null);
    }
  };

  const handleExportImage = () => {
    const canvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;

    tempCtx.fillStyle = backgroundColor;
    tempCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    images.forEach((image) => {
      const img = new Image();
      img.src = image.src;
      tempCtx.drawImage(img, image.x, image.y, image.width, image.height);
    });

    texts.forEach((text) => {
      tempCtx.font = `${text.size}px ${text.font}`;
      tempCtx.fillStyle = text.color;
      tempCtx.textAlign = 'center';
      if (text.align === 'vertical') {
        for (let i = 0; i < text.content.length; i++) {
          tempCtx.fillText(text.content[i], text.x, text.y + i * text.size);
        }
      } else {
        tempCtx.fillText(text.content, text.x, text.y);
      }
    });

    const dataURL = tempCanvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.download = 'image.png';
    link.href = dataURL;
    link.click();
  };

  const handleAspectRatioChange = (e) => {
    const [width, height] = e.target.value.split(':').map(Number);
    setCanvasHeight(canvasWidth * (height / width));
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    images.forEach((image) => {
      const img = new Image();
      img.src = image.src;
      img.onload = () => {
        ctx.drawImage(img, image.x, image.y, image.width, image.height);
      }
    });

    texts.forEach((text) => {
      ctx.font = `${text.size}px ${text.font}`;
      ctx.fillStyle = text.color;
      ctx.textAlign = 'center';
      if (text.align === 'vertical') {
        for (let i = 0; i < text.content.length; i++) {
          ctx.fillText(text.content[i], text.x, text.y + i * text.size);
        }
      } else {
        ctx.fillText(text.content, text.x, text.y);
      }
    });
  };

  useEffect(() => {
    drawCanvas();
  }, [canvasWidth, canvasHeight, backgroundColor, texts, images]);

  return (
    <div className="app-container">
      <div className="canvas-area">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>
      <button className="toolbar-toggle" onClick={() => setShowToolbar(!showToolbar)}>
        {showToolbar ? '隐藏工具栏' : '显示工具栏'}
      </button>
      {showToolbar && (
        <div className="toolbar">
          <div className="toolbar-section">
            <div className="toolbar-group">
              <label htmlFor="canvas-width">画布尺寸:</label>
              <input
                id="canvas-width"
                type="number"
                min="1"
                value={canvasWidth}
                onChange={handleCanvasWidthChange}
              />
              <input
                id="canvas-height"
                type="number"
                min="1"
                value={canvasHeight}
                onChange={handleCanvasHeightChange}
              />
            </div>
            <div className="toolbar-group">
              <label htmlFor="aspect-ratio">画布比例:</label>
              <select id="aspect-ratio" onChange={handleAspectRatioChange}>
                <option value="1:1">1:1</option>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
              </select>
            </div>
            <div className="toolbar-group">
              <label htmlFor="background-color">背景颜色:</label>
              <input
                id="background-color"
                type="color"
                value={backgroundColor}
                onChange={handleBackgroundColorChange}
              />
            </div>
          </div>
          <div className="toolbar-section">
            <div className="toolbar-group">
              <button onClick={handleAddText}>添加文本</button>
            </div>
            <div className="toolbar-group">
              <label htmlFor="font-family">字体族:</label>
              <select id="font-family" value={selectedFont} onChange={handleFontChange}>
                {presetFonts.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
                {customFont && (
                  <option value={customFontName}>
                    {customFontName}
                  </option>
                )}
              </select>
              <input
                type="file"
                accept=".ttf,.otf"
                ref={fileInputRef}
                onChange={handleCustomFontUpload}
                style={{ display: 'none' }}
              />
              <button onClick={() => fileInputRef.current.click()}>选择文件</button>
              <p>未选择任何文件</p>
            </div>
            <div className="toolbar-group">
              <label htmlFor="text-content">文本:</label>
              <input
                id="text-content"
                type="text"
                value={selectedTextIndex === null ? '' : texts[selectedTextIndex].content}
                onChange={handleTextChange}
                disabled={selectedTextIndex === null}
              />
            </div>
            <div className="toolbar-group">
              <label htmlFor="text-size">字体大小:</label>
              <input
                id="text-size"
                type="number"
                min="1"
                value={selectedTextIndex === null ? '' : texts[selectedTextIndex].size}
                onChange={handleTextSizeChange}
                disabled={selectedTextIndex === null}
              />
            </div>
            <div className="toolbar-group">
              <label htmlFor="text-color">字体颜色:</label>
              <input
                id="text-color"
                type="color"
                value={selectedTextIndex === null ? '' : texts[selectedTextIndex].color}
                onChange={handleTextColorChange}
                disabled={selectedTextIndex === null}
              />
            </div>
            <div className="toolbar-group">
              <label htmlFor="text-align">文本排列:</label>
              <select
                id="text-align"
                value={selectedTextIndex === null ? '' : texts[selectedTextIndex].align}
                onChange={handleTextAlignChange}
                disabled={selectedTextIndex === null}
              >
                <option value="horizontal">横向</option>
                <option value="vertical">竖向</option>
              </select>
            </div>
            {selectedTextIndex !== null && (
              <div className="toolbar-group">
                <button onClick={handleDeleteText}>删除文本</button>
              </div>
            )}
          </div>
          <div className="toolbar-section">
            <div className="toolbar-group">
              <label htmlFor="image-upload">图片:</label>
              <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <button onClick={() => imageInputRef.current.click()}>选择文件</button>
              <p>未选择任何文件</p>
            </div>
            {selectedImageIndex !== null && (
              <div className="toolbar-group">
                <button onClick={handleDeleteImage}>删除图片</button>
              </div>
            )}
          </div>
          <div className="toolbar-section">
            <div className="toolbar-group">
              <button onClick={handleExportImage}>导出图片</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
