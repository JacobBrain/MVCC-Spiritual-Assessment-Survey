'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AssessmentDetail, GiftCategory } from '@/types';
import { giftDisplayNames } from '@/lib/questions';

export default function AdminAssessmentDetail() {
  const params = useParams();
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/assessments/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setAssessment(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Assessment not found</p>
          <Link href="/admin" className="text-teal-600 hover:text-teal-700 font-medium">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const giftScores = [
    { gift: 'administration', score: assessment.administration_score },
    { gift: 'evangelism', score: assessment.evangelism_score },
    { gift: 'exhortation', score: assessment.exhortation_score },
    { gift: 'giving', score: assessment.giving_score },
    { gift: 'hospitality', score: assessment.hospitality_score },
    { gift: 'leadership', score: assessment.leadership_score },
    { gift: 'mercy', score: assessment.mercy_score },
    { gift: 'pastoring', score: assessment.pastoring_score },
    { gift: 'serving', score: assessment.serving_score },
    { gift: 'teaching', score: assessment.teaching_score },
    { gift: 'wisdom', score: assessment.wisdom_score },
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link
            href="/admin"
            className="text-teal-600 hover:text-teal-700 font-medium mb-2 inline-block"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {assessment.first_name} {assessment.last_name}
          </h1>
          <p className="text-gray-600">{assessment.email}</p>
          <p className="text-sm text-gray-500">
            Submitted: {new Date(assessment.created_at).toLocaleString()}
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Gift Scores */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Gift Scores</h2>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[assessment.top_gift_1, assessment.top_gift_2, assessment.top_gift_3]
              .filter(Boolean)
              .map((gift, i) => {
                const score = giftScores.find(g => g.gift === gift)?.score || 0;
                return (
                  <div key={i} className="bg-teal-50 rounded-lg p-4 text-center">
                    <div className="text-sm text-teal-600 font-medium">Top Gift #{i + 1}</div>
                    <div className="text-xl font-bold text-gray-900">
                      {giftDisplayNames[gift as GiftCategory]}
                    </div>
                    <div className="text-lg text-teal-600">{score}/20</div>
                  </div>
                );
              })}
          </div>

          <div className="space-y-3">
            {giftScores.map(({ gift, score }) => (
              <div key={gift} className="flex items-center gap-4">
                <div className="w-28 font-medium text-gray-700">
                  {giftDisplayNames[gift as GiftCategory]}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        score >= 16 ? 'bg-green-500' :
                        score >= 12 ? 'bg-blue-500' :
                        score >= 8 ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${(score / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 text-right font-medium text-gray-700">
                  {score}/20
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Interests */}
        {assessment.team_interests && assessment.team_interests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Interests</h2>
            <div className="flex flex-wrap gap-2">
              {assessment.team_interests.map((team, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {team}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {assessment.recommendations && assessment.recommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>
            <div className="space-y-3">
              {assessment.recommendations.map((rec, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">{rec.team_name}</span>
                    {rec.gift_match && (
                      <span className="ml-2 text-sm text-gray-500">
                        (matches {giftDisplayNames[rec.gift_match as GiftCategory]})
                      </span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec.is_gift_based ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {rec.is_gift_based ? 'Gift-based' : 'User Interest'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Responses */}
        {assessment.responses && assessment.responses.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              All Responses ({assessment.responses.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Answer</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assessment.responses.map((response, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-sm text-gray-500">{response.question_id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{response.question_text}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {giftDisplayNames[response.gift_category as GiftCategory]}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                          response.answer_value >= 4 ? 'bg-green-100 text-green-800' :
                          response.answer_value >= 3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {response.answer_value}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
