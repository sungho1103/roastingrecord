'use client';

import { RoastingRecord } from '../types';

interface RecordListProps {
  records: RoastingRecord[];
  onEdit: (record: RoastingRecord) => void;
  onDelete: (id: string) => void;
  onView: (record: RoastingRecord) => void;
}

export default function RecordList({ records, onEdit, onDelete, onView }: RecordListProps) {
  const sortedRecords = [...records].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (records.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border-2 border-amber-200">
        <div className="text-6xl mb-4">☕</div>
        <p className="text-2xl font-bold text-gray-700 mb-2">아직 로스팅 기록이 없습니다</p>
        <p className="text-lg text-gray-500">새 로스팅 기록을 추가해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedRecords.map((record) => (
        <div
          key={record.id}
          className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-[1.01] p-6 border-2 border-amber-200 hover:border-amber-400"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* 기본 정보 */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start gap-3">
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-black rounded-xl shadow-md">
                  #{record.id}
                </span>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    ☕ {record.beanName}
                  </h3>
                  <p className="text-base text-gray-600 font-semibold mt-1">
                    📅 {record.date} {record.beanOrigin && `• 🌍 ${record.beanOrigin}`}
                  </p>
                </div>
              </div>

              {/* 상세 정보 그리드 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-100 rounded-xl p-3 border-2 border-blue-300">
                  <span className="text-xs text-blue-700 font-semibold block">투입량</span>
                  <span className="text-xl font-black text-blue-900">{record.greenWeight}g</span>
                </div>
                
                {record.roastedWeight && (
                  <div className="bg-green-100 rounded-xl p-3 border-2 border-green-300">
                    <span className="text-xs text-green-700 font-semibold block">배출량</span>
                    <span className="text-xl font-black text-green-900">{record.roastedWeight}g</span>
                  </div>
                )}
                
                {record.yield && (
                  <div className="bg-emerald-100 rounded-xl p-3 border-2 border-emerald-300">
                    <span className="text-xs text-emerald-700 font-semibold block">수율</span>
                    <span className="text-xl font-black text-emerald-900">{record.yield}%</span>
                  </div>
                )}
                
                {record.totalTime && (
                  <div className="bg-purple-100 rounded-xl p-3 border-2 border-purple-300">
                    <span className="text-xs text-purple-700 font-semibold block">총 시간</span>
                    <span className="text-xl font-black text-purple-900">{record.totalTime}</span>
                  </div>
                )}
              </div>

              {/* 구간 정보 */}
              {(record.maillardTime || record.developTime || record.dtr) && (
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-4 border-2 border-amber-300">
                  <div className="flex flex-wrap gap-4 text-sm">
                    {record.maillardTime && (
                      <div className="flex items-center gap-2">
                        <span className="text-amber-700 font-semibold">⚡ 메일라드:</span>
                        <span className="font-black text-amber-900 text-base">{record.maillardTime}</span>
                      </div>
                    )}
                    {record.developTime && (
                      <div className="flex items-center gap-2">
                        <span className="text-orange-700 font-semibold">🔥 디벨롭:</span>
                        <span className="font-black text-orange-900 text-base">{record.developTime}</span>
                      </div>
                    )}
                    {record.dtr && (
                      <div className="flex items-center gap-2">
                        <span className="text-red-700 font-semibold">📊 DTR:</span>
                        <span className="font-black text-red-900 text-base">{record.dtr}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="flex md:flex-col gap-2">
              <button
                onClick={() => onView(record)}
                className="flex-1 md:flex-none px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-bold shadow-lg transition-all transform hover:scale-105"
              >
                👁️ 상세
              </button>
              <button
                onClick={() => onEdit(record)}
                className="flex-1 md:flex-none px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 font-bold shadow-lg transition-all transform hover:scale-105"
              >
                ✏️ 수정
              </button>
              <button
                onClick={() => {
                  if (confirm('이 기록을 삭제하시겠습니까?')) {
                    onDelete(record.id);
                  }
                }}
                className="flex-1 md:flex-none px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-bold shadow-lg transition-all transform hover:scale-105"
              >
                🗑️ 삭제
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
