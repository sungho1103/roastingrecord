'use client';

import { useState, useEffect } from 'react';
import { RoastingRecord } from './types';
import RoastingRecorder from './components/RoastingRecorder';
import RoastingTable from './components/RoastingTable';
import RecordDetail from './components/RecordDetail';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [records, setRecords] = useState<RoastingRecord[]>([]);
  const [view, setView] = useState<'list' | 'new' | 'edit'>('list');
  const [editingRecord, setEditingRecord] = useState<RoastingRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<RoastingRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Supabase에서 데이터 로드
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('roasting_records')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        // Supabase 형식을 앱 형식으로 변환
        const formattedRecords: RoastingRecord[] = data.map((record: any) => ({
          id: record.id || '',
          date: record.date,
          beanName: record.bean_name,
          beanOrigin: record.bean_origin,
          greenWeight: parseFloat(record.green_weight),
          roastedWeight: record.roasted_weight ? parseFloat(record.roasted_weight) : undefined,
          yield: record.yield ? parseFloat(record.yield) : undefined,
          fan1: record.fan1 ? parseFloat(record.fan1) : undefined,
          heater: record.heater ? parseFloat(record.heater) : undefined,
          fan2: record.fan2 ? parseFloat(record.fan2) : undefined,
          temps: record.temps || {},
          maillardTime: record.maillard_time,
          developTime: record.develop_time,
          dtr: record.dtr ? parseFloat(record.dtr) : undefined,
          totalTime: record.total_time,
          notes: record.notes,
          cuppingNotes: record.cupping_notes,
          createdAt: record.created_at,
          updatedAt: record.updated_at,
        }));
        setRecords(formattedRecords);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (record: RoastingRecord) => {
    try {
      // 앱 형식을 Supabase 형식으로 변환
      const supabaseRecord = {
        id: record.id || `${Date.now()}`,
        date: record.date,
        bean_name: record.beanName,
        bean_origin: record.beanOrigin,
        green_weight: record.greenWeight,
        roasted_weight: record.roastedWeight,
        yield: record.yield,
        fan1: record.fan1,
        heater: record.heater,
        fan2: record.fan2,
        temps: record.temps,
        maillard_time: record.maillardTime,
        develop_time: record.developTime,
        dtr: record.dtr,
        total_time: record.totalTime,
        notes: record.notes,
        cupping_notes: record.cuppingNotes,
        created_at: record.createdAt,
        updated_at: new Date().toISOString(),
      };

      if (editingRecord) {
        // 수정
        // ID가 변경되었는지 확인
        if (editingRecord.id !== record.id) {
          // ID가 변경된 경우: 기존 레코드 삭제 후 새로 추가
          const { error: deleteError } = await supabase
            .from('roasting_records')
            .delete()
            .eq('id', editingRecord.id);

          if (deleteError) throw deleteError;

          const { error: insertError } = await supabase
            .from('roasting_records')
            .insert([supabaseRecord]);

          if (insertError) throw insertError;
        } else {
          // ID가 같은 경우: 일반 업데이트
          const { error } = await supabase
            .from('roasting_records')
            .update(supabaseRecord)
            .eq('id', record.id);

          if (error) throw error;
        }
      } else {
        // 새로 추가
        const { error } = await supabase
          .from('roasting_records')
          .insert([supabaseRecord]);

        if (error) throw error;
      }

      // 데이터 다시 로드
      await fetchRecords();
      setView('list');
      setEditingRecord(null);
    } catch (error) {
      console.error('Error saving record:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (record: RoastingRecord) => {
    setEditingRecord(record);
    setView('edit');
    setViewingRecord(null);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('roasting_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 데이터 다시 로드
      await fetchRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-6xl mb-4">☕</div>
              <p className="text-2xl font-bold text-gray-700">데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : view === 'list' ? (
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
        ) : (view === 'new' || view === 'edit') ? (
          <RoastingRecorder
            onSave={handleSave}
            onCancel={handleCancel}
            editRecord={editingRecord}
          />
        ) : null}
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
