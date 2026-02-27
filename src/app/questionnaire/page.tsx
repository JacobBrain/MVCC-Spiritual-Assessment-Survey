'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { questions } from '@/lib/questions';
import { teams } from '@/lib/teams';
import { QuestionResponse } from '@/types';

const ratingLabels = [
  { value: 1, label: 'Not like me' },
  { value: 2, label: 'Rarely like me' },
  { value: 3, label: 'Sometimes like me' },
  { value: 4, label: 'Regularly like me' },
];

export default function QuestionnairePage() {
  const router = useRouter();
  const [responses, setResponses] = useState<Map<number, number>>(new Map());
  const [teamInterests, setTeamInterests] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null);

  useEffect(() => {
    // Get user info from session storage
    const storedUser = sessionStorage.getItem('assessmentUser');
    if (!storedUser) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleRatingChange = (questionId: number, value: number) => {
    const newResponses = new Map(responses);
    newResponses.set(questionId, value);
    setResponses(newResponses);
  };

  const handleTeamToggle = (teamName: string) => {
    const newInterests = new Set(teamInterests);
    if (newInterests.has(teamName)) {
      newInterests.delete(teamName);
    } else {
      newInterests.add(teamName);
    }
    setTeamInterests(newInterests);
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    setError('');

    const responseArray: QuestionResponse[] = Array.from(responses.entries()).map(
      ([questionId, answerValue]) => ({ questionId, answerValue })
    );

    try {
      const res = await fetch('/api/submit-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          responses: responseArray,
          teamInterests: Array.from(teamInterests),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit assessment');
      }

      const data = await res.json();

      // Store results in session storage for results page
      sessionStorage.setItem('assessmentResults', JSON.stringify(data));

      router.push(`/results/${data.assessmentId}`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const answeredCount = responses.size;
  const totalQuestions = questions.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header with Progress */}
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="MVCC Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <h1 className="text-lg font-semibold text-gray-900">
                Spiritual Gifts Assessment
              </h1>
            </div>
            <span className="text-sm text-gray-600">
              {answeredCount} of {totalQuestions} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 pb-24">
        {/* Instructions */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-4 mb-8">
          <p className="text-gray-700">
            <strong>Instructions:</strong> For each statement, select the rating that best describes you.
            Answer honestly about where you are today, not where you want to be.
            All questions are optional - skip any you prefer not to answer.
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <p className="text-gray-900 font-medium mb-4">
                {index + 1}. {question.text}
              </p>

              <div className="flex flex-wrap gap-2">
                {ratingLabels.map(({ value, label }) => (
                  <label
                    key={value}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors
                      ${responses.get(question.id) === value
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-teal-300'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={value}
                      checked={responses.get(question.id) === value}
                      onChange={() => handleRatingChange(question.id, value)}
                      className="sr-only"
                    />
                    <span className="font-medium">{value}</span>
                    <span className="hidden sm:inline text-sm">- {label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Team Interests Section */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Ministry Team Interests
          </h2>
          <p className="text-gray-600 mb-6">
            Is there a ministry team you&apos;d love to partner with? Select all that interest you.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            {teams.map((team) => (
              <label
                key={team.id}
                className={`
                  flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors
                  ${teamInterests.has(team.name)
                    ? 'bg-teal-50 border-teal-300'
                    : 'bg-white border-gray-200 hover:border-teal-200'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={teamInterests.has(team.name)}
                  onChange={() => handleTeamToggle(team.name)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className="font-medium text-gray-900">{team.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </main>

      {/* Sticky Submit Button */}
      <div className="sticky bottom-0 bg-gray-50 py-4 border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4">
          {error && (
            <p className="text-red-600 mb-2 text-center text-sm">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 rounded-lg text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Calculating Your Results...
              </span>
            ) : (
              'See My Results'
            )}
          </button>

          <p className="text-sm text-gray-500 mt-2 text-center">
            You&apos;ve answered {answeredCount} of {totalQuestions} questions
          </p>
        </div>
      </div>
    </div>
  );
}
