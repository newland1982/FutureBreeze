const tileSizeCalc = (gridContainerWidth: number, gridColumnGap: number) => {
  const maxTileWidth = 408;
  const minTileWidth = 252;

  let gridColumnsNumber = 0;
  let tileWidth = 0;

  const tileAspectRatio = 0.707;
  const tileSize = { tileWidth: 0, tileHeight: 0 };

  while (true) {
    ++gridColumnsNumber;
    if (gridColumnsNumber > 96) {
      break;
    }
    const result =
      (gridContainerWidth - (gridColumnsNumber - 1) * gridColumnGap) /
      gridColumnsNumber;

    if (result > maxTileWidth) {
      tileWidth = maxTileWidth;
      continue;
    }

    if (result < minTileWidth) {
      break;
    }

    tileWidth = result;
  }

  tileSize.tileWidth = tileWidth;
  tileSize.tileHeight = tileWidth * tileAspectRatio;

  return tileSize;
};

export default tileSizeCalc;
