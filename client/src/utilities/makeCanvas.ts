const makeCanvas = (
  imageElement: HTMLImageElement,
  appropriateImageWidth: number
): HTMLCanvasElement | undefined => {
  const roughCanvas = document.createElement('canvas');

  roughCanvas.width = imageElement.naturalWidth;
  roughCanvas.height = imageElement.naturalHeight;

  const roughCanvasContext = roughCanvas.getContext('2d');
  roughCanvasContext?.drawImage(imageElement, 0, 0);

  let resizingStepNumber = Math.floor(
    Math.log2(roughCanvas.width / appropriateImageWidth)
  );

  for (let i = 0; i < resizingStepNumber; i++) {
    const canvasPattern = roughCanvasContext?.createPattern(
      roughCanvas,
      'no-repeat'
    );

    if (!roughCanvasContext || !canvasPattern) {
      return;
    }

    roughCanvas.width *= 0.5;
    roughCanvas.height *= 0.5;

    roughCanvasContext?.scale(0.5, 0.5);

    roughCanvasContext.fillStyle = canvasPattern;
    roughCanvasContext?.fillRect(
      0,
      0,
      roughCanvas.width * 2,
      roughCanvas.height * 2
    );
  }

  const finalTouchRatio = appropriateImageWidth / roughCanvas.width;

  const canvasPattern = roughCanvasContext?.createPattern(
    roughCanvas,
    'no-repeat'
  );

  if (!roughCanvasContext || !canvasPattern) {
    return;
  }

  roughCanvas.width *= finalTouchRatio;
  roughCanvas.height *= finalTouchRatio;

  roughCanvasContext?.scale(finalTouchRatio, finalTouchRatio);

  roughCanvasContext.fillStyle = canvasPattern;
  roughCanvasContext?.fillRect(
    0,
    0,
    roughCanvas.width * (1 / finalTouchRatio),
    roughCanvas.height * (1 / finalTouchRatio)
  );

  const formalCanvas = document.createElement('canvas');

  formalCanvas.width = roughCanvas.width;
  formalCanvas.height = roughCanvas.height;

  const formalCanvasContext = formalCanvas.getContext('2d');

  formalCanvasContext?.drawImage(roughCanvas, 0, 0);

  return formalCanvas;
};

export default makeCanvas;
