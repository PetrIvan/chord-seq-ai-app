"use client";
import React, { useState, useEffect, useRef } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";
import { genres, decades } from "@/data/conditions";

import ModelDropdown from "./model_dropdown";
import StyleDropdown from "./style_dropdown";

export default function ModelSelection() {
  const [
    modelPath,
    setModelPath,
    selectedGenres,
    selectedDecades,
    customScrollbarEnabled,
    setModelSize,
  ] = useStore(
    (state) => [
      state.modelPath,
      state.setModelPath,
      state.selectedGenres,
      state.selectedDecades,
      state.customScrollbarEnabled,
      state.setModelSize,
    ],
    shallow
  );

  // Model selection handling
  const models: [string, string, number][] = [
    ["Recurrent Network", "/models/recurrent_net.onnx", 1.44],
    ["Transformer S", "/models/transformer_small.onnx", 4.47],
    ["Transformer M", "/models/transformer_medium.onnx", 9.42],
    ["Transformer L", "/models/transformer_large.onnx", 17.7],
    ["Conditional Transformer S", "/models/conditional_small.onnx", 4.58],
    ["Conditional Transformer M", "/models/conditional_medium.onnx", 9.6],
    ["Conditional Transformer L", "/models/conditional_large.onnx", 18.0],
  ];

  const [selectedModel, setSelectedModel] = useState(
    Math.max(
      models.findIndex((model) => model[1] === modelPath),
      0
    )
  );

  useEffect(() => {
    setModelPath(models[selectedModel][1]);
    setModelSize(models[selectedModel][2]);
  }, [selectedModel]);

  // Dropdowns
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);

  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const openModelDropdownButtonRef = useRef<HTMLButtonElement>(null);

  const styleDropdownRef = useRef<HTMLDivElement>(null);
  const openStyleDropdownButtonRef = useRef<HTMLButtonElement>(null);

  function handleMouseDown(e: MouseEvent) {
    // Close dropdowns if clicked outside
    if (
      modelDropdownRef.current &&
      !modelDropdownRef.current?.contains(e.target as Node) &&
      !openModelDropdownButtonRef.current?.contains(e.target as Node)
    ) {
      setShowModelDropdown(false);
    }
    if (
      styleDropdownRef.current &&
      !styleDropdownRef.current?.contains(e.target as Node) &&
      !openStyleDropdownButtonRef.current?.contains(e.target as Node)
    ) {
      setShowStyleDropdown(false);
    }
  }

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  // Style preview for conditional models
  function style() {
    // Given a list of selected items and their labels, generate a text
    function generateText(
      items: number[],
      labels: string[],
      multipleText: string,
      noItemsText: string
    ) {
      const selectedItems = items
        .map((item, index) => (item > 0 ? labels[index] : null))
        .filter(Boolean);

      if (selectedItems.length === 0) return noItemsText;
      if (selectedItems.join(", ").length > 20) return multipleText;
      return selectedItems.join(", ");
    }

    const genreText = generateText(
      selectedGenres,
      genres,
      "Multiple genres",
      "No genres"
    );
    const decadeText = generateText(
      selectedDecades,
      decades.map((decade) => `${decade}s`),
      "Multiple decades",
      "No decades"
    );

    return (
      <button
        className="flex-1 flex justify-center items-center p-[1dvw] min-w-0 whitespace-nowrap active:bg-zinc-800 hover:bg-zinc-800 rounded-r-lg"
        title="Change style"
        ref={openStyleDropdownButtonRef}
        onClick={() => setShowStyleDropdown(!showStyleDropdown)}
      >
        <p className="truncate">{`${genreText}; ${decadeText}`}</p>
      </button>
    );
  }

  return (
    <section className="relative min-w-0 bg-zinc-900 rounded-[0.5dvw] flex flex-row items-stretch justify-center text-center">
      <button
        className={`flex-1 flex justify-center items-center p-[1dvw] min-w-0 whitespace-nowrap active:bg-zinc-800 hover:bg-zinc-800 rounded${
          models[selectedModel][0].includes("Conditional") ? "-l" : ""
        }-[0.5dvw]`}
        title="Change model"
        ref={openModelDropdownButtonRef}
        onClick={() => setShowModelDropdown(!showModelDropdown)}
      >
        <p className="truncate">{models[selectedModel][0]}</p>
      </button>
      {models[selectedModel][0].includes("Conditional") && (
        <>
          <div className="border-r-[0.2dvw] border-white self-stretch" />
          {style()}
        </>
      )}
      {/* Dropdowns */}
      {showModelDropdown && (
        <ModelDropdown
          setSelectedModel={setSelectedModel}
          setShowModelDropdown={setShowModelDropdown}
          models={models}
          modelDropdownRef={modelDropdownRef}
          customScrollbarEnabled={customScrollbarEnabled}
        />
      )}
      {showStyleDropdown && (
        <StyleDropdown styleDropdownRef={styleDropdownRef} />
      )}
    </section>
  );
}
