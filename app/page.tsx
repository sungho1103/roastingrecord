'use client';

import { useState, useEffect } from 'react';
import { RoastingRecord } from './types';
import RoastingRecorder from './components/RoastingRecorder';
import RoastingTable from './components/RoastingTable';
import RecordDetail from './components/RecordDetail';

export default function Home() {
  const [records, setRecords] = useState<RoastingRecord[]>([]);
  const [view, setView] = useState<'list' | 'new' | 'edit'>('list');
  const [editingRecord, setEditingRecord] = useState<RoastingRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<RoastingRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedRecords = localStorage.getItem('roasting-records');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
  }, []);

  // 데이터 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (records.length > 0) {
      localStorage.setItem('roasting-records', JSON.stringify(records));
    }
  }, [records]);

  const handleSave = (record: RoastingRecord) => {
    if (editingRecord) {
      // 수정
      setRecords(prev => prev.map(r => r.id === record.id ? record : r));
    } else {
      // 새로 추가
      setRecords(prev => [...prev, record]);
    }
    setView('list');
    setEditingRecord(null);
  };

  const handleEdit = (record: RoastingRecord) => {
    setEditingRecord(record);
    setView('edit');
    setViewingRecord(null);
  };

  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleCancel = () => {
    setView('list');
    setEditingRecord(null);
  };

  const handleView = (record: RoastingRecord) => {
    setViewingRecord(record);
  };

  const filteredRecords = records.filter(record => {
    const search = searchTerm.toLowerCase();
    return (
      record.id.includes(search) ||
      record.beanName.toLowerCase().includes(search) ||
      record.beanOrigin?.toLowerCase().includes(search) ||
      record.date.includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-amber-600 to-orange-700 shadow-2xl sticky top-0 z-40 border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg flex items-center gap-3">
                ☕ TELA Coffee
              </h1>
              <p className="text-base text-amber-100 font-semibold mt-1">🔥 Roasting Record System</p>
            </div>
            
            {view === 'list' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setView('new')}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-black text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-xl transform hover:scale-105 border-2 border-white"
                >
                  ➕ 새 로스팅 기록
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {view === 'list' && (
          <div className="space-y-6">
            {/* 검색 바 */}
            <div className="bg-white rounded-2xl shadow-xl p-5 border-2 border-amber-300">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 검색 (ID, 원두명, 원산지, 날짜)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-5 py-4 pl-12 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg font-semibold"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">
                  🔍
                </span>
              </div>
            </div>

            {/* 통계 */}
            {records.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl p-6 border-2 border-blue-400 transform hover:scale-105 transition-all">
                  <p className="text-sm text-blue-100 font-semibold mb-1">전체 로스팅</p>
                  <p className="text-4xl font-black text-white drop-shadow-lg">{records.length}회</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-xl p-6 border-2 border-green-400 transform hover:scale-105 transition-all">
                  <p className="text-sm text-green-100 font-semibold mb-1">총 투입량</p>
                  <p className="text-4xl font-black text-white drop-shadow-lg">
                    {(records.reduce((sum, r) => sum + r.greenWeight, 0) / 1000).toFixed(1)}kg
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl p-6 border-2 border-amber-400 transform hover:scale-105 transition-all">
                  <p className="text-sm text-amber-100 font-semibold mb-1">평균 수율</p>
                  <p className="text-4xl font-black text-white drop-shadow-lg">
                    {records.filter(r => r.yield).length > 0
                      ? (
                          records.reduce((sum, r) => sum + (r.yield || 0), 0) /
                          records.filter(r => r.yield).length
                        ).toFixed(1)
                      : '-'}%
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-xl p-6 border-2 border-purple-400 transform hover:scale-105 transition-all">
                  <p className="text-sm text-purple-100 font-semibold mb-1">평균 DTR</p>
                  <p className="text-4xl font-black text-white drop-shadow-lg">
                    {records.filter(r => r.dtr).length > 0
                      ? (
                          records.reduce((sum, r) => sum + (r.dtr || 0), 0) /
                          records.filter(r => r.dtr).length
                        ).toFixed(1)
                      : '-'}%
                  </p>
                </div>
              </div>
            )}

            {/* 로스팅 기록 테이블 */}
            <RoastingTable
              records={filteredRecords}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}

        {(view === 'new' || view === 'edit') && (
          <RoastingRecorder
            onSave={handleSave}
            onCancel={handleCancel}
            editRecord={editingRecord}
          />
        )}
      </main>

      {/* 상세 보기 모달 */}
      {viewingRecord && (
        <RecordDetail
          record={viewingRecord}
          onClose={() => setViewingRecord(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
