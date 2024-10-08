"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Reorder, useDragControls } from "framer-motion";

import Chord from "./chord";

interface Props {
  chord: {
    index: number;
    token: number;
    duration: number;
    variant: number;
    key?: number;
  };
  preventStart: boolean;
  handleReorderEnd: () => void;
  setIsReordering: (isReordering: boolean) => void;
  resizingChord: boolean;
  isMobile: boolean;
  setEnabledShortcuts: (value: boolean) => void;
}

export default function ChordReorderItem({
  chord,
  preventStart,
  handleReorderEnd,
  setIsReordering,
  resizingChord,
  isMobile,
  setEnabledShortcuts,
}: Props) {
  const controls = useDragControls();

  /* Long press detection logic */
  const [isDraggingThis, setIsDraggingThis] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialPointerPosition = useRef<{ x: number; y: number } | null>(null);

  const handleReorderEndRef = useRef(handleReorderEnd);

  useEffect(() => {
    handleReorderEndRef.current = handleReorderEnd;
  }, [handleReorderEnd]);

  const preventStartRef = useRef(preventStart);

  useEffect(() => {
    preventStartRef.current = preventStart;
  }, [preventStart]);

  const isDraggingThisRef = useRef(isDraggingThis);

  useEffect(() => {
    isDraggingThisRef.current = isDraggingThis;
  }, [isDraggingThis]);

  const handlePointerDownLocal = useCallback(
    (e: React.PointerEvent) => {
      if (preventStart) return;
      if (e.button !== 0) return;

      initialPointerPosition.current = { x: e.clientX, y: e.clientY };
      setEnabledShortcuts(false);

      longPressTimerRef.current = setTimeout(() => {
        setIsReordering(true);
        setIsDraggingThis(true);
        controls.start(e);

        longPressTimerRef.current = null;
      }, 500);
    },
    [preventStart, setIsReordering, setEnabledShortcuts, controls],
  );

  const handlePointerUpLocal = useCallback(
    (e?: TouchEvent | MouseEvent) => {
      if (
        typeof TouchEvent !== "undefined" &&
        e instanceof TouchEvent &&
        e.touches.length !== 0
      )
        return;

      if (longPressTimerRef.current) {
        setEnabledShortcuts(true);
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      if (isDraggingThisRef.current) {
        setEnabledShortcuts(true);
        handleReorderEndRef.current();
      }

      setIsDraggingThis(false);
    },
    [setEnabledShortcuts],
  );

  // Prevent reordering during resizing chords
  useEffect(() => {
    if (resizingChord) handlePointerUpLocal();
  }, [resizingChord, handlePointerUpLocal]);

  useEffect(() => {
    window.addEventListener("mouseup", handlePointerUpLocal);
    window.addEventListener("touchend", handlePointerUpLocal);

    return () => {
      window.removeEventListener("mouseup", handlePointerUpLocal);
      window.removeEventListener("touchend", handlePointerUpLocal);
    };
  }, [handlePointerUpLocal]);

  const minDragThreshold = 20;
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      // Cancel reordering if the drag exceeds the threshold on mobile
      if (!isMobile) return;
      if (!initialPointerPosition.current) return;

      const distanceMoved = Math.sqrt(
        Math.pow(e.clientX - initialPointerPosition.current.x, 2) +
          Math.pow(e.clientY - initialPointerPosition.current.y, 2),
      );

      if (distanceMoved > minDragThreshold && longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;

        setIsReordering(false);
      }
    },
    [isMobile, setIsReordering],
  );

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [handlePointerMove, isMobile]);

  return (
    <Reorder.Item
      key={chord.key}
      value={chord}
      className="h-full"
      dragListener={false}
      dragControls={controls}
      onPointerDown={(e) => {
        handlePointerDownLocal(e);
      }}
      // Apply shake when dragging
      animate={isDraggingThis ? "shaking" : "idle"}
      variants={{
        idle: { rotate: 0, x: 0 },
        shaking: {
          rotate: [0, 2, -2, 2, -2, 0],
          transition: {
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
      }}
      whileTap={{ scaleY: 0.95, scaleX: 1 }}
    >
      <Chord
        index={chord.index}
        token={chord.token}
        duration={chord.duration}
        variant={chord.variant}
      />
    </Reorder.Item>
  );
}
