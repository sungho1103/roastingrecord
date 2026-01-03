"use client"

import { useState, useEffect } from "react"
import type { RoastingRecord } from "./types"
import RoastingRecorder from "./components/RoastingRecorder"
import RoastingTable from "./components/RoastingTable"
import RecordDetail from "./components/RecordDetail"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

const DEFAULT_BEANS = ["Arabica", "Robusta", "Liberica"]

export default function Home() {
  const [records, setRecords] = useState<RoastingRecord[]>([])
  const [view, setView] = useState<"list" | "new" | "edit">("list")
  const [editingRecord, setEditingRecord] = useState<RoastingRecord | null>(null)
  const [viewingRecord, setViewingRecord] = useState<RoastingRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [beanList, setBeanList] = useState<string[]>([])

  useEffect(() => {
    fetchRecords()
    loadBeanList()
  }, [])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("roasting_records").select("*").order("date", { ascending: false })

        if (!error && data) {
          setRecords(data)
          setLoading(false)
          return
        }
      }

      loadFromLocalStorage()
    } catch (error) {
      loadFromLocalStorage()
    } finally {
      setLoading(false)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem("roastingRecords")
      if (saved) {
        const parsed = JSON.parse(saved)
        setRecords(parsed)
      }
    } catch (error) {
      // Silent fail - empty records is fine
    }
  }

  const saveToLocalStorage = (recordsToSave: RoastingRecord[]) => {
    try {
      localStorage.setItem("roastingRecords", JSON.stringify(recordsToSave))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  }

  const loadBeanList = async () => {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("bean_names").select("name").order("name")

        if (!error && data && data.length > 0) {
          setBeanList(data.map((b) => b.name))
          return
        }
      }

      const saved = localStorage.getItem("beanList")
      if (saved) {
        setBeanList(JSON.parse(saved))
      } else {
        setBeanList(DEFAULT_BEANS)
        localStorage.setItem("beanList", JSON.stringify(DEFAULT_BEANS))
      }
    } catch (error) {
      setBeanList(DEFAULT_BEANS)
    }
  }

  const handleSave = async (record: RoastingRecord) => {
    try {
      if (!record.id || record.id.trim() === "") {
        const now = new Date()
        const dateStr = now.toISOString().split("T")[0].replace(/-/g, "")
        const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "")
        record.id = `${dateStr}-${timeStr}`
      }

      let updatedRecords: RoastingRecord[]

      if (isSupabaseConfigured) {
        if (editingRecord) {
          const { error } = await supabase.from("roasting_records").update(record).eq("id", editingRecord.id)

          if (error) throw error

          updatedRecords = records.map((r) => (r.id === editingRecord.id ? record : r))
        } else {
          const { error } = await supabase.from("roasting_records").insert([record])

          if (error) throw error

          updatedRecords = [record, ...records]
        }
      } else {
        if (editingRecord) {
          updatedRecords = records.map((r) => (r.id === editingRecord.id ? record : r))
        } else {
          updatedRecords = [record, ...records]
        }
      }

      setRecords(updatedRecords)
      saveToLocalStorage(updatedRecords)
      setView("list")
      setEditingRecord(null)
    } catch (error) {
      console.error("Error saving record:", error)
      alert("저장 중 오류가 발생했습니다.")
    }
  }

  const handleEdit = (record: RoastingRecord) => {
    setEditingRecord(record)
    setView("edit")
    setViewingRecord(null)
  }

  const handleDelete = async (id: string) => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from("roasting_records").delete().eq("id", id)

        if (error) throw error
      }

      const updatedRecords = records.filter((r) => r.id !== id)
      setRecords(updatedRecords)
      saveToLocalStorage(updatedRecords)
    } catch (error) {
      console.error("Error deleting record:", error)
      alert("삭제 중 오류가 발생했습니다.")
    }
  }

  const handleCancel = () => {
    setView("list")
    setEditingRecord(null)
  }

  const handleView = (record: RoastingRecord) => {
    setViewingRecord(record)
  }

  const handleExportBeans = () => {
    if (beanList.length > 0) {
      const blob = new Blob([JSON.stringify(beanList)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "bean_list.json"
      a.click()
      URL.revokeObjectURL(url)
      alert("원두 목록이 다운로드되었습니다.")
    } else {
      alert("저장된 원두 목록이 없습니다.")
    }
  }

  const handleImportBeans = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (event) => {
          try {
            const content = event.target?.result as string
            const importedBeans = JSON.parse(content)
            handleBeanListUpdate(importedBeans)
            alert("원두 목록을 가져왔습니다.")
          } catch (error) {
            alert("잘못된 파일 형식입니다.")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const filteredRecords = records.filter((record) => {
    const search = searchTerm.toLowerCase()
    return (
      record.id.includes(search) ||
      record.beanName.toLowerCase().includes(search) ||
      record.beanOrigin?.toLowerCase().includes(search) ||
      record.date.includes(search)
    )
  })

  const handleBeanListUpdate = async (newBeanList: string[]) => {
    setBeanList(newBeanList)
    try {
      if (isSupabaseConfigured) {
        await supabase.from("bean_names").delete().neq("name", "")

        const beanRecords = newBeanList.map((name) => ({ name }))
        await supabase.from("bean_names").insert(beanRecords)
      }

      localStorage.setItem("beanList", JSON.stringify(newBeanList))
    } catch (e) {
      console.error("Error saving bean list:", e)
    }
  }

  return (
    <div className="min-h-screen pb-10">
      <header className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 shadow-md border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl sm:text-5xl font-black text-gray-800 tracking-tight">TELA Coffee</h1>
              <p className="text-lg sm:text-xl text-gray-600 font-semibold mt-2">Roasting Record System</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-all shadow-sm"
                title="초기 세팅값 수정"
              >
                ⚙️ 설정
              </button>
              {view === "list" && (
                <button
                  onClick={() => setView("new")}
                  className="px-8 py-4 bg-blue-500 text-white rounded-xl font-bold text-xl hover:bg-blue-600 transition-all shadow-md transform hover:scale-105"
                >
                  새 로스팅 기록
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 animate-bounce">☕</div>
            <p className="text-xl text-gray-700 font-semibold">데이터를 불러오는 중...</p>
          </div>
        ) : view === "list" ? (
          <div className="space-y-8">
            <div className="relative max-w-3xl mx-auto">
              <input
                type="text"
                placeholder="검색 (ID, 원두명, 원산지, 날짜)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-8 py-5 pl-14 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg font-medium shadow-sm bg-white"
              />
              <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-2xl">🔍</span>
            </div>

            {records.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-200">
                  <p className="text-sm font-semibold text-blue-700 mb-1">전체 로스팅</p>
                  <p className="text-3xl font-black text-blue-900">{records.length}회</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl shadow-sm border border-amber-200">
                  <p className="text-sm font-semibold text-amber-700 mb-1">총 투입량</p>
                  <p className="text-3xl font-black text-amber-900">
                    {(records.reduce((sum, r) => sum + r.greenWeight, 0) / 1000).toFixed(1)}kg
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl shadow-sm border border-purple-200">
                  <p className="text-sm font-semibold text-purple-700 mb-1">평균 DTR</p>
                  <p className="text-3xl font-black text-purple-900">
                    {records.filter((r) => r.dtr).length > 0
                      ? (
                          records.reduce((sum, r) => sum + (r.dtr || 0), 0) / records.filter((r) => r.dtr).length
                        ).toFixed(1)
                      : "-"}
                    %
                  </p>
                </div>
              </div>
            )}

            <RoastingTable records={filteredRecords} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
          </div>
        ) : view === "new" || view === "edit" ? (
          <RoastingRecorder
            onSave={handleSave}
            onCancel={handleCancel}
            editRecord={editingRecord}
            beanList={beanList}
            onBeanListUpdate={handleBeanListUpdate}
          />
        ) : null}
      </main>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">설정</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mb-8 border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
              <h3 className="text-lg font-bold text-blue-900 mb-3">원두 목록 동기화</h3>
              <p className="text-sm text-blue-800 mb-4">
                다른 기기에서 동일한 원두 목록을 사용하려면 내보내기/가져오기를 이용하세요.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleExportBeans}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all"
                >
                  📤 원두 목록 내보내기
                </button>
                <button
                  onClick={handleImportBeans}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
                >
                  📥 원두 목록 가져오기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingRecord && (
        <RecordDetail record={viewingRecord} onClose={() => setViewingRecord(null)} onEdit={handleEdit} />
      )}
    </div>
  )
}
