const makeCanvas = (
  imageElement: HTMLImageElement,
  targetWidth: number
): HTMLCanvasElement | undefined => {
  const roughCanvas = document.createElement('canvas');

  roughCanvas.width = imageElement.naturalWidth;
  roughCanvas.height = imageElement.naturalHeight;
  console.log('naturalwidthhh', imageElement.naturalWidth);
  console.log('naturalheighthhh', imageElement.naturalHeight);

  const roughCanvasContext = roughCanvas.getContext('2d');
  roughCanvasContext?.drawImage(imageElement, 0, 0);

  let resizingStepCount = Math.floor(
    Math.log2(roughCanvas.width / targetWidth)
  );
  console.log('stepsssss', resizingStepCount);
  for (let i = 0; i < resizingStepCount; i++) {
    const canvasPattern = roughCanvasContext?.createPattern(
      roughCanvas,
      'no-repeat'
    );

    if (!roughCanvasContext || !canvasPattern) {
      return;
    }

    roughCanvas.width /= 2;
    roughCanvas.height /= 2;

    roughCanvasContext?.scale(0.5, 0.5);

    roughCanvasContext.fillStyle = canvasPattern;
    roughCanvasContext?.fillRect(
      0,
      0,
      roughCanvas.width * 2,
      roughCanvas.height * 2
    );
  }

  const formalCanvas = document.createElement('canvas');

  formalCanvas.width = roughCanvas.width;
  formalCanvas.height = roughCanvas.height;

  const formalCanvasContext = formalCanvas.getContext('2d');

  formalCanvasContext?.drawImage(roughCanvas, 0, 0);

  return formalCanvas;
};

export default makeCanvas;
