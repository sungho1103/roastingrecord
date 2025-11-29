'use client';

import { RoastingRecord } from '../types';

interface RecordDetailProps {
  record: RoastingRecord;
  onClose: () => void;
  onEdit: (record: RoastingRecord) => void;
}

export default function RecordDetail({ record, onClose, onEdit }: RecordDetailProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-amber-300">
        {/* 헤더 */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-600 border-b-4 border-amber-400 p-6 flex justify-between items-center rounded-t-3xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-block px-4 py-2 bg-white text-amber-800 text-base font-black rounded-xl shadow-md">
                #{record.id}
              </span>
              <h2 className="text-3xl font-black text-white drop-shadow-lg">☕ {record.beanName}</h2>
            </div>
            <p className="text-white font-semibold text-lg">
              📅 {record.date} {record.beanOrigin && `• 🌍 ${record.beanOrigin}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 bg-black bg-opacity-20 rounded-full p-2 hover:bg-opacity-40 transition-all"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-300">
            <h3 className="font-black text-blue-900 mb-4 text-2xl flex items-center gap-2">
              📊 기본 정보
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-md">
                <p className="text-blue-700 font-semibold text-sm mb-1">투입량</p>
                <p className="font-black text-3xl text-blue-900">{record.greenWeight}g</p>
              </div>
              {record.roastedWeight && (
                <div className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-md">
                  <p className="text-green-700 font-semibold text-sm mb-1">배출량</p>
                  <p className="font-black text-3xl text-green-900">{record.roastedWeight}g</p>
                </div>
              )}
              {record.yield && (
                <div className="bg-white rounded-xl p-4 border-2 border-emerald-200 shadow-md">
                  <p className="text-emerald-700 font-semibold text-sm mb-1">수율</p>
                  <p className="font-black text-3xl text-emerald-900">{record.yield}%</p>
                </div>
              )}
              {record.totalTime && (
                <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-md">
                  <p className="text-purple-700 font-semibold text-sm mb-1">총 로스팅 시간</p>
                  <p className="font-black text-3xl text-purple-900">{record.totalTime}</p>
                </div>
              )}
            </div>
          </div>

          {/* 초기 세팅값 */}
          {(record.fan1 || record.heater || record.fan2) && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-300">
              <h3 className="font-black text-gray-900 mb-4 text-2xl flex items-center gap-2">
                ⚙️ 초기 세팅값
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {record.fan1 && (
                  <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-md">
                    <p className="text-blue-700 font-semibold text-sm mb-1">FAN1</p>
                    <p className="font-black text-3xl text-blue-900">{record.fan1}</p>
                  </div>
                )}
                {record.heater && (
                  <div className="bg-white rounded-xl p-4 border-2 border-red-200 shadow-md">
                    <p className="text-red-700 font-semibold text-sm mb-1">Heater</p>
                    <p className="font-black text-3xl text-red-900">{record.heater}</p>
                  </div>
                )}
                {record.fan2 && (
                  <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-md">
                    <p className="text-purple-700 font-semibold text-sm mb-1">FAN2</p>
                    <p className="font-black text-3xl text-purple-900">{record.fan2}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 온도별 시간 기록 */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 border-2 border-amber-300">
            <h3 className="font-black text-amber-900 mb-4 text-2xl flex items-center gap-2">
              🌡️ 온도 프로파일
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {Object.entries(record.temps)
                .sort((a, b) => {
                  if (a[0] === 'end') return 1;
                  if (b[0] === 'end') return -1;
                  return Number(a[0]) - Number(b[0]);
                })
                .map(([temp, time]) => (
                  <div key={temp} className="bg-white rounded-xl p-3 text-center border-2 border-amber-300 shadow-md hover:shadow-lg transition-shadow">
                    <p className="font-black text-amber-700 text-lg">
                      {temp === 'end' ? '🔥 배출' : `${temp}°C`}
                    </p>
                    <p className="text-gray-800 font-mono font-bold text-base mt-1">{time}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* 자동 계산 구간 */}
          {(record.maillardTime || record.developTime || record.dtr) && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 border-2 border-purple-300">
              <h3 className="font-black text-purple-900 mb-4 text-2xl flex items-center gap-2">
                ⚡ 구간 분석
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {record.maillardTime && (
                  <div className="bg-white rounded-xl p-5 border-2 border-amber-300 shadow-md">
                    <p className="text-sm text-amber-700 font-semibold">⚡ 메일라드 반응</p>
                    <p className="text-xs text-amber-600 mb-2">150°C - 180°C</p>
                    <p className="text-4xl font-black text-amber-900">{record.maillardTime}</p>
                  </div>
                )}
                {record.developTime && (
                  <div className="bg-white rounded-xl p-5 border-2 border-orange-300 shadow-md">
                    <p className="text-sm text-orange-700 font-semibold">🔥 디벨롭 타임</p>
                    <p className="text-xs text-orange-600 mb-2">183°C - 배출</p>
                    <p className="text-4xl font-black text-orange-900">{record.developTime}</p>
                  </div>
                )}
                {record.dtr && (
                  <div className="bg-white rounded-xl p-5 border-2 border-red-300 shadow-md">
                    <p className="text-sm text-red-700 font-semibold">📊 DTR</p>
                    <p className="text-xs text-red-600 mb-2">Development Time Ratio</p>
                    <p className="text-4xl font-black text-red-900">{record.dtr}%</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 메모 */}
          {(record.notes || record.cuppingNotes) && (
            <div className="space-y-4">
              {record.notes && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border-2 border-gray-300">
                  <h3 className="font-black text-gray-800 mb-3 text-xl flex items-center gap-2">
                    📝 로스팅 메모
                  </h3>
                  <div className="bg-white rounded-xl p-4 text-gray-700 whitespace-pre-wrap border-2 border-gray-200">
                    {record.notes}
                  </div>
                </div>
              )}
              {record.cuppingNotes && (
                <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl p-5 border-2 border-amber-300">
                  <h3 className="font-black text-amber-800 mb-3 text-xl flex items-center gap-2">
                    ☕ 컵핑 노트
                  </h3>
                  <div className="bg-white rounded-xl p-4 text-gray-700 whitespace-pre-wrap border-2 border-amber-200">
                    {record.cuppingNotes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <button
              onClick={() => onEdit(record)}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-black text-lg hover:from-amber-700 hover:to-orange-700 shadow-lg transition-all transform hover:scale-[1.02]"
            >
              ✏️ 수정
            </button>
            <button
              onClick={onClose}
              className="px-8 py-4 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-black text-lg hover:from-gray-500 hover:to-gray-600 shadow-lg transition-all"
            >
              ❌ 닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
