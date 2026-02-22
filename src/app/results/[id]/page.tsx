'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { GiftCategory, GiftScores, Recommendation } from '@/types';
import { giftDescriptions, giftDisplayNames } from '@/lib/questions';

interface AssessmentResults {
  assessmentId: string;
  giftScores: GiftScores;
  topGifts: Array<{ gift: GiftCategory; score: number }>;
  recommendations: Recommendation[];
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get results from session storage first
    const storedResults = sessionStorage.getItem('assessmentResults');
    if (storedResults) {
      const parsed = JSON.parse(storedResults);
      if (parsed.assessmentId === params.id) {
        setResults(parsed);
        setLoading(false);
        return;
      }
    }

    // If not in session storage, fetch from API
    fetch(`/api/results/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Results not found');
        return res.json();
      })
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch(() => {
        router.push('/');
      });
  }, [params.id, router]);

  const getScoreColor = (score: number) => {
    if (score >= 16) return 'text-green-600';
    if (score >= 12) return 'text-blue-600';
    if (score >= 8) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 16) return 'bg-green-100';
    if (score >= 12) return 'bg-blue-100';
    if (score >= 8) return 'bg-yellow-100';
    return 'bg-gray-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 16) return 'Strong';
    if (score >= 12) return 'Moderate';
    if (score >= 8) return 'Developing';
    return 'Not Primary';
  };

  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case 'perfect':
        return { label: 'Perfect Match', color: 'bg-green-100 text-green-800' };
      case 'gift-based':
        return { label: 'Based on Your Gifts', color: 'bg-teal-100 text-teal-800' };
      case 'user-interest':
        return { label: "You're Interested In", color: 'bg-blue-100 text-blue-800' };
      default:
        return { label: '', color: '' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const rankedGifts = Object.entries(results.giftScores)
    .map(([gift, score]) => ({ gift: gift as GiftCategory, score }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="MVCC Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Spiritual Gifts Assessment</h1>
                <p className="text-xs text-gray-500">Mountain View Community Church</p>
              </div>
            </div>
            <Link
              href="/"
              className="text-teal-600 hover:text-teal-700 font-medium text-sm"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Your Spiritual Gifts
          </h2>
          <p className="text-xl text-gray-600">
            God has uniquely gifted you to serve His kingdom. Here&apos;s what we discovered!
          </p>
        </div>

        {/* Top 3 Gifts */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Your Top Gifts
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {results.topGifts.slice(0, 3).map((item, index) => (
              <div
                key={item.gift}
                className={`
                  bg-white rounded-2xl shadow-lg p-6 text-center
                  ${index === 0 ? 'md:scale-105 ring-2 ring-teal-500' : ''}
                `}
              >
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                  ${index === 0 ? 'bg-teal-600 text-white' : 'bg-teal-100 text-teal-600'}
                `}>
                  <span className="text-2xl font-bold">#{index + 1}</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {giftDisplayNames[item.gift]}
                </h4>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${getScoreBgColor(item.score)} ${getScoreColor(item.score)}`}>
                  {item.score}/20 - {getScoreLabel(item.score)}
                </div>
                <p className="text-gray-600 text-sm">
                  {giftDescriptions[item.gift]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* All Gift Scores */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            All Gift Scores
          </h3>
          <div className="space-y-4">
            {rankedGifts.map((item) => (
              <div key={item.gift} className="flex items-center gap-4">
                <div className="w-32 font-medium text-gray-700">
                  {giftDisplayNames[item.gift]}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-100 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${
                        item.score >= 16 ? 'bg-green-500' :
                        item.score >= 12 ? 'bg-blue-500' :
                        item.score >= 8 ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${(item.score / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className={`w-16 text-right font-semibold ${getScoreColor(item.score)}`}>
                  {item.score}/20
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span>Strong (16-20)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span>Moderate (12-15)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500"></div>
                <span>Developing (8-11)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-400"></div>
                <span>Not Primary (4-7)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Teams */}
        {results.recommendations.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Recommended Ministry Teams
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {results.recommendations.map((rec, index) => {
                const matchInfo = getMatchTypeLabel(rec.matchType);
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {rec.team.name}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${matchInfo.color}`}>
                        {matchInfo.label}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {rec.team.description}
                    </p>
                    {rec.giftMatch && (
                      <p className="text-sm text-teal-600 mb-3">
                        Matches your <strong>{giftDisplayNames[rec.giftMatch]}</strong> gift
                      </p>
                    )}
                    {rec.team.link && (
                      <a
                        href={rec.team.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
                      >
                        Learn More
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-teal-50 rounded-2xl p-8 text-center mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            What&apos;s Next?
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            We&apos;d love to help you connect with a ministry team that fits your gifts.
            Someone from our team will reach out to you soon to discuss opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://mvccfrederick.com/serve"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Explore Serving Opportunities
            </a>
            <button
              onClick={() => {
                sessionStorage.removeItem('assessmentUser');
                sessionStorage.removeItem('assessmentResults');
                router.push('/');
              }}
              className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-8 rounded-lg border border-gray-300 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Mountain View Community Church
          </p>
        </div>
      </footer>
    </div>
  );
}
