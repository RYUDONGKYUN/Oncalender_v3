'use client';

import { useState, useEffect } from 'react';

interface Anniversary {
  id: string;
  title: string;
  category: string;
  originYear: number;
  originMonth: number;
  originDay: number;
  calendarType: string;
}

interface SummaryAnniversary {
  id: string;
  title: string;
  category: string;
  date: string;
  year: number;
  dday: number;
  age: number;
  originYear: number;
}

const CATEGORIES = ['생일', '결혼기념일', '기일', '시험일', '기타'];

const isValidDate = (month: number, day: number, year: number): boolean => {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
    daysInMonth[1] = 29;
  }

  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
};

export default function AnniversariesView() {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [summary, setSummary] = useState<SummaryAnniversary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '생일',
    month: '1',
    day: '1',
    year: new Date().getFullYear().toString(),
    calendarType: 'solar',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const userId = localStorage.getItem('userId') || 'demo-user';

      const annResponse = await fetch('/api/anniversaries', {
        headers: { 'x-user-id': userId },
      });
      if (annResponse.ok) {
        setAnniversaries(await annResponse.json());
      }

      const sumResponse = await fetch('/api/anniversaries/summary?days=30', {
        headers: { 'x-user-id': userId },
      });
      if (sumResponse.ok) {
        const data = await sumResponse.json();
        setSummary(data.upcoming || []);
      }
    } catch (err) {
      setError('데이터를 불러올 수 없습니다');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '생일',
      month: '1',
      day: '1',
      year: new Date().getFullYear().toString(),
      calendarType: 'solar',
    });
    setEditingId(null);
  };

  const handleAddAnniversary = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!formData.title.trim()) {
        setError('제목을 입력해주세요');
        return;
      }

      const month = parseInt(formData.month);
      const day = parseInt(formData.day);
      const year = parseInt(formData.year);

      if (!isValidDate(month, day, year)) {
        setError('올바른 날짜를 입력해주세요 (예: 2월 30일은 불가능)');
        return;
      }

      const userId = localStorage.getItem('userId') || 'demo-user';
      const response = await fetch(
        editingId ? `/api/anniversaries/${editingId}` : '/api/anniversaries',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'x-user-id': userId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title,
            category: formData.category,
            originYear: year,
            originMonth: month,
            originDay: day,
            calendarType: formData.calendarType,
          }),
        }
      );

      if (response.ok) {
        setSuccess(editingId ? '기념일이 수정되었습니다! ✏️' : '기념일이 추가되었습니다! 🎉');
        resetForm();
        setShowForm(false);
        setTimeout(() => {
          fetchData();
          setSuccess('');
        }, 1500);
      } else {
        setError(editingId ? '기념일 수정에 실패했습니다' : '기념일 추가에 실패했습니다');
      }
    } catch (err) {
      setError('오류가 발생했습니다');
      console.error(err);
    }
  };

  const startEditAnniversary = (ann: Anniversary) => {
    setFormData({
      title: ann.title,
      category: ann.category,
      month: ann.originMonth.toString(),
      day: ann.originDay.toString(),
      year: ann.originYear.toString(),
      calendarType: ann.calendarType,
    });
    setEditingId(ann.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDeleteAnniversary = async (id: string) => {
    try {
      const userId = localStorage.getItem('userId') || 'demo-user';
      const response = await fetch(`/api/anniversaries/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId },
      });

      if (response.ok) {
        setSuccess('기념일이 삭제되었습니다');
        setDeleteConfirm(null);
        setTimeout(() => {
          fetchData();
          setSuccess('');
        }, 1000);
      } else {
        setError('삭제에 실패했습니다');
      }
    } catch (err) {
      setError('삭제 중 오류가 발생했습니다');
      console.error(err);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '생일': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-100',
      '결혼기념일': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
      '기일': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100',
      '시험일': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100',
      '기타': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
    };
    return colors[category] || colors['기타'];
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      '생일': '🎂',
      '결혼기념일': '💍',
      '기일': '🕯️',
      '시험일': '📚',
      '기타': '⭐',
    };
    return labels[category] || '⭐';
  };

  return (
    <div className="p-4 pb-32 space-y-6 bg-white dark:bg-slate-900 min-h-screen">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 p-4 rounded-lg border border-red-300 dark:border-red-700">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 p-4 rounded-lg border border-green-300 dark:border-green-700">
          ✓ {success}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !anniversaries.length && !summary.length && (
        <div className="space-y-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Button */}
      {!showForm && !loading && (
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg shadow-lg transition-all active:scale-95"
        >
          ➕ 기념일 추가하기
        </button>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg border-2 border-blue-400 dark:border-blue-600">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {editingId ? '기념일 수정' : '새로운 기념일 추가'}
          </h3>
          <form onSubmit={handleAddAnniversary} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                제목 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="예: 엄마 생신"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                카테고리 *
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                      formData.category === cat
                        ? `${getCategoryColor(cat)} ring-2 ring-offset-2 dark:ring-offset-slate-800`
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {getCategoryLabel(cat)} {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  월 *
                </label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}월
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  일 *
                </label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  {[...Array(31)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}일
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  연도 *
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  min="1900"
                  max="2024"
                  className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Calendar Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                달력 유형 *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="calendarType"
                    value="solar"
                    checked={formData.calendarType === 'solar'}
                    onChange={(e) => setFormData({ ...formData, calendarType: e.target.value })}
                    className="mr-2 w-4 h-4"
                  />
                  <span className="text-slate-700 dark:text-slate-300">양력 📅</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="calendarType"
                    value="lunar"
                    checked={formData.calendarType === 'lunar'}
                    onChange={(e) => setFormData({ ...formData, calendarType: e.target.value })}
                    className="mr-2 w-4 h-4"
                  />
                  <span className="text-slate-700 dark:text-slate-300">음력 🌙</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors active:scale-95"
              >
                {editingId ? '수정' : '추가'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex-1 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-slate-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors active:scale-95"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">📅 다가오는 30일</h2>
        {summary.length > 0 ? (
          <div className="space-y-2">
            {summary.map((ann) => {
              const targetDate = new Date(ann.date);
              const isToday = new Date().toDateString() === targetDate.toDateString();
              const isSoon = ann.dday >= 0 && ann.dday <= 3;

              return (
                <div
                  key={`${ann.id}-${ann.year}`}
                  className={`p-4 rounded-lg border-l-4 backdrop-blur-sm transition-all ${
                    ann.category === '기일'
                      ? 'border-gray-400 bg-gray-50/50 dark:bg-gray-900/50'
                      : 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getCategoryLabel(ann.category)}</span>
                        <span
                          className={`font-semibold ${
                            ann.category === '기일' ? 'text-gray-700 dark:text-gray-300' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {ann.title}
                        </span>
                        {isToday && (
                          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                            오늘
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {ann.year}년 {targetDate.getMonth() + 1}월 {targetDate.getDate()}일 ({
                        ['일', '월', '화', '수', '목', '금', '토'][targetDate.getDay()]
                        }요일)
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {ann.age}세 / {ann.year - ann.originYear}주년
                      </div>
                    </div>
                    <div className="text-right">
                      {ann.dday === 0 ? (
                        <span className="text-2xl font-bold text-red-500 animate-pulse">D-DAY</span>
                      ) : ann.dday > 0 ? (
                        <span
                          className={`text-2xl font-bold ${
                            isSoon ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          D-{ann.dday}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-500 dark:text-slate-400">D+{Math.abs(ann.dday)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            다가오는 기념일이 없습니다
          </div>
        )}
      </div>

      {/* All Anniversaries Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">📋 모든 기념일</h2>
        {anniversaries.length > 0 ? (
          <div className="space-y-2">
            {anniversaries.map((ann) => (
              <div
                key={ann.id}
                className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getCategoryLabel(ann.category)}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{ann.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(ann.category)}`}>
                        {ann.category}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {ann.originYear}년 {ann.originMonth}월 {ann.originDay}일 ({ann.calendarType === 'solar' ? '양력' : '음력'})
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditAnniversary(ann)}
                      className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded transition-colors"
                      title="수정"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ id: ann.id, title: ann.title })}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            기념일을 추가해 보세요
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-2xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">기념일 삭제</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              "
              <span className="font-semibold text-slate-900 dark:text-white">{deleteConfirm.title}</span>"를 정말로 삭제하시겠습니까?
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-slate-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleDeleteAnniversary(deleteConfirm.id)}
                className="flex-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors active:scale-95"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
