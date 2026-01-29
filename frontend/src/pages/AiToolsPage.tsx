import React, { useState } from "react";
import { AiCompletionResponseDto, aiApi } from "../lib/api";
import { useApiErrorToast } from "../providers/QueryProvider";

export default function AiToolsPage() {
  const [prompt, setPrompt] = useState("");
  const [maxTokens, setMaxTokens] = useState(400);
  const [temperature, setTemperature] = useState(0.7);
  const [completion, setCompletion] = useState<AiCompletionResponseDto | null>(null);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const [sentimentText, setSentimentText] = useState("");
  const [sentimentResult, setSentimentResult] = useState<{ sentiment: string; confidence: number } | null>(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);

  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("blog post");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const { showErrorToast } = useApiErrorToast();

  const handleGenerateCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setCompletionLoading(true);
    setCompletionError(null);
    try {
      const res = await aiApi.generateCompletion({
        prompt: prompt.trim(),
        maxTokens,
        temperature,
      });
      setCompletion(res);
    } catch (err: any) {
      setCompletionError(err?.message || "Failed to generate completion");
      showErrorToast(err);
    } finally {
      setCompletionLoading(false);
    }
  };

  const handleAnalyzeSentiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sentimentText.trim()) return;
    setSentimentLoading(true);
    try {
      const res = await aiApi.analyzeSentiment(sentimentText.trim());
      setSentimentResult(res);
    } catch (err: any) {
      showErrorToast(err);
    } finally {
      setSentimentLoading(false);
    }
  };

  const handleGenerateSuggestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setSuggestionsLoading(true);
    try {
      const res = await aiApi.generateSuggestions(topic.trim(), contentType.trim());
      setSuggestions(res);
    } catch (err: any) {
      showErrorToast(err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      <section>
        <h1 className="text-2xl font-semibold mb-1">AI Content Assistant</h1>
        <p className="text-sm text-slate-400 mb-4">
          Use AI to draft content, analyze sentiment, and generate ideas for marketing, CRM, and documentation.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <form onSubmit={handleGenerateCompletion} className="border border-slate-800 rounded-lg p-4 bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-slate-200">Text completion</h2>
              {completion && (
                <span className="text-[11px] text-slate-400">Model: {completion.model}</span>
              )}
            </div>
            <textarea
              rows={6}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-sm resize-vertical"
              placeholder="Describe what you want to generate: an email to a lead, a product description, a landing page hero, etc."
            />
            <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
              <label className="flex items-center gap-1">
                Max tokens
                <input
                  type="number"
                  min={50}
                  max={1000}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value) || 200)}
                  className="w-20 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs"
                />
              </label>
              <label className="flex items-center gap-2">
                Temperature
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
                <span className="w-10 text-right">{temperature.toFixed(2)}</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={completionLoading}
              className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-500 text-sm font-medium disabled:opacity-60"
            >
              {completionLoading ? "Generating…" : "Generate"}
            </button>
            {completionError && <div className="text-xs text-red-400">{completionError}</div>}
          </form>

          <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/60 text-sm min-h-[180px] whitespace-pre-wrap break-words">
            {!completion && (
              <div className="text-slate-500 text-sm">Generated content will appear here.</div>
            )}
            {completion && (
              <>
                <div className="mb-2 text-slate-100">{completion.text}</div>
                <div className="mt-3 text-[11px] text-slate-500">
                  Tokens · Prompt: {completion.usage.promptTokens} · Completion: {completion.usage.completionTokens} · Total: {completion.usage.totalTokens}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <form onSubmit={handleAnalyzeSentiment} className="border border-slate-800 rounded-lg p-4 bg-slate-900/40 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 mb-1">Sentiment analysis</h2>
          <p className="text-[11px] text-slate-400 mb-1">
            Paste a support ticket, review, or message to quickly gauge sentiment before responding.
          </p>
          <textarea
            rows={5}
            value={sentimentText}
            onChange={(e) => setSentimentText(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-sm resize-vertical"
          />
          <button
            type="submit"
            disabled={sentimentLoading}
            className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-sm font-medium disabled:opacity-60"
          >
            {sentimentLoading ? "Analyzing…" : "Analyze sentiment"}
          </button>
          {sentimentResult && (
            <div className="mt-2 text-xs text-slate-300">
              Sentiment: <span className="font-semibold">{sentimentResult.sentiment}</span> · Confidence: {Math.round(sentimentResult.confidence * 100)}%
            </div>
          )}
        </form>

        <form onSubmit={handleGenerateSuggestions} className="border border-slate-800 rounded-lg p-4 bg-slate-900/40 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 mb-1">Content suggestions</h2>
          <p className="text-[11px] text-slate-400 mb-1">
            Generate outlines and ideas for blog posts, campaigns, or product descriptions.
          </p>
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-sm"
                placeholder="e.g. Onboarding automation for B2B SaaS"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Content type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-sm"
              >
                <option value="blog post">Blog post</option>
                <option value="email sequence">Email sequence</option>
                <option value="landing page">Landing page</option>
                <option value="product description">Product description</option>
                <option value="social campaign">Social campaign</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={suggestionsLoading}
            className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-500 text-sm font-medium disabled:opacity-60"
          >
            {suggestionsLoading ? "Generating…" : "Generate suggestions"}
          </button>
          {suggestions.length > 0 && (
            <ul className="mt-3 list-disc list-inside text-xs text-slate-200 space-y-1">
              {suggestions.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          )}
        </form>
      </section>
    </div>
  );
}
