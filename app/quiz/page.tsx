"use client";
import React, { useState } from "react";

const questions = [
  {
    question: "Is there a safe level of exposure to secondhand smoke?",
    options: ["Yes", "No"],
    answer: 1,
    explanation:
      "There is no safe level of exposure to secondhand smoke. Even brief exposure can be harmful.",
  },
  {
    question: "Which chemical in secondhand smoke is a known carcinogen?",
    options: ["Ammonia", "Formaldehyde", "Salt"],
    answer: 1,
    explanation:
      "Formaldehyde is a known carcinogen found in secondhand smoke.",
  },
  {
    question:
      "What is a common health effect of long-term secondhand smoke exposure?",
    options: [
      "Improved lung function",
      "Increased risk of heart disease",
      "Better sleep",
    ],
    answer: 1,
    explanation:
      "Long-term exposure increases the risk of heart disease, lung cancer, and other health issues.",
  },
];

export default function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleOption = (idx: number) => {
    setSelected(idx);
  };

  const handleNext = () => {
    if (selected === questions[current].answer) {
      setScore(score + 1);
    }
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      setShowResult(true);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-orange-500 mb-8">
        Secondhand Smoke Quiz
      </h1>
      {!showResult ? (
        <div className="max-w-xl w-full bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold mb-4">
            {questions[current].question}
          </h2>
          <ul className="space-y-2">
            {questions[current].options.map((opt, idx) => (
              <li key={idx}>
                <button
                  className={`w-full text-left p-3 rounded border border-zinc-800 ${selected === idx ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-200"}`}
                  onClick={() => handleOption(idx)}
                  disabled={selected !== null}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
          {selected !== null && (
            <div className="mt-4 text-sm text-zinc-400">
              <p>{questions[current].explanation}</p>
              <button
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
                onClick={handleNext}
              >
                {current < questions.length - 1 ? "Next" : "See Results"}
              </button>
            </div>
          )}
          <a
            href="/"
            className="block mt-8 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded text-center"
          >
            Back to Home
          </a>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Your Score: {score} / {questions.length}
          </h2>
          <p className="text-zinc-400 mb-6">
            Thank you for taking the quiz! We hope it was informative.
          </p>
          <a
            href="/"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
          >
            Back to Home
          </a>
        </div>
      )}
    </div>
  );
}
