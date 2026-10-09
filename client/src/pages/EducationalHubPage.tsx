import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const EducationalHubPage: React.FC = () => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const data = await api.getLessons();
      const list = data.lessons || [];
      setLessons(list);

      if (list.length > 0 && !activeLesson) {
        loadLessonDetail(list[0].slug);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const loadLessonDetail = async (slug: string) => {
    try {
      const data = await api.getLessonBySlug(slug);
      setActiveLesson(data.lesson);
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizScore(null);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleQuizSubmit = async () => {
    if (!activeLesson?.quiz) return;
    let correctCount = 0;
    activeLesson.quiz.forEach((q: any, idx: number) => {
      if (quizAnswers[idx] === q.answerIndex) {
        correctCount += 1;
      }
    });

    const scorePct = Math.round((correctCount / activeLesson.quiz.length) * 100);
    setQuizScore(scorePct);
    setQuizSubmitted(true);

    if (user && activeLesson?.id) {
      try {
        await api.saveLessonProgress(activeLesson.id, scorePct);
        // Refresh completed badges
        fetchLessons();
      } catch {
        // Ignore
      }
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-2">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Digital Literacy & Verification Academy</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Media Literacy & Verification Hub
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Master critical verification habits, reverse image search techniques, and source evaluation standards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lessons Sidebar Navigation */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Curriculum Modules
          </h2>

          <div className="space-y-2">
            {lessons.map((les) => {
              const isSelected = activeLesson?.slug === les.slug;
              return (
                <div
                  key={les.id}
                  onClick={() => loadLessonDetail(les.slug)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-teal-600 dark:text-teal-400">{les.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{les.reading_time_mins} min</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug">
                    {les.title}
                  </h3>

                  {les.isCompleted && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (2/3): Active Lesson View & Interactive Quiz */}
        <div className="lg:col-span-2 space-y-6">
          {activeLesson ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Lesson Header */}
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-teal-600 dark:text-teal-400">{activeLesson.category}</span>
                  <span>•</span>
                  <span>{activeLesson.reading_time_mins} min read</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {activeLesson.title}
                </h2>
              </div>

              {/* Lesson Content Markdown */}
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 whitespace-pre-wrap font-sans">
                {activeLesson.content_markdown}
              </div>

              {/* Interactive Knowledge Quiz Section */}
              {activeLesson.quiz && activeLesson.quiz.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-teal-600" />
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                        Interactive Knowledge Quiz ({activeLesson.quiz.length} Questions)
                      </h3>
                    </div>

                    {quizSubmitted && (
                      <button
                        type="button"
                        onClick={handleResetQuiz}
                        className="text-xs text-slate-500 hover:text-teal-600 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retake Quiz</span>
                      </button>
                    )}
                  </div>

                  {quizSubmitted && quizScore !== null && (
                    <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-xs font-semibold text-teal-900 dark:text-teal-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        <span>Quiz Completed! You scored {quizScore}%</span>
                      </div>
                      <span className="text-[11px] font-normal text-slate-500">Progress recorded in account</span>
                    </div>
                  )}

                  <div className="space-y-5">
                    {activeLesson.quiz.map((q: any, qIdx: number) => {
                      const userChoice = quizAnswers[qIdx];
                      const isCorrect = userChoice === q.answerIndex;

                      return (
                        <div
                          key={qIdx}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3"
                        >
                          <div className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                            {qIdx + 1}. {q.question}
                          </div>

                          <div className="space-y-2">
                            {q.options.map((opt: string, optIdx: number) => {
                              const isSelected = userChoice === optIdx;
                              let btnClass = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300';

                              if (quizSubmitted) {
                                if (optIdx === q.answerIndex) {
                                  btnClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-semibold';
                                } else if (isSelected && !isCorrect) {
                                  btnClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200';
                                }
                              } else if (isSelected) {
                                btnClass = 'border-teal-600 bg-teal-50 dark:bg-teal-950 text-teal-900 dark:text-teal-100 ring-1 ring-teal-600';
                              }

                              return (
                                <button
                                  type="button"
                                  key={optIdx}
                                  onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                                  className={`w-full p-2.5 text-left text-xs rounded-xl border transition-colors flex items-center justify-between ${btnClass}`}
                                >
                                  <span>{opt}</span>
                                  {quizSubmitted && optIdx === q.answerIndex && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && q.explanation && (
                            <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200/60 dark:border-slate-700/60">
                              <strong>Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!quizSubmitted && (
                    <button
                      type="button"
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length < activeLesson.quiz.length}
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                    >
                      Submit Quiz Answers
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">Loading module...</div>
          )}
        </div>
      </div>
    </div>
  );
};
