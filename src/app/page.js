'use client';

import { useState } from "react";
import Image from "next/image";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: e.target.prompt.value,
      }),
    });
    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      setIsLoading(false);
      return;
    }
    setPrediction(prediction);

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        setIsLoading(false);
        return;
      }
      setPrediction(prediction);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Dream something with{" "}
            <a 
              href="https://replicate.com/black-forest-labs/flux-schnell?utm_source=project&utm_project=getting-started"
              className="hover:text-purple-400 transition-colors duration-200"
            >
              Flux Schnell
            </a>
          </h1>
          <p className="text-gray-400 text-lg">Transform your imagination into reality with AI</p>
        </div>

        <form 
          className="w-full mb-8 flex flex-col md:flex-row gap-4" 
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            className="flex-grow px-6 py-4 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-200 text-white placeholder-gray-400"
            name="prompt"
            placeholder="Describe your imagination..."
            disabled={isLoading}
          />
          <button 
            className={`px-8 py-4 rounded-lg font-semibold text-white transition-all duration-200 ${
              isLoading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </form>

        {error && (
          <div className="w-full p-4 mb-8 rounded-lg bg-red-500/10 border border-red-500 text-red-500">
            {error}
          </div>
        )}

        {prediction && (
          <div className="space-y-4">
            {prediction.output && (
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden ring-2 ring-purple-500/20">
                <Image
                  src={prediction.output[prediction.output.length - 1]}
                  alt="AI generated image"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800/50">
              <p className="text-sm text-gray-400">
                Status: <span className="text-purple-400">{prediction.status}</span>
              </p>
              {prediction.status === "succeeded" && (
                <p className="text-sm text-gray-400">
                  Generation completed ✨
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}