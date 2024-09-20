"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useInit } from "@/state/use_init";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

import { onPlayheadPositionChange } from "@/playback/player";

import Ticks from "./ticks";
import Signature from "./signature";
import TimelineControls from "./timeline_controls";
import Playhead from "./playhead";
import Chords from "./chords";

export default function TimelineEditor() {
  const [
    signature,
    timelinePosition,
    setTimelinePosition,
    zoom,
    setZoom,
    setPlayheadPosition,
    stateWindow,
    initializeStateWindow,
    isStepByStepTutorialOpen,
  ] = useStore(
    (state) => [
      state.signature,
      state.timelinePosition,
      state.setTimelinePosition,
      state.zoom,
      state.setZoom,
      state.setPlayheadPosition,
      state.stateWindow,
      state.initializeStateWindow,
      state.isStepByStepTutorialOpen,
    ],
    shallow,
  );

  /* Units */
  const [oneDvwInPx, setOneDvwInPx] = useState(window.innerWidth / 100);

  // Update on window resize
  useEffect(() => {
    const handleResize = () => {
      setOneDvwInPx(window.innerWidth / 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const dvwToPx = useCallback(
    (dvw: number) => {
      return dvw * oneDvwInPx;
    },
    [oneDvwInPx],
  );

  const pxToDvw = useCallback(
    (px: number) => {
      return px / oneDvwInPx;
    },
    [oneDvwInPx],
  );

  /* State window logic */
  useInit(() => {
    // Once the app starts, initialize the state window
    initializeStateWindow();
  });

  /* Timeline position logic */
  const timelinePositionRef = useRef(timelinePosition);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    timelinePositionRef.current = timelinePosition;
  }, [timelinePosition]);

  const [middleMouseDragging, setMiddleMouseDragging] = useState(false);
  const middleMouseDraggingRef = useRef(middleMouseDragging);

  useEffect(() => {
    middleMouseDraggingRef.current = middleMouseDragging;
  }, [middleMouseDragging]);

  const [lastPosition, setLastPosition] = useState(0);
  const lastPositionRef = useRef(lastPosition);

  useEffect(() => {
    lastPositionRef.current = lastPosition;
  }, [lastPosition]);

  const isStepByStepTutorialOpenRef = useRef(isStepByStepTutorialOpen);

  useEffect(() => {
    isStepByStepTutorialOpenRef.current = isStepByStepTutorialOpen;
  }, [isStepByStepTutorialOpen]);

  const isOnTimeline = (clientY: number, rect: DOMRect) => {
    const fromTop = clientY - rect.top;
    const fromBottom = rect.bottom - clientY;
    const rectSize = rect.bottom - rect.top;
    const ticksBoundary = rectSize / 6;

    return fromTop > ticksBoundary && fromBottom > ticksBoundary;
  };

  const handleTimelineDrag = useCallback(
    (event: MouseEvent) => {
      if (isStepByStepTutorialOpenRef.current) return;

      if (timelineRef.current && middleMouseDraggingRef.current) {
        const dx = pxToDvw(event.clientX) - lastPositionRef.current;

        setLastPosition(pxToDvw(event.clientX));
        setTimelinePosition(Math.min(0, timelinePositionRef.current + dx));
      }
    },
    [pxToDvw, setTimelinePosition],
  );

  const handleDragStart = useCallback(
    (event: MouseEvent) => {
      if (isStepByStepTutorialOpenRef.current) return;

      setLastPosition(pxToDvw(event.clientX));
      if (
        timelineRef.current &&
        event.button === 1 &&
        isOnTimeline(event.clientY, timelineRef.current.getBoundingClientRect())
      ) {
        setMiddleMouseDragging(true);
        event.preventDefault();
      }
    },
    [pxToDvw],
  );

  const handleDragStop = () => {
    setMiddleMouseDragging(false);
  };

  useEffect(() => {
    const timelineEl = timelineRef.current;
    if (!timelineEl) return;

    timelineEl.addEventListener("mousedown", handleDragStart);
    window.addEventListener("mousemove", handleTimelineDrag);
    window.addEventListener("mouseup", handleDragStop);

    return () => {
      timelineEl.removeEventListener("mousedown", handleDragStart);
      window.removeEventListener("mousemove", handleTimelineDrag);
      window.removeEventListener("mouseup", handleDragStop);
    };
  }, [handleDragStart, handleTimelineDrag]);

  /* Timeline start position */
  // Set the timeline start to the left padding in dvw + offset to account for the border
  const timelineStart = 1 + 0.05;

  /* Zoom logic */
  const zoomRef = useRef(zoom);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const handleZoom = useCallback(
    (event: WheelEvent) => {
      if (isStepByStepTutorialOpenRef.current) return;

      event.preventDefault();

      const newZoom = zoom + event.deltaY * -0.00075;
      const clampedZoom = Math.min(Math.max(newZoom, 0.25), 5);

      setZoom(clampedZoom);

      // Zoom in on the mouse position
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();

      // Mouse position from the left start of the timeline
      const x = pxToDvw(event.clientX - rect.left) - timelineStart;

      // Calculate the position change required to correctly zoom on the cursor
      const zoomChange = clampedZoom - zoomRef.current;
      const relativePosition =
        (x - timelinePositionRef.current) / zoomRef.current;
      const positionChange = zoomChange * relativePosition;

      setTimelinePosition(
        Math.min(0, timelinePositionRef.current - positionChange),
      );
    },
    [pxToDvw, setTimelinePosition, setZoom, timelineStart, zoom],
  );

  useEffect(() => {
    const timelineEl = timelineRef.current;
    if (!timelineEl) return;

    timelineEl.addEventListener("wheel", handleZoom, {
      passive: false,
    });

    return () => {
      timelineEl.removeEventListener("wheel", handleZoom);
    };
  }, [zoom, timelinePosition, handleZoom]);

  /* Window resize logic */
  // The width referenced is that of the timeline
  const [widthInPx, setWidthInPx] = useState(0);
  const [widthWithoutPadding, setWidthWithoutPadding] = useState(0);

  useEffect(() => {
    function handleResize() {
      if (timelineRef.current) {
        const style = window.getComputedStyle(timelineRef.current);
        const leftPadding = parseInt(style.paddingLeft, 10);
        const rightPadding = parseInt(style.paddingRight, 10);

        setWidthInPx(timelineRef.current.offsetWidth);
        setWidthWithoutPadding(
          timelineRef.current.offsetWidth - leftPadding + rightPadding,
        );
      }
    }

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* Playhead logic */
  const [playing, setPlaying] = useState(false);
  const [holdingMouse, setHoldingMouse] = useState(false);

  const holdingMouseRef = useRef(holdingMouse);

  useEffect(() => {
    holdingMouseRef.current = holdingMouse;
  }, [holdingMouse]);

  const signatureRef = useRef(signature);

  useEffect(() => {
    signatureRef.current = signature;
  }, [signature]);

  // Convert from screen position to timeline position
  const xToPosition = useCallback(
    (x: number) => {
      return (
        ((x - dvwToPx(timelineStart)) /
          10 /
          zoomRef.current /
          signatureRef.current[1]) *
        signatureRef.current[0] *
        4
      );
    },
    [dvwToPx, timelineStart],
  );

  const isOnTicks = (clientY: number, rect: DOMRect) => {
    const fromTop = clientY - rect.top;
    const fromBottom = rect.bottom - clientY;
    const rectSize = rect.bottom - rect.top;
    const ticksBoundary = rectSize / 6;

    return (
      (fromTop < ticksBoundary || fromBottom < ticksBoundary) &&
      fromTop > 0 &&
      fromBottom > 0
    );
  };

  // Set the playhead position based on current cursor position
  const handlePlayheadUpdate = useCallback(
    (event: MouseEvent) => {
      if (isStepByStepTutorialOpenRef.current) return;

      if (!timelineRef.current || !holdingMouseRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      let newPlayheadPosition = Math.max(
        0,
        xToPosition(x - dvwToPx(timelinePositionRef.current)),
      );
      newPlayheadPosition = pxToDvw(newPlayheadPosition);

      onPlayheadPositionChange(newPlayheadPosition); // Reference to playback

      setPlayheadPosition(newPlayheadPosition);
    },
    [dvwToPx, pxToDvw, setPlayheadPosition, xToPosition],
  );

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (isStepByStepTutorialOpenRef.current) return;

      const rect = timelineRef?.current?.getBoundingClientRect();

      if (!rect || !isOnTicks(event.clientY, rect) || event.button !== 0)
        return;

      // Playhead should update both on mouse move and click
      setHoldingMouse(true);
      if (timelineRef.current) {
        let newPlayheadPosition = Math.max(
          0,
          xToPosition(
            event.clientX - rect.left - dvwToPx(timelinePositionRef.current),
          ),
        );
        newPlayheadPosition = pxToDvw(newPlayheadPosition);

        onPlayheadPositionChange(newPlayheadPosition); // Reference to playback

        setPlayheadPosition(newPlayheadPosition);
      }

      window.addEventListener("mousemove", handlePlayheadUpdate);
    },
    [dvwToPx, handlePlayheadUpdate, pxToDvw, setPlayheadPosition, xToPosition],
  );

  const handleMouseUp = useCallback(() => {
    setHoldingMouse(false);
    window.removeEventListener("mousemove", handlePlayheadUpdate);
  }, [handlePlayheadUpdate]);

  useEffect(() => {
    const timelineEl = timelineRef.current;
    if (!timelineEl) return;

    timelineEl.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      timelineEl.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseUp]);

  /* Grid layout sizing logic */
  // To make the signature and the timeline controls match
  const [firstRowHeight, setFirstRowHeight] = useState("auto");
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateRowHeight = () => {
      if (gridRef.current) {
        const firstColumnWidth = gridRef.current.children[0].clientWidth;
        setFirstRowHeight(`${firstColumnWidth}px`);
      }
    };

    window.addEventListener("resize", updateRowHeight);
    updateRowHeight(); // Initial call to set the height

    return () => window.removeEventListener("resize", updateRowHeight);
  }, []);

  return (
    <section
      ref={gridRef}
      className="grid h-full min-h-0 w-full grid-cols-[8dvh_1fr] grid-rows-[auto_1fr]"
      style={{ gridTemplateRows: `${firstRowHeight} 1fr` }}
    >
      <div /> {/* The upper left corner is empty */}
      <TimelineControls
        stateWindowLength={stateWindow.length}
        timelineWidth={pxToDvw(widthWithoutPadding)}
        playing={playing}
        setPlaying={setPlaying}
      />
      <Signature />
      <div
        ref={timelineRef}
        className={`relative h-full flex-1 rounded-br-[1dvh] bg-zinc-900 px-[1dvw] ${
          widthInPx > 500 && "rounded-tr-[1dvh]"
        } flex flex-col overflow-hidden ${
          middleMouseDragging && "cursor-grabbing"
        }`}
      >
        <Playhead timelineStart={timelineStart} />
        <Ticks
          timelineStart={timelineStart}
          top={true}
          availableSpace={pxToDvw(widthWithoutPadding)}
        />
        <Chords />
        <Ticks
          timelineStart={timelineStart}
          top={false}
          availableSpace={pxToDvw(widthWithoutPadding)}
        />
      </div>
    </section>
  );
}
