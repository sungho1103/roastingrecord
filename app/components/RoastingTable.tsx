"use client"

import type React from "react"

import type { RoastingRecord } from "../types"
import { useState, useRef } from "react"

interface RoastingTableProps {
  records: RoastingRecord[]
  onEdit: (record: RoastingRecord) => void
  onDelete: (id: string) => void
}

export default function RoastingTable({ records, onEdit, onDelete }: RoastingTableProps) {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2 // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const sortedRecords = [...records].sort((a, b) => {
    const dateTimeA = new Date(`${a.date} ${a.time || "00:00:00"}`).getTime()
    const dateTimeB = new Date(`${b.date} ${b.time || "00:00:00"}`).getTime()
    return dateTimeB - dateTimeA
  })

  const toggleRecordDetails = (recordId: string) => {
    setSelectedRecordId(selectedRecordId === recordId ? null : recordId)
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="text-7xl mb-6 animate-bounce">☕</div>
        <p className="text-2xl font-bold text-gray-800 mb-3">아직 로스팅 기록이 없습니다</p>
        <p className="text-lg font-medium text-gray-600">새 로스팅 기록을 추가해보세요!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto overflow-y-auto max-h-[70vh]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <table className="table-fixed w-max min-w-full">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[120px]">
                날짜/시간
              </th>
              <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[130px]">
                원두명
              </th>
              <th className="px-2 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[50px]">
                F1
              </th>
              <th className="px-2 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[50px]">
                Ht
              </th>
              <th className="px-2 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[50px]">
                F2
              </th>
              <th className="px-2 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[60px]">
                100°
              </th>
              <th className="px-2 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[60px]">
                130°
              </th>
              <th className="px-2 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[60px]">
                150°
              </th>
              <th className="px-2 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[60px]">
                180°
              </th>
              <th className="px-2 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[60px]">
                182°
              </th>
              <th className="px-2 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[60px]">
                183°
              </th>
              <th className="px-2 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[60px]">
                배출
              </th>
              <th className="px-2 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[70px]">
                최종온도
              </th>
              <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[70px]">
                메일라드
              </th>
              <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[70px]">
                발현
              </th>
              <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[60px]">
                DTR
              </th>
              <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[70px]">
                전체시간
              </th>
              <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-300 min-w-[140px]">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedRecords.map((record, index) => (
              <>
                <tr
                  key={record.id}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                >
                  <td className="px-3 py-2 text-base font-medium text-gray-700">
                    <div>{record.date}</div>
                    {record.time && <div className="text-sm text-gray-500">{record.time}</div>}
                  </td>
                  <td className="px-3 py-2 text-base font-semibold text-gray-800 min-w-[130px]">
                    <button
                      onClick={() => toggleRecordDetails(record.id)}
                      className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                      type="button"
                    >
                      {record.beanName}
                    </button>
                    <div className="text-sm text-gray-500 mt-1">{record.greenWeight}g</div>
                  </td>
                  <td className="px-2 py-2 text-base font-medium text-gray-700">{record.fan1 || "-"}</td>
                  <td className="px-2 py-2 text-base font-medium text-gray-700">{record.heater || "-"}</td>
                  <td className="px-2 py-2 text-base font-medium text-gray-700">{record.fan2 || "-"}</td>
                  <td className="px-2 py-2 text-base font-medium text-gray-700">{record.temps["100"] || "-"}</td>
                  <td className="px-2 py-2 text-base font-medium text-gray-700">{record.temps["130"] || "-"}</td>
                  <td className="px-2 py-2 text-base font-medium text-gray-700">{record.temps["150"] || "-"}</td>
                  <td className="px-2 py-2 text-base font-medium text-gray-700">{record.temps["180"] || "-"}</td>
                  <td className="px-2 py-2 text-base font-medium text-gray-700">{record.temps["182"] || "-"}</td>
                  <td className="px-2 py-2 text-base font-medium text-gray-700">{record.temps["183"] || "-"}</td>
                  <td className="px-2 py-2 text-base font-medium text-gray-700">{record.temps["end"] || "-"}</td>
                  <td className="px-2 py-2 text-base font-medium text-gray-700">
                    {record.finalTemp ? `${record.finalTemp}°` : "-"}
                  </td>
                  <td className="px-3 py-2 text-base font-medium text-gray-700">{record.maillardTime || "-"}</td>
                  <td className="px-3 py-2 text-base font-medium text-gray-700">{record.developTime || "-"}</td>
                  <td className="px-3 py-2 text-base font-medium text-gray-700">
                    {record.dtr ? `${record.dtr}%` : "-"}
                  </td>
                  <td className="px-3 py-2 text-base font-medium text-gray-700">{record.totalTime || "-"}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-3">
                      <button
                        onClick={() => onEdit(record)}
                        className="px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-sm transition-all shadow-sm transform hover:scale-105"
                        title="수정"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("이 기록을 삭제하시겠습니까?")) {
                            onDelete(record.id)
                          }
                        }}
                        className="px-5 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-sm transition-all shadow-sm transform hover:scale-105"
                        title="삭제"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
                {selectedRecordId === record.id && (
                  <tr key={`${record.id}-details`} className="bg-blue-50">
                    <td colSpan={17} className="px-5 py-6">
                      <div className="space-y-4">
                        {(record.firstCrackTime || record.secondCrackTime || record.finalTemp) && (
                          <div className="bg-white p-4 rounded-lg border border-gray-300">
                            <h4 className="font-bold text-gray-800 mb-2">크랙 & 온도 정보:</h4>
                            <div className="space-y-1">
                              {record.firstCrackTime && (
                                <p className="text-gray-700">1st 크랙: {record.firstCrackTime}</p>
                              )}
                              {record.secondCrackTime && (
                                <p className="text-gray-700">2nd 크랙: {record.secondCrackTime}</p>
                              )}
                              {record.finalTemp && <p className="text-gray-700">최종 온도: {record.finalTemp}°C</p>}
                            </div>
                          </div>
                        )}
                        {record.notes && (
                          <div className="bg-white p-4 rounded-lg border border-gray-300">
                            <h4 className="font-bold text-gray-800 mb-2">노트 기록:</h4>
                            <p className="text-gray-700 whitespace-pre-wrap">{record.notes}</p>
                          </div>
                        )}
                        {record.cuppingNotes && (
                          <div className="bg-white p-4 rounded-lg border border-gray-300">
                            <h4 className="font-bold text-gray-800 mb-2">테이스팅 기록:</h4>
                            <p className="text-gray-700 whitespace-pre-wrap">{record.cuppingNotes}</p>
                          </div>
                        )}
                        {!record.notes &&
                          !record.cuppingNotes &&
                          !record.firstCrackTime &&
                          !record.secondCrackTime &&
                          !record.finalTemp && (
                            <div className="text-gray-500 text-center py-2">추가 정보가 없습니다.</div>
                          )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
