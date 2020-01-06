const tileSizeCalc = (lastInnerWidth: number) => {
  const maxTileWidth = 480;
  const minTileWidth = 241;

  let tileColumnsNumber = 0;
  let tileWidth = 0;

  while (true) {
    ++tileColumnsNumber;
    if (tileColumnsNumber > 96) {
      break;
    }
    const result = lastInnerWidth / tileColumnsNumber;

    if (result > maxTileWidth) {
      tileWidth = maxTileWidth;
      continue;
    }

    if (result < minTileWidth) {
      break;
    }

    tileWidth = result;
  }
  console.log('tileWidthhhhh', tileWidth);
  return tileWidth;
};

export default tileSizeCalc;
