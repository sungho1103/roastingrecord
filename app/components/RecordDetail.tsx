'use client';

import { RoastingRecord } from '../types';

interface RecordDetailProps {
  record: RoastingRecord;
  onClose: () => void;
  onEdit: (record: RoastingRecord) => void;
}

export default function RecordDetail({ record, onClose, onEdit }: RecordDetailProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-sm font-mono rounded">
                #{record.id}
              </span>
              <h2 className="text-2xl font-bold text-gray-800">{record.beanName}</h2>
            </div>
            <p className="text-gray-600">
              {record.date} {record.beanOrigin && `• ${record.beanOrigin}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">기본 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">투입량</p>
                <p className="font-semibold text-lg">{record.greenWeight}g</p>
              </div>
              {record.roastedWeight && (
                <div>
                  <p className="text-gray-600">배출량</p>
                  <p className="font-semibold text-lg">{record.roastedWeight}g</p>
                </div>
              )}
              {record.yield && (
                <div>
                  <p className="text-gray-600">수율</p>
                  <p className="font-semibold text-lg text-green-600">{record.yield}%</p>
                </div>
              )}
              {record.totalTime && (
                <div>
                  <p className="text-gray-600">총 로스팅 시간</p>
                  <p className="font-semibold text-lg">{record.totalTime}</p>
                </div>
              )}
            </div>
          </div>

          {/* 온도별 시간 기록 */}
          <div className="bg-amber-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">온도 프로파일</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 text-sm">
              {Object.entries(record.temps)
                .sort((a, b) => {
                  if (a[0] === 'end') return 1;
                  if (b[0] === 'end') return -1;
                  return Number(a[0]) - Number(b[0]);
                })
                .map(([temp, time]) => (
                  <div key={temp} className="bg-white rounded p-2 text-center">
                    <p className="font-semibold text-amber-700">
                      {temp === 'end' ? '배출' : `${temp}°C`}
                    </p>
                    <p className="text-gray-600 font-mono">{time}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* 자동 계산 구간 */}
          {(record.maillardTime || record.developTime || record.dtr) && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">구간 분석</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {record.maillardTime && (
                  <div className="bg-white rounded p-3">
                    <p className="text-sm text-gray-600">메일라드 반응</p>
                    <p className="text-sm text-gray-500 mb-1">150°C - 180°C</p>
                    <p className="text-xl font-bold text-blue-600">{record.maillardTime}</p>
                  </div>
                )}
                {record.developTime && (
                  <div className="bg-white rounded p-3">
                    <p className="text-sm text-gray-600">디벨롭 타임</p>
                    <p className="text-sm text-gray-500 mb-1">183°C - 배출</p>
                    <p className="text-xl font-bold text-blue-600">{record.developTime}</p>
                  </div>
                )}
                {record.dtr && (
                  <div className="bg-white rounded p-3">
                    <p className="text-sm text-gray-600">DTR</p>
                    <p className="text-sm text-gray-500 mb-1">Development Time Ratio</p>
                    <p className="text-xl font-bold text-blue-600">{record.dtr}%</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 메모 */}
          {(record.notes || record.cuppingNotes) && (
            <div className="space-y-4">
              {record.notes && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">로스팅 메모</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                    {record.notes}
                  </div>
                </div>
              )}
              {record.cuppingNotes && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">컵핑 노트</h3>
                  <div className="bg-amber-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                    {record.cuppingNotes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => onEdit(record)}
              className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700"
            >
              수정
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
