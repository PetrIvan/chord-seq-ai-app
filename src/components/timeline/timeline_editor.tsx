"use client";
import React, { useState, useEffect, useRef } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

import { onPlayheadPositionChange } from "@/playback/player";

import Ticks from "../ticks";
import Signature from "./signature";
import TimelineControls from "./timeline_controls";
import Playhead from "../playhead";
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
    ],
    shallow
  );

  /* State window logic */
  useEffect(() => {
    // Once the app starts, initialize the state window
    initializeStateWindow();
  }, []);

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

  const isOnTimeline = (clientY: number, rect: DOMRect) => {
    const fromTop = clientY - rect.top;
    const fromBottom = rect.bottom - clientY;
    const rectSize = rect.bottom - rect.top;
    const ticksBoundary = rectSize / 6;

    return fromTop > ticksBoundary && fromBottom > ticksBoundary;
  };

  const handleTimelineDrag = (event: MouseEvent) => {
    if (timelineRef.current && middleMouseDraggingRef.current) {
      const dx = event.clientX - lastPositionRef.current;

      setLastPosition(event.clientX);
      setTimelinePosition(Math.min(0, timelinePositionRef.current + dx));
    }
  };

  const handleDragStart = (event: MouseEvent) => {
    setLastPosition(event.clientX);
    if (
      timelineRef.current &&
      event.button === 1 &&
      isOnTimeline(event.clientY, timelineRef.current.getBoundingClientRect())
    ) {
      setMiddleMouseDragging(true);
      event.preventDefault();
    }
  };

  const handleDragStop = () => {
    setMiddleMouseDragging(false);
  };

  useEffect(() => {
    timelineRef?.current?.addEventListener("mousedown", handleDragStart);
    window.addEventListener("mousemove", handleTimelineDrag);
    window.addEventListener("mouseup", handleDragStop);

    return () => {
      timelineRef?.current?.removeEventListener("mousedown", handleDragStart);
      window.removeEventListener("mousemove", handleTimelineDrag);
      window.removeEventListener("mouseup", handleDragStop);
    };
  }, []);

  /* Timeline start position */
  const [timelineStart, setTimelineStart] = useState(0);
  const timelineStartRef = useRef(timelineStart);

  useEffect(() => {
    timelineStartRef.current = timelineStart;
  }, [timelineStart]);

  useEffect(() => {
    // Get padding from the left of the timeline
    if (timelineRef.current) {
      const style = window.getComputedStyle(timelineRef.current);
      const leftPadding = parseInt(style.paddingLeft, 10);

      // Set the timeline start to the left padding + 1 to account for the border
      setTimelineStart(leftPadding + 1);
    }
  }, [timelineRef?.current?.getBoundingClientRect()]);

  /* Zoom logic */
  const zoomRef = useRef(zoom);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const handleZoom = (event: WheelEvent) => {
    event.preventDefault();

    const newZoom = zoom + event.deltaY * -0.00075;
    const clampedZoom = Math.min(Math.max(newZoom, 0.25), 5);

    setZoom(clampedZoom);

    // Zoom in on the mouse position
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();

      // Mouse position from the left start of the timeline
      const x = event.clientX - rect.left - timelineStartRef.current;

      // Calculate the position change required to correctly zoom on the cursor
      const zoomChange = clampedZoom - zoomRef.current;
      const relativePosition =
        (x - timelinePositionRef.current) / zoomRef.current;
      const positionChange = zoomChange * relativePosition;

      setTimelinePosition(
        Math.min(0, timelinePositionRef.current - positionChange)
      );
    }
  };

  useEffect(() => {
    timelineRef?.current?.addEventListener("wheel", handleZoom, {
      passive: false,
    });

    return () => {
      timelineRef?.current?.removeEventListener("wheel", handleZoom);
    };
  }, [zoom, timelinePosition]);

  /* Window resize logic */
  // The width referenced is that of the timeline
  const [width, setWidth] = useState(0);
  const [widthWithoutPadding, setWidthWithoutPadding] = useState(0);

  useEffect(() => {
    function handleResize() {
      if (timelineRef.current) {
        const style = window.getComputedStyle(timelineRef.current);
        const leftPadding = parseInt(style.paddingLeft, 10);
        const rightPadding = parseInt(style.paddingRight, 10);

        setWidth(timelineRef.current.offsetWidth);
        setWidthWithoutPadding(
          timelineRef.current.offsetWidth - leftPadding - rightPadding
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
  const xToPosition = (x: number) => {
    return (
      ((x - timelineStartRef.current) /
        100 /
        zoomRef.current /
        signatureRef.current[1]) *
      signatureRef.current[0] *
      4
    );
  };

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
  const handlePlayheadUpdate = (event: MouseEvent) => {
    if (!timelineRef.current || !holdingMouseRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const newPlayheadPosition = Math.max(
      0,
      xToPosition(x - timelinePositionRef.current)
    );

    onPlayheadPositionChange(newPlayheadPosition); // Reference to playback

    setPlayheadPosition(newPlayheadPosition);
  };

  const handleMouseDown = (event: MouseEvent) => {
    const rect = timelineRef?.current?.getBoundingClientRect();

    if (!rect || !isOnTicks(event.clientY, rect) || event.button !== 0) return;

    // Playhead should update both on mouse move and click
    setHoldingMouse(true);
    if (timelineRef.current) {
      const newPlayheadPosition = Math.max(
        0,
        xToPosition(event.clientX - rect.left - timelinePositionRef.current)
      );

      onPlayheadPositionChange(newPlayheadPosition); // Reference to playback

      setPlayheadPosition(newPlayheadPosition);
    }

    window.addEventListener("mousemove", handlePlayheadUpdate);
  };

  const handleMouseUp = () => {
    setHoldingMouse(false);
    window.removeEventListener("mousemove", handlePlayheadUpdate);
  };

  useEffect(() => {
    timelineRef?.current?.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      timelineRef?.current?.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

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
      className="grid grid-cols-[max(8dvh)_1fr] grid-rows-[auto_1fr] w-full h-full min-h-0"
      style={{ gridTemplateRows: `${firstRowHeight} 1fr` }}
    >
      <div /> {/* The upper left corner is empty */}
      <TimelineControls
        stateWindowLength={stateWindow.length}
        timelineWidth={widthWithoutPadding}
        playing={playing}
        setPlaying={setPlaying}
      />
      <Signature />
      <div
        ref={timelineRef}
        className={`relative flex-1 bg-zinc-900 px-[1dvw] rounded-br-[0.5dvw] h-full ${
          width > 500 && "rounded-tr-[0.5dvw]"
        } flex flex-col overflow-hidden ${
          middleMouseDragging && "cursor-grabbing"
        }`}
      >
        <Playhead timelineStart={timelineStart} />
        <Ticks
          timelineStart={timelineStart}
          top={true}
          availableSpace={widthWithoutPadding}
        />
        <Chords />
        <Ticks
          timelineStart={timelineStart}
          top={false}
          availableSpace={widthWithoutPadding}
        />
      </div>
    </section>
  );
}
