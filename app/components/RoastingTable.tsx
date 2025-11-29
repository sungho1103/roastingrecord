'use client';

import { RoastingRecord } from '../types';

interface RoastingTableProps {
  records: RoastingRecord[];
  onEdit: (record: RoastingRecord) => void;
  onDelete: (id: string) => void;
}

export default function RoastingTable({ records, onEdit, onDelete }: RoastingTableProps) {
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
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-300">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-amber-600 to-orange-700">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-black text-white">ID</th>
              <th className="px-4 py-4 text-left text-sm font-black text-white">날짜</th>
              <th className="px-4 py-4 text-left text-sm font-black text-white">원두명</th>
              <th className="px-4 py-4 text-center text-sm font-black text-white">FAN1</th>
              <th className="px-4 py-4 text-center text-sm font-black text-white">Heater</th>
              <th className="px-4 py-4 text-center text-sm font-black text-white">FAN2</th>
              <th className="px-4 py-4 text-center text-sm font-black text-white">100°</th>
              <th className="px-4 py-4 text-center text-sm font-black text-white">130°</th>
              <th className="px-4 py-4 text-center text-sm font-black text-white">150°</th>
              <th className="px-4 py-4 text-center text-sm font-black text-white">180°</th>
              <th className="px-4 py-4 text-center text-sm font-black text-white">183°</th>
              <th className="px-4 py-4 text-center text-sm font-black text-white">배출</th>
              <th className="px-4 py-4 text-center text-sm font-black text-white">메일라드</th>
              <th className="px-4 py-4 text-center text-sm font-black text-white">디벨롭</th>
              <th className="px-4 py-4 text-center text-sm font-black text-white">DTR</th>
              <th className="px-4 py-4 text-center text-sm font-black text-white">전체시간</th>
              <th className="px-4 py-4 text-center text-sm font-black text-white">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedRecords.map((record, index) => (
              <tr 
                key={record.createdAt}
                className={`${
                  index % 2 === 0 ? 'bg-white' : 'bg-amber-50'
                } hover:bg-yellow-100 transition-colors`}
              >
                <td className="px-4 py-3 text-sm font-mono font-bold text-gray-800">
                  {record.id || '-'}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">
                  {record.date}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {record.beanName}
                </td>
                <td className="px-4 py-3 text-sm text-center font-semibold text-blue-700">
                  {record.fan1 || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-center font-semibold text-red-700">
                  {record.heater || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-center font-semibold text-purple-700">
                  {record.fan2 || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-center font-mono text-gray-700">
                  {record.temps['100'] || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-center font-mono text-gray-700">
                  {record.temps['130'] || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-center font-mono text-gray-700">
                  {record.temps['150'] || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-center font-mono text-gray-700">
                  {record.temps['180'] || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-center font-mono text-gray-700">
                  {record.temps['183'] || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-center font-mono font-bold text-orange-700">
                  {record.temps['end'] || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-center font-mono font-semibold text-amber-700 bg-amber-50">
                  {record.maillardTime || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-center font-mono font-semibold text-orange-700 bg-orange-50">
                  {record.developTime || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-center font-semibold text-red-700 bg-red-50">
                  {record.dtr ? `${record.dtr}%` : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-center font-mono font-bold text-purple-700 bg-purple-50">
                  {record.totalTime || '-'}
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => onEdit(record)}
                      className="px-3 py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-semibold text-xs transition-all"
                      title="수정"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('이 기록을 삭제하시겠습니까?')) {
                          onDelete(record.id);
                        }
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-xs transition-all"
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
