import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { ChevronRight, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function LessonQuiz({ questions }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState({});
  const [completed, setCompleted] = useState(new Set());
  const [selected, setSelected] = useState({});

  if (!questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const isRevealed = revealed[currentIndex];
  const isMultipleChoice = currentQ.options && Array.isArray(currentQ.options);
  const selectedAnswers = selected[currentIndex] || new Set();

  const progress = Math.round((completed.size / questions.length) * 100);

  function handleSelectAnswer(option) {
    const newSelected = new Set(selectedAnswers);
    if (newSelected.has(option)) {
      newSelected.delete(option);
    } else {
      newSelected.add(option);
    }
    setSelected(prev => ({ ...prev, [currentIndex]: newSelected }));
  }

  function handleSubmit() {
    setRevealed(prev => ({ ...prev, [currentIndex]: true }));
    setCompleted(prev => new Set([...prev, currentIndex]));
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  return (
    <div className="rounded-2xl p-4 space-y-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Quiz</p>
          <span className="text-xs font-bold" style={{ color: C.midGreen }}>{progress}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: C.cream }}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progress}%`, background: C.midGreen }}
          />
        </div>
      </div>

      {/* Question counter */}
      <p className="text-[11px]" style={{ color: C.mutedText }}>
        Question {currentIndex + 1} of {questions.length}
      </p>

      {/* Question */}
      <div className="space-y-3">
        <p className="font-bold text-sm" style={{ color: C.darkGreen }}>
          {currentQ.question}
        </p>

        {isMultipleChoice ? (
          <>
            {/* Multiple choice options */}
            <div className="space-y-2">
              {currentQ.options.map((option, idx) => {
                const letter = String.fromCharCode(97 + idx); // a, b, c, d
                const isSelected = selectedAnswers.has(letter);
                const isCorrect = currentQ.correctAnswers?.includes(letter);
                const shouldHighlight = isRevealed && isCorrect;
                const shouldShowWrong = isRevealed && isSelected && !isCorrect;

                return (
                  <button
                    key={idx}
                    onClick={() => !isRevealed && handleSelectAnswer(letter)}
                    disabled={isRevealed}
                    className="w-full text-left p-3 rounded-lg text-sm font-bold transition-all"
                    style={{
                      background: shouldHighlight
                        ? "#E8F4EA"
                        : shouldShowWrong
                        ? "#FEF3EE"
                        : isSelected && !isRevealed
                        ? C.offWhite
                        : C.white,
                      border: shouldHighlight
                        ? `2px solid ${C.midGreen}`
                        : shouldShowWrong
                        ? "2px solid #B84C2A"
                        : `1px solid ${C.cream}`,
                      color: C.darkGreen,
                      cursor: isRevealed ? "default" : "pointer",
                      opacity: isRevealed && !isCorrect && !isSelected ? 0.6 : 1
                    }}
                  >
                    <span className="font-extrabold">{letter.toUpperCase()}.</span> {option}
                  </button>
                );
              })}
            </div>

            {/* Reveal/Submit button */}
            {!isRevealed ? (
              <button
                onClick={handleSubmit}
                disabled={selectedAnswers.size === 0}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: selectedAnswers.size > 0 ? C.darkGreen : C.cream,
                  color: selectedAnswers.size > 0 ? C.white : C.mutedText,
                  border: "none",
                  cursor: selectedAnswers.size > 0 ? "pointer" : "default",
                  opacity: selectedAnswers.size > 0 ? 1 : 0.5
                }}
              >
                Check Answer
              </button>
            ) : (
              <div className="rounded-xl p-3 text-center" style={{ background: "#E8F4EA", border: `1px solid ${C.midGreen}` }}>
                <p className="text-xs font-bold" style={{ color: C.midGreen }}>
                  {selectedAnswers.size > 0 && Array.from(selectedAnswers).every(a => currentQ.correctAnswers?.includes(a)) && currentQ.correctAnswers?.length === selectedAnswers.size
                    ? "✓ Correct!"
                    : "Review the correct answers above"}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Text answer reveal */}
            {isRevealed ? (
              <div className="rounded-xl p-3" style={{ background: "#E8F4EA", border: `1px solid ${C.midGreen}` }}>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} color={C.midGreen} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold mb-1" style={{ color: C.midGreen }}>Answer</p>
                    <p className="text-xs leading-relaxed" style={{ color: C.darkText }}>
                      {currentQ.answer}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: C.darkGreen,
                  color: C.white,
                  border: "none",
                  cursor: "pointer"
                }}
              >
                <Eye size={14} />
                Reveal Answer
              </button>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 py-2.5 rounded-lg font-bold text-xs transition-all"
          style={{
            background: currentIndex === 0 ? C.cream : C.offWhite,
            color: C.darkGreen,
            border: `1px solid ${C.cream}`,
            cursor: currentIndex === 0 ? "default" : "pointer",
            opacity: currentIndex === 0 ? 0.5 : 1
          }}
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
          className="flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          style={{
            background: currentIndex === questions.length - 1 ? C.cream : C.midGreen,
            color: currentIndex === questions.length - 1 ? C.mutedText : C.white,
            border: "none",
            cursor: currentIndex === questions.length - 1 ? "default" : "pointer",
            opacity: currentIndex === questions.length - 1 ? 0.5 : 1
          }}
        >
          Next <ChevronRight size={12} />
        </button>
      </div>

      {/* Completed message */}
      {completed.size === questions.length && (
        <div className="rounded-xl p-3 text-center" style={{ background: "#E8F4EA", border: `1px solid ${C.midGreen}` }}>
          <p className="text-xs font-bold" style={{ color: C.midGreen }}>✓ Quiz Complete!</p>
        </div>
      )}
    </div>
  );
}