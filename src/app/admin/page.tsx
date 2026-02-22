'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Assessment, GiftCategory } from '@/types';
import { giftDisplayNames } from '@/lib/questions';

const allGifts: GiftCategory[] = [
  'administration', 'evangelism', 'exhortation', 'giving', 'hospitality',
  'leadership', 'mercy', 'pastoring', 'serving', 'teaching', 'wisdom'
];

export default function AdminDashboard() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [topGiftFilter, setTopGiftFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAssessments = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (topGiftFilter) params.set('topGift', topGiftFilter);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    try {
      const res = await fetch(`/api/admin/assessments?${params.toString()}`);
      const data = await res.json();
      setAssessments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
      setAssessments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const stats = useMemo(() => {
    if (assessments.length === 0) return null;

    const giftCounts: Record<string, number> = {};
    assessments.forEach((a) => {
      [a.top_gift_1, a.top_gift_2, a.top_gift_3].filter(Boolean).forEach((gift) => {
        giftCounts[gift!] = (giftCounts[gift!] || 0) + 1;
      });
    });

    const topGifts = Object.entries(giftCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([gift, count]) => ({ gift: gift as GiftCategory, count }));

    return { total: assessments.length, topGifts };
  }, [assessments]);

  const handleFilter = () => {
    fetchAssessments();
  };

  const handleClearFilters = () => {
    setSearch('');
    setTopGiftFilter('');
    setStartDate('');
    setEndDate('');
    setTimeout(fetchAssessments, 0);
  };

  const handleExport = () => {
    window.location.href = '/api/admin/export';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Spiritual Gifts Assessment</p>
            </div>
            <Link
              href="/"
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              &larr; Back to Assessment
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            {stats.topGifts.map(({ gift, count }, i) => (
              <div key={gift} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <p className="text-sm text-gray-500">#{i + 1} Most Common</p>
                <p className="text-lg font-bold text-gray-900">{giftDisplayNames[gift]}</p>
                <p className="text-sm text-teal-600">{count} mentions</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Top Gift
              </label>
              <select
                value={topGiftFilter}
                onChange={(e) => setTopGiftFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              >
                <option value="">All Gifts</option>
                {allGifts.map((gift) => (
                  <option key={gift} value={gift}>
                    {giftDisplayNames[gift]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleFilter}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Filter
              </button>
              <button
                onClick={handleClearFilters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Stats & Export */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${assessments.length} assessments found`}
          </p>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Assessments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
            </div>
          ) : assessments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No assessments found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Top Gifts
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assessments.map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {assessment.first_name} {assessment.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {assessment.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {formatDate(assessment.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          {[assessment.top_gift_1, assessment.top_gift_2, assessment.top_gift_3]
                            .filter(Boolean)
                            .map((gift, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                              >
                                {giftDisplayNames[gift as GiftCategory]}
                              </span>
                            ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/admin/${assessment.id}`}
                          className="text-teal-600 hover:text-teal-700 font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
