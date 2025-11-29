'use client';

import { useState, useEffect } from 'react';
import { RoastingRecord } from './types';
import RoastingRecorder from './components/RoastingRecorder';
import RecordList from './components/RecordList';
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                TELA Coffee
              </h1>
              <p className="text-sm text-gray-600">Roasting Record System</p>
            </div>
            
            {view === 'list' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setView('new')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                >
                  + 새 로스팅 기록
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
            <div className="bg-white rounded-lg shadow p-4">
              <input
                type="text"
                placeholder="검색 (ID, 원두명, 원산지, 날짜)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* 통계 */}
            {records.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">전체 로스팅</p>
                  <p className="text-2xl font-bold text-amber-600">{records.length}회</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">총 투입량</p>
                  <p className="text-2xl font-bold text-green-600">
                    {records.reduce((sum, r) => sum + r.greenWeight, 0).toLocaleString()}g
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">평균 수율</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {records.filter(r => r.yield).length > 0
                      ? (
                          records.reduce((sum, r) => sum + (r.yield || 0), 0) /
                          records.filter(r => r.yield).length
                        ).toFixed(1)
                      : '-'}%
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600">평균 DTR</p>
                  <p className="text-2xl font-bold text-purple-600">
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

            {/* 기록 리스트 */}
            <RecordList
              records={filteredRecords}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
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
