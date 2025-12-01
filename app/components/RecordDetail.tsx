"use client"

import type { RoastingRecord } from "../types"

interface RecordDetailProps {
  record: RoastingRecord
  onClose: () => void
  onEdit: (record: RoastingRecord) => void
}

export default function RecordDetail({ record, onClose, onEdit }: RecordDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-4 border-purple-200">
        {/* 헤더 */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 px-8 py-6 border-b-4 border-purple-400 rounded-t-3xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="text-sm font-bold text-purple-900 mb-2">#{record.id}</div>
              <h2 className="text-3xl font-black text-purple-900 mb-2">☕ {record.beanName}</h2>
              <div className="text-lg font-semibold text-purple-800">
                📅 {record.date} {record.beanOrigin && `• 🌍 ${record.beanOrigin}`}
              </div>
            </div>
            <button onClick={onClose} className="text-purple-900 hover:bg-purple-200 rounded-xl p-3 transition-all">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* 기본 정보 */}
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-6 rounded-2xl border-3 border-blue-300 shadow-lg">
            <h3 className="text-xl font-black text-blue-800 mb-4">📊 기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-md">
                <p className="text-sm font-bold text-gray-600 mb-1">투입량</p>
                <p className="text-2xl font-black text-blue-800">{record.greenWeight}g</p>
              </div>
              {record.roastedWeight && (
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <p className="text-sm font-bold text-gray-600 mb-1">배출량</p>
                  <p className="text-2xl font-black text-blue-800">{record.roastedWeight}g</p>
                </div>
              )}
              {record.yield && (
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <p className="text-sm font-bold text-gray-600 mb-1">수율</p>
                  <p className="text-2xl font-black text-green-700">{record.yield}%</p>
                </div>
              )}
              {record.totalTime && (
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <p className="text-sm font-bold text-gray-600 mb-1">총 로스팅 시간</p>
                  <p className="text-2xl font-black text-orange-700">{record.totalTime}</p>
                </div>
              )}
            </div>
          </div>

          {/* 초기 세팅값 */}
          {(record.fan1 || record.heater || record.fan2) && (
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-2xl border-3 border-indigo-300 shadow-lg">
              <h3 className="text-xl font-black text-indigo-800 mb-4">⚙️ 초기 세팅값</h3>
              <div className="grid grid-cols-3 gap-4">
                {record.fan1 && (
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <p className="text-sm font-bold text-gray-600 mb-1">FAN1</p>
                    <p className="text-2xl font-black text-blue-800">{record.fan1}</p>
                  </div>
                )}
                {record.heater && (
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <p className="text-sm font-bold text-gray-600 mb-1">Heater</p>
                    <p className="text-2xl font-black text-red-700">{record.heater}</p>
                  </div>
                )}
                {record.fan2 && (
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <p className="text-sm font-bold text-gray-600 mb-1">FAN2</p>
                    <p className="text-2xl font-black text-purple-700">{record.fan2}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 온도별 시간 기록 */}
          <div className="bg-gradient-to-br from-orange-100 to-yellow-100 p-6 rounded-2xl border-3 border-orange-300 shadow-lg">
            <h3 className="text-xl font-black text-orange-800 mb-4">🌡️ 온도 프로파일</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(record.temps)
                .sort((a, b) => {
                  if (a[0] === "end") return 1
                  if (b[0] === "end") return -1
                  return Number(a[0]) - Number(b[0])
                })
                .map(([temp, time]) => (
                  <div key={temp} className="bg-white p-3 rounded-xl shadow-md">
                    <p className="text-xs font-bold text-gray-600 mb-1">{temp === "end" ? "🔥 배출" : `${temp}°C`}</p>
                    <p className="text-lg font-black text-orange-800">{time}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* 자동 계산 구간 */}
          {(record.maillardTime || record.developTime || record.dtr) && (
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-2xl border-3 border-green-300 shadow-lg">
              <h3 className="text-xl font-black text-green-800 mb-4">⚡ 구간 분석</h3>
              <div className="space-y-4">
                {record.maillardTime && (
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <p className="text-base font-bold text-yellow-800 mb-1">⚡ 메일라드 반응</p>
                    <p className="text-sm text-gray-600 mb-2">150°C - 180°C</p>
                    <p className="text-2xl font-black text-yellow-900">{record.maillardTime}</p>
                  </div>
                )}
                {record.developTime && (
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <p className="text-base font-bold text-orange-800 mb-1">🔥 디벨롭 타임</p>
                    <p className="text-sm text-gray-600 mb-2">183°C - 배출</p>
                    <p className="text-2xl font-black text-orange-900">{record.developTime}</p>
                  </div>
                )}
                {record.dtr && (
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <p className="text-base font-bold text-red-800 mb-1">📊 DTR</p>
                    <p className="text-sm text-gray-600 mb-2">Development Time Ratio</p>
                    <p className="text-2xl font-black text-red-900">{record.dtr}%</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 메모 */}
          {(record.notes || record.cuppingNotes) && (
            <div className="space-y-4">
              {record.notes && (
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-2xl border-3 border-purple-300 shadow-lg">
                  <h3 className="text-lg font-black text-purple-800 mb-3">📝 로스팅 메모</h3>
                  <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{record.notes}</p>
                </div>
              )}
              {record.cuppingNotes && (
                <div className="bg-gradient-to-br from-amber-100 to-yellow-100 p-6 rounded-2xl border-3 border-amber-300 shadow-lg">
                  <h3 className="text-lg font-black text-amber-800 mb-3">☕ 컵핑 노트</h3>
                  <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{record.cuppingNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => onEdit(record)}
              className="flex-1 px-8 py-5 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-2xl font-black text-xl hover:from-amber-500 hover:to-orange-500 shadow-xl transition-all transform hover:scale-105 border-3 border-orange-500"
            >
              ✏️ 수정
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-8 py-5 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 rounded-2xl font-black text-xl hover:from-gray-400 hover:to-gray-500 shadow-xl transition-all transform hover:scale-105 border-3 border-gray-500"
            >
              ❌ 닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
