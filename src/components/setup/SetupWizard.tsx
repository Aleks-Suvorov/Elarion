'use client';

import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../state/gameStore';
import { useUIStore } from '../../state/uiStore';
import { SETUP_QUESTIONS, buildSetupSummary } from '../../data/questions';
import { configFromAnswers, togglesFromConfig } from '../../engine/setup';
import { generateWorld } from '../../engine/worldgen';
import { randomSeed } from '../../lib/rng';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { clsx } from 'clsx';
import type { SetupAnswers } from '../../types';
import { CharCreationWizard } from './CharCreationWizard';

type Phase = 'questions' | 'summary' | 'char_creation';

export function SetupWizard() {
  const { initSession, setCharCreation } = useGameStore();
  const { setMode } = useUIStore();

  const [phase, setPhase] = useState<Phase>('questions');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Partial<SetupAnswers>>({});
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [config, setConfig] = useState<ReturnType<typeof configFromAnswers> | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, [currentQ, phase]);

  const question = SETUP_QUESTIONS[currentQ];

  const handleSubmit = () => {
    if (!question) return;
    setError(null);

    // Some questions are skipped based on previous answers
    if (question.id === 'q3_secondGenre' && !answers.q2_mixSecondGenre) {
      setAnswers((a) => ({ ...a, q3_secondGenre: null }));
      setCurrentQ((q) => q + 1);
      setInput('');
      return;
    }
    if (question.id === 'q11_survivalMeters' && !answers.q10_survivalEnabled) {
      setAnswers((a) => ({ ...a, q11_survivalMeters: [] }));
      setCurrentQ((q) => q + 1);
      setInput('');
      return;
    }

    const result = question.validate(input, answers);
    if (!result.valid) {
      setError(result.error ?? 'Invalid input.');
      return;
    }

    const newAnswers = { ...answers, [question.id]: result.value };
    setAnswers(newAnswers);

    if (currentQ + 1 >= SETUP_QUESTIONS.length) {
      // All questions answered — build summary
      const completed = newAnswers as SetupAnswers;
      setSummary(buildSetupSummary(completed));
      const cfg = configFromAnswers(completed);
      setConfig(cfg);
      setPhase('summary');
    } else {
      setCurrentQ((q) => q + 1);
    }
    setInput('');
  };

  const handleConfirmSummary = () => {
    if (!config) return;
    const completed = answers as SetupAnswers;
    const toggles = togglesFromConfig(config);
    const seed = randomSeed();
    const world = generateWorld({ config, seed });
    initSession(config, toggles, world, {
      regionId: world.regions[0].id,
      regionName: world.regions[0].name,
      description: world.regions[0].description,
    }, completed);
    setPhase('char_creation');
  };

  const handleCharCreationDone = () => {
    setMode('play');
  };

  if (phase === 'char_creation') {
    return <CharCreationWizard config={config!} onDone={handleCharCreationDone} />;
  }

  if (phase === 'summary') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6 max-w-2xl mx-auto">
        <div className="w-full bg-surface-1 border border-faint rounded-lg p-6">
          <h2 className="text-accent-gold font-bold text-sm uppercase tracking-widest mb-1">
            World Configuration
          </h2>
          <p className="text-muted text-xs mb-4">Review your setup before world generation begins.</p>
          <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed bg-surface-0 rounded p-4 border border-faint mb-6">
            {summary}
          </pre>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPhase('questions');
                setCurrentQ(SETUP_QUESTIONS.length - 1);
              }}
            >
              ← Revise
            </Button>
            <Button variant="primary" size="md" onClick={handleConfirmSummary} className="flex-1">
              Generate World & Begin →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="w-full mb-6">
        <div className="flex justify-between text-xs text-muted mb-1.5">
          <span>World Setup</span>
          <span>{currentQ + 1} / {SETUP_QUESTIONS.length}</span>
        </div>
        <div className="w-full h-1 bg-surface-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-gold transition-all duration-300 rounded-full"
            style={{ width: `${((currentQ + 1) / SETUP_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      {question && (
        <div className="w-full bg-surface-1 border border-faint rounded-lg p-6 animate-slide-in">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="gold">Q{question.number}</Badge>
            <span className="text-xs text-muted uppercase tracking-wider">{question.type}</span>
          </div>
          <p className="text-gray-100 font-medium text-base mb-1.5">{question.prompt}</p>
          <p className="text-muted text-xs mb-5">{question.hint}</p>

          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
              className="flex-1 bg-surface-0 border border-faint rounded px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-accent-gold-dim focus:ring-1 focus:ring-accent-gold/30"
              placeholder={question.defaultValue !== undefined ? String(question.defaultValue) : 'Type your answer…'}
            />
            <Button variant="primary" onClick={handleSubmit}>
              →
            </Button>
          </div>

          {error && (
            <p className="text-accent-red text-xs mt-2">{error}</p>
          )}

          {/* Previous answers summary */}
          {currentQ > 0 && (
            <div className="mt-4 pt-4 border-t border-faint">
              <p className="text-[10px] text-muted uppercase tracking-wider mb-2">So far:</p>
              <div className="flex flex-wrap gap-1.5">
                {SETUP_QUESTIONS.slice(0, currentQ).map((q) => {
                  const val = answers[q.id];
                  if (val === undefined || val === null) return null;
                  const display = Array.isArray(val)
                    ? val.join(', ')
                    : typeof val === 'boolean'
                    ? (val ? 'Yes' : 'No')
                    : String(val);
                  return (
                    <span key={q.id} className="text-[10px] text-gray-500">
                      Q{q.number}: <span className="text-gray-400">{display}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
