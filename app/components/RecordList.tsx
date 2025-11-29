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
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">아직 로스팅 기록이 없습니다.</p>
        <p className="text-sm mt-2">새 로스팅 기록을 추가해보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedRecords.map((record) => (
        <div
          key={record.id}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 md:p-6"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* 기본 정보 */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start gap-3">
                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs font-mono rounded">
                  #{record.id}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {record.beanName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {record.date} {record.beanOrigin && `• ${record.beanOrigin}`}
                  </p>
                </div>
              </div>

              {/* 상세 정보 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">투입량:</span>
                  <span className="ml-1 font-semibold">{record.greenWeight}g</span>
                </div>
                
                {record.roastedWeight && (
                  <div>
                    <span className="text-gray-600">배출량:</span>
                    <span className="ml-1 font-semibold">{record.roastedWeight}g</span>
                  </div>
                )}
                
                {record.yield && (
                  <div>
                    <span className="text-gray-600">수율:</span>
                    <span className="ml-1 font-semibold text-green-600">{record.yield}%</span>
                  </div>
                )}
                
                {record.totalTime && (
                  <div>
                    <span className="text-gray-600">총 시간:</span>
                    <span className="ml-1 font-semibold">{record.totalTime}</span>
                  </div>
                )}
              </div>

              {/* 메일라드 & 디벨롭 */}
              {(record.maillardTime || record.developTime || record.dtr) && (
                <div className="flex flex-wrap gap-3 text-sm bg-amber-50 rounded p-2">
                  {record.maillardTime && (
                    <div>
                      <span className="text-gray-600">메일라드:</span>
                      <span className="ml-1 font-semibold text-amber-700">{record.maillardTime}</span>
                    </div>
                  )}
                  {record.developTime && (
                    <div>
                      <span className="text-gray-600">디벨롭:</span>
                      <span className="ml-1 font-semibold text-amber-700">{record.developTime}</span>
                    </div>
                  )}
                  {record.dtr && (
                    <div>
                      <span className="text-gray-600">DTR:</span>
                      <span className="ml-1 font-semibold text-amber-700">{record.dtr}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="flex md:flex-col gap-2">
              <button
                onClick={() => onView(record)}
                className="flex-1 md:flex-none px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-semibold"
              >
                상세
              </button>
              <button
                onClick={() => onEdit(record)}
                className="flex-1 md:flex-none px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 text-sm font-semibold"
              >
                수정
              </button>
              <button
                onClick={() => {
                  if (confirm('이 기록을 삭제하시겠습니까?')) {
                    onDelete(record.id);
                  }
                }}
                className="flex-1 md:flex-none px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-semibold"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
