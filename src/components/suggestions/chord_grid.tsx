import { AutoSizer, Grid, GridCellProps } from "react-virtualized";

export default function ChordGrid(
  chordList: JSX.Element[],
  columnCount: number,
) {
  // Units for responsive design
  let oneDvhInPx = window.innerHeight / 100;

  function dvhToPx(dvh: number) {
    return dvh * oneDvhInPx;
  }

  function pxToDvh(px: number) {
    return px / oneDvhInPx;
  }

  // Render each cell
  const cellRenderer = ({
    columnIndex,
    rowIndex,
    style,
    key,
  }: GridCellProps) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= chordList.length) return null;

    return (
      <div className="h-full w-full" style={{ ...style }} key={key}>
        <div className="h-full w-full p-[1dvh]">{chordList[index]}</div>
      </div>
    );
  };

  return (
    <div className="h-full w-full">
      <AutoSizer>
        {({ width, height }: { height: number; width: number }) => {
          // Manual responsive design
          let sliderWidth = 17; // px
          let prefferedColumnWidth = 25; // dvh
          width = pxToDvh(width - sliderWidth);
          let columnWidth = Math.max(
            prefferedColumnWidth,
            width / Math.floor(width / prefferedColumnWidth),
          );
          const columnCount = Math.floor(width / columnWidth);
          const rowCount = Math.ceil(chordList.length / columnCount);

          columnWidth = dvhToPx(columnWidth);

          return (
            <Grid
              cellRenderer={cellRenderer}
              columnCount={columnCount}
              columnWidth={columnWidth}
              height={height}
              rowCount={rowCount}
              rowHeight={dvhToPx(12)}
              width={dvhToPx(width) + sliderWidth}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
}
