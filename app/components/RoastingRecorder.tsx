"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { type RoastingRecord, TEMP_BUTTONS, WEIGHT_OPTIONS } from "../types"

interface RoastingRecorderProps {
  onSave: (record: RoastingRecord) => void
  onCancel: () => void
  editRecord?: RoastingRecord | null
  presets?: {
    1: { name: string; fan1: string; heater: string; fan2: string }
    2: { name: string; fan1: string; heater: string; fan2: string }
    3: { name: string; fan1: string; heater: string; fan2: string }
  }
  beanList: string[]
  onBeanListUpdate: (updatedList: string[]) => Promise<void>
}

export default function RoastingRecorder({
  onSave,
  onCancel,
  editRecord,
  presets,
  beanList,
  onBeanListUpdate,
}: RoastingRecorderProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [temps, setTemps] = useState<{ [key: string]: string }>({})
  const [beanName, setBeanName] = useState("")
  const [customBeanName, setCustomBeanName] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [beanOrigin, setBeanOrigin] = useState("")
  const [greenWeight, setGreenWeight] = useState("")
  const [selectedWeight, setSelectedWeight] = useState<number>(0)
  const [roastedWeight, setRoastedWeight] = useState("")
  const [notes, setNotes] = useState("")
  const [cuppingNotes, setCuppingNotes] = useState("")
  const [beanListState, setBeanListState] = useState<string[]>(beanList)
  const [statusMessage, setStatusMessage] = useState("")
  const [fan1, setFan1] = useState("75")
  const [heater, setHeater] = useState("90")
  const [fan2, setFan2] = useState("2.5")
  const [recordId, setRecordId] = useState("")
  const [roastTime, setRoastTime] = useState("")
  const [roastDate, setRoastDate] = useState("")
  const [memo, setMemo] = useState("")
  const [isEditingBeanList, setIsEditingBeanList] = useState(false)
  const [editableBeanList, setEditableBeanList] = useState<string[]>([])
  const [showFloating, setShowFloating] = useState(true)
  const [currentMaillardTime, setCurrentMaillardTime] = useState<string>("")
  const [currentMaillardPercent, setCurrentMaillardPercent] = useState<number | undefined>(undefined)
  const [floatingPosition, setFloatingPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const loadPresetsFromStorage = () => {
    const stored = localStorage.getItem("roasting_presets")
    if (stored) {
      return JSON.parse(stored)
    }
    return {
      1: { fan1: "75", heater: "90", fan2: "2.5", name: "세팅1" },
      2: { fan1: "80", heater: "85", fan2: "3.0", name: "세팅2" },
      3: { fan1: "70", heater: "95", fan2: "2.0", name: "세팅3" },
    }
  }

  const [currentPreset, setCurrentPreset] = useState<number>(1)
  const [storedPresets] = useState(loadPresetsFromStorage())

  const handlePresetChange = (preset: number) => {
    setCurrentPreset(preset)
    setFan1(presets ? presets[preset].fan1 : storedPresets[preset].fan1)
    setHeater(presets ? presets[preset].heater : storedPresets[preset].heater)
    setFan2(presets ? presets[preset].fan2 : storedPresets[preset].fan2)
  }

  useEffect(() => {
    if (editRecord) {
      setBeanName(editRecord.beanName)
      setBeanOrigin(editRecord.beanOrigin || "")
      setGreenWeight(editRecord.greenWeight.toString())
      setRoastedWeight(editRecord.roastedWeight?.toString() || "")
      setNotes(editRecord.notes || "")
      setCuppingNotes(editRecord.cuppingNotes || "")
      setTemps(editRecord.temps)
      setFan1(editRecord.fan1?.toString() || "75")
      setHeater(editRecord.heater?.toString() || "90")
      setFan2(editRecord.fan2?.toString() || "2.5")
      setRecordId(editRecord.id || "")
      setMemo(editRecord.memo || "")
      setRoastTime(editRecord.time || "")
      setRoastDate(editRecord.date || "")

      if (editRecord.totalTime) {
        const [min, sec] = editRecord.totalTime.split(":").map(Number)
        setElapsedTime(min * 60 + sec)
      }
    }
  }, [editRecord])

  useEffect(() => {
    if (greenWeight) {
      const green = Number.parseFloat(greenWeight)
      if (!Number.isNaN(green) && green > 0) {
        setRoastedWeight((green * 0.85).toFixed(0))
      }
    }
  }, [greenWeight])

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedTime * 1000
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000))

        const temp150 = temps["150"]
        const temp182 = temps["182"]
        const temp183 = temps["183"]

        if (temp150 && !temp182 && !temp183) {
          const [min1, sec1] = temp150.split(":").map(Number)
          const temp150Seconds = min1 * 60 + sec1
          const currentSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
          const diff = currentSeconds - temp150Seconds

          if (diff > 0) {
            setCurrentMaillardTime(formatTime(diff))
            setCurrentMaillardPercent(Number(((diff / currentSeconds) * 100).toFixed(2)))
          }
        } else {
          setCurrentMaillardTime("")
          setCurrentMaillardPercent(undefined)
        }
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, elapsedTime, temps])

  useEffect(() => {
    console.log("[v0] RoastingRecorder: beanList prop changed:", beanList)
    setBeanListState(beanList)
  }, [beanList])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const handleTempClick = (temp: number) => {
    if (temps[temp]) {
      const { [temp]: removed, ...rest } = temps
      setTemps(rest)
      setStatusMessage("온도 기록 취소됨")
      return
    }

    const currentTime = formatTime(elapsedTime)
    setTemps((prev) => ({
      ...prev,
      [temp]: currentTime,
    }))

    if (temp === 150) {
      setStatusMessage("Maillard Zone")
    } else if (temp === 180) {
      setStatusMessage("곧 크랙 시작!")
    } else if (temp === 182 || temp === 183) {
      setStatusMessage("CP - Development Zone 시작")
    }
  }

  const handleEndRoast = () => {
    const endTime = formatTime(elapsedTime)
    setTemps((prev) => ({
      ...prev,
      end: endTime,
    }))
    setIsRunning(false)
    setStatusMessage("로스팅 완료!")
  }

  const handleBeanChange = (value: string) => {
    if (value === "기타") {
      setShowCustomInput(true)
      setBeanName("")
      setBeanOrigin("")
    } else {
      setShowCustomInput(false)
      setBeanName(value)
      const firstWord = value.split(" ")[0]
      setBeanOrigin(firstWord)
    }
  }

  const handleCustomBeanInput = (value: string) => {
    setCustomBeanName(value)
    const firstWord = value.split(" ")[0]
    setBeanOrigin(firstWord)
  }

  const handleSaveCustomBean = async () => {
    if (customBeanName.trim()) {
      const trimmedName = customBeanName.trim()

      // Check if bean already exists
      if (!beanListState.includes(trimmedName)) {
        const newBeanList = [...beanListState, trimmedName]
        setBeanListState(newBeanList)

        // Call parent update function
        if (onBeanListUpdate) {
          await onBeanListUpdate(newBeanList)
        }

        console.log("[v0] Added new bean to list:", trimmedName)
      }

      setBeanName(trimmedName)
      const firstWord = trimmedName.split(" ")[0]
      setBeanOrigin(firstWord)
      setShowCustomInput(false)
      setCustomBeanName("")
    }
  }

  const handleEditBeanList = () => {
    setEditableBeanList([...beanListState])
    setIsEditingBeanList(true)
  }

  const handleSaveBeanList = async () => {
    console.log("[v0] === BEAN LIST SAVE BUTTON CLICKED ===")
    console.log("[v0] editableBeanList before filter:", editableBeanList)

    const filtered = editableBeanList.filter((bean) => bean.trim() !== "")
    console.log("[v0] Filtered bean list:", filtered)

    // Update local state first
    setBeanListState(filtered)
    console.log("[v0] Updated beanListState")

    // Save to localStorage
    try {
      localStorage.setItem("beanList", JSON.stringify(filtered))
      console.log("[v0] Saved to localStorage successfully")
    } catch (e) {
      console.error("[v0] LocalStorage save error:", e)
    }

    // Call parent update function to sync with Supabase
    if (onBeanListUpdate) {
      console.log("[v0] Calling onBeanListUpdate with:", filtered)
      try {
        await onBeanListUpdate(filtered)
        console.log("[v0] onBeanListUpdate completed successfully")
      } catch (error) {
        console.error("[v0] onBeanListUpdate error:", error)
        alert("Supabase 저장 중 오류가 발생했습니다: " + error)
      }
    } else {
      console.error("[v0] ERROR: onBeanListUpdate is not defined!")
      alert("원두 목록 업데이트 함수가 정의되지 않았습니다.")
    }

    // Close modal after save completes
    setIsEditingBeanList(false)
    console.log("[v0] === BEAN LIST SAVE COMPLETED, MODAL CLOSED ===")
  }

  const handleUpdateBeanItem = (index: number, value: string) => {
    const updated = [...editableBeanList]
    updated[index] = value
    setEditableBeanList(updated)
  }

  const handleDeleteBeanItem = (index: number) => {
    const updated = editableBeanList.filter((_, i) => i !== index)
    setEditableBeanList(updated)
  }

  const handleAddBeanItem = () => {
    setEditableBeanList([...editableBeanList, ""])
  }

  const handleSetCurrentTime = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    setRoastTime(`${hours}:${minutes}`)
  }

  const handleSetTodayDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    setRoastDate(`${year}-${month}-${day}`)
  }

  const handleWeightChange = (value: number) => {
    setSelectedWeight(value)
    if (value > 0) {
      setGreenWeight(value.toString())
    } else {
      setGreenWeight("")
    }
  }

  const calculateMaillardTime = (): string | undefined => {
    const temp150 = temps["150"]
    const temp180 = temps["180"]

    if (!temp150 || !temp180) return undefined

    const [min1, sec1] = temp150.split(":").map(Number)
    const [min2, sec2] = temp180.split(":").map(Number)
    const diff = min2 * 60 + sec2 - (min1 * 60 + sec1)

    return formatTime(diff)
  }

  const calculateMaillardPercent = (): number | undefined => {
    const maillardTime = calculateMaillardTime()
    if (!maillardTime || elapsedTime === 0) return undefined

    const [min, sec] = maillardTime.split(":").map(Number)
    const maillardSeconds = min * 60 + sec
    return Number(((maillardSeconds / elapsedTime) * 100).toFixed(2))
  }

  const calculateDevelopTime = (): string | undefined => {
    const temp182 = temps["182"]
    const temp183 = temps["183"]
    const endTemp = temps["end"]

    if (!endTemp) return undefined

    const startTemp = temp182 || temp183
    if (!startTemp) return undefined

    const [min1, sec1] = startTemp.split(":").map(Number)
    const [min2, sec2] = endTemp.split(":").map(Number)
    const diff = min2 * 60 + sec2 - (min1 * 60 + sec1)

    return formatTime(diff)
  }

  const calculateCurrentDevelopTime = (): string | undefined => {
    const temp182 = temps["182"]
    const temp183 = temps["183"]

    const startTemp = temp182 || temp183
    if (!startTemp) return undefined

    const [min1, sec1] = startTemp.split(":").map(Number)
    const startSeconds = min1 * 60 + sec1
    const diff = elapsedTime - startSeconds

    if (diff < 0) return undefined

    return formatTime(diff)
  }

  const calculateCurrentDTR = (): number | undefined => {
    const developTime = calculateCurrentDevelopTime()
    if (!developTime || elapsedTime === 0) return undefined

    const [dMin, dSec] = developTime.split(":").map(Number)
    const dSeconds = dMin * 60 + dSec

    return Number(((dSeconds / elapsedTime) * 100).toFixed(2))
  }

  const calculateDTR = (): number | undefined => {
    const developTime = calculateDevelopTime()
    const totalTime = temps["end"]

    if (!developTime || !totalTime) return undefined

    const [dMin, dSec] = developTime.split(":").map(Number)
    const [tMin, tSec] = totalTime.split(":").map(Number)

    const dSeconds = dMin * 60 + dSec
    const tSeconds = tMin * 60 + tSec

    return Number(((dSeconds / tSeconds) * 100).toFixed(2))
  }

  const calculateYield = (): number | undefined => {
    const green = Number.parseFloat(greenWeight)
    const roasted = Number.parseFloat(roastedWeight)

    if (!green || !roasted) return undefined

    return Number(((roasted / green) * 100).toFixed(2))
  }

  const handleSave = () => {
    const finalBeanName = showCustomInput ? customBeanName : beanName

    if (!finalBeanName || !greenWeight) {
      alert("원두명과 투입량은 필수입니다.")
      return
    }

    const now = new Date().toISOString()
    const dateStr = roastDate || new Date().toISOString().split("T")[0]

    const finalId = recordId.trim() || `R${Date.now().toString().slice(-8)}`

    const record: RoastingRecord = {
      id: finalId,
      date: dateStr,
      time: roastTime || undefined,
      beanName: finalBeanName,
      beanOrigin: beanOrigin || undefined,
      greenWeight: Number.parseFloat(greenWeight),
      roastedWeight: roastedWeight ? Number.parseFloat(roastedWeight) : undefined,
      yield: calculateYield(),
      fan1: fan1 ? Number.parseFloat(fan1) : undefined,
      heater: heater ? Number.parseFloat(heater) : undefined,
      fan2: fan2 ? Number.parseFloat(fan2) : undefined,
      temps,
      maillardTime: calculateMaillardTime(),
      developTime: calculateDevelopTime(),
      dtr: calculateDTR(),
      totalTime: temps["end"],
      notes: notes || undefined,
      cuppingNotes: cuppingNotes || undefined,
      memo: memo || undefined,
      createdAt: editRecord?.createdAt || now,
      updatedAt: now,
    }

    onSave(record)
  }

  const maillardTime = calculateMaillardTime()
  const developTime = calculateDevelopTime()
  const dtr = calculateDTR()
  const yieldPercent = calculateYield()

  const currentDevelopTime = calculateCurrentDevelopTime()
  const currentDTR = calculateCurrentDTR()
  const maillardPercent = calculateMaillardPercent()

  const highlightedTemps = [100, 130, 150, 180, 182, 183, 190]

  const displayMaillardTime = currentMaillardTime || maillardTime
  const displayMaillardPercent = currentMaillardPercent !== undefined ? currentMaillardPercent : maillardPercent

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!beanName.trim()) {
      alert("원두명을 선택해주세요.")
      return
    }

    // If custom bean name was entered, add it to the bean list
    if (beanName === "기타" && customBeanName.trim()) {
      const newBeanName = customBeanName.trim()
      console.log("[v0] Adding custom bean name to list:", newBeanName)

      if (!beanListState.includes(newBeanName)) {
        const updatedList = [...beanListState.filter((b) => b !== "기타"), newBeanName, "기타"]
        setBeanListState(updatedList)
        if (onBeanListUpdate) {
          console.log("[v0] Calling onBeanListUpdate with:", updatedList)
          onBeanListUpdate(updatedList)
        }
      }
      setBeanName(newBeanName)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - floatingPosition.x,
      y: e.clientY - floatingPosition.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setFloatingPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragStart])

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {showFloating && isRunning && (temps["150"] || temps["182"] || temps["183"]) && (
        <div
          className="fixed bg-white p-6 rounded-2xl shadow-2xl border-2 border-gray-300 z-50 min-w-[300px] cursor-move"
          style={{
            top: floatingPosition.y === 0 ? "1rem" : `${floatingPosition.y}px`,
            right: floatingPosition.x === 0 ? "1rem" : "auto",
            left: floatingPosition.x !== 0 ? `${floatingPosition.x}px` : "auto",
            transform: floatingPosition.x === 0 && floatingPosition.y === 0 ? "translateX(calc(-100% - 1rem))" : "none",
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">실시간 구간</h3>
            <button
              onClick={() => setShowFloating(false)}
              className="text-gray-500 hover:text-gray-700 font-bold text-xl"
              type="button"
            >
              ×
            </button>
          </div>
          <div className="space-y-3">
            {temps["150"] && displayMaillardTime && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-sm font-semibold text-gray-600">메일라드</div>
                <div className="text-xl font-bold text-blue-700">{displayMaillardTime}</div>
                {displayMaillardPercent && (
                  <div className="text-sm font-semibold text-blue-600">{displayMaillardPercent}%</div>
                )}
              </div>
            )}
            {(temps["182"] || temps["183"]) && currentDevelopTime && (
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="text-sm font-semibold text-gray-600">발현(디벨롭)</div>
                <div className="text-xl font-bold text-orange-700">{currentDevelopTime}</div>
                {currentDTR && <div className="text-sm font-semibold text-orange-600">DTR: {currentDTR}%</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {!showFloating && isRunning && (
        <button
          onClick={() => setShowFloating(true)}
          className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 z-50"
          type="button"
        >
          실시간 구간 보기
        </button>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          {editRecord ? "로스팅 기록 수정" : "새 로스팅 기록"}
        </h2>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-700">로스팅 날짜</label>
            <div className="flex gap-4">
              <input
                type="date"
                value={roastDate}
                onChange={(e) => setRoastDate(e.target.value)}
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-lg font-medium shadow-sm"
              />
              <button
                onClick={handleSetTodayDate}
                className="px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all shadow-sm text-base"
                type="button"
              >
                오늘날짜
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-700">로스팅 시작 시간</label>
            <div className="flex gap-4">
              <input
                type="time"
                value={roastTime}
                onChange={(e) => setRoastTime(e.target.value)}
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-lg font-medium shadow-sm"
                placeholder="HH:MM"
              />
              <button
                onClick={handleSetCurrentTime}
                className="px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all shadow-sm text-base"
                type="button"
              >
                현재시간
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-700">메모</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-lg font-medium shadow-sm"
              placeholder="메모 입력"
              maxLength={100}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-700">ID (선택사항)</label>
            <input
              type="text"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-lg font-medium shadow-sm"
              placeholder="ID 입력 (선택사항)"
              maxLength={20}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-base font-semibold text-gray-700">원두명 *</label>
              <button
                onClick={handleEditBeanList}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all text-sm"
                type="button"
              >
                원두 목록 편집
              </button>
            </div>
            <select
              value={showCustomInput ? "기타" : beanName}
              onChange={(e) => handleBeanChange(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-lg font-medium shadow-sm"
            >
              <option value="">원두를 선택하세요</option>
              {beanListState.map((bean) => (
                <option key={bean} value={bean}>
                  {bean}
                </option>
              ))}
              <option value="기타">기타 (직접 입력)</option>
            </select>

            {showCustomInput && (
              <div className="flex gap-3 mt-3">
                <input
                  type="text"
                  value={customBeanName}
                  onChange={(e) => handleCustomBeanInput(e.target.value)}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-lg font-medium shadow-sm"
                  placeholder="원두명 입력"
                />
                <button
                  onClick={handleSaveCustomBean}
                  className="px-6 py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all text-base"
                  type="button"
                >
                  저장
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-700">원산지 (자동 입력됨)</label>
            <input
              type="text"
              value={beanOrigin}
              onChange={(e) => setBeanOrigin(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 text-lg font-medium shadow-sm"
              placeholder="자동으로 채워집니다"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-700">투입량 (g) *</label>
            <select
              value={selectedWeight}
              onChange={(e) => handleWeightChange(Number(e.target.value))}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-lg font-medium shadow-sm"
            >
              <option value={0}>선택하세요</option>
              {WEIGHT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {selectedWeight === 0 && (
              <input
                type="number"
                value={greenWeight}
                onChange={(e) => setGreenWeight(e.target.value)}
                placeholder="직접 입력 (g)"
                className="w-full mt-3 px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg font-medium shadow-sm"
              />
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-700">배출량 (g) - 자동계산 85%</label>
            <input
              type="number"
              value={roastedWeight}
              onChange={(e) => setRoastedWeight(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-lg font-medium shadow-sm"
              placeholder="자동계산됨 (수정가능)"
            />
            {yieldPercent && (
              <p className="text-xl font-bold text-green-700 bg-green-50 p-3 rounded-xl text-center shadow-sm border border-green-200">
                수율: {yieldPercent}%
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-700">초기 세팅값</h3>
              <div className="flex gap-2">
                {[1, 2, 3].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetChange(preset)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      currentPreset === preset
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    type="button"
                  >
                    {preset} - {presets ? presets[preset].name : storedPresets[preset].name || `세팅${preset}`}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600">F1</label>
                <input
                  type="number"
                  value={fan1}
                  onChange={(e) => setFan1(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-base font-medium shadow-sm"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600">Ht</label>
                <input
                  type="number"
                  value={heater}
                  onChange={(e) => setHeater(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-base font-medium shadow-sm"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600">F2</label>
                <input
                  type="number"
                  value={fan2}
                  onChange={(e) => setFan2(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-base font-medium shadow-sm"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">로스팅 타이머</h2>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-2xl shadow-lg">
            <div className="text-5xl font-black text-center text-white drop-shadow-lg">{formatTime(elapsedTime)}</div>
          </div>

          {statusMessage && (
            <div className="bg-blue-100 border-2 border-blue-400 text-blue-800 px-6 py-4 rounded-xl text-center font-bold text-lg shadow-sm">
              {statusMessage}
            </div>
          )}

          <div className="flex gap-6 justify-center">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-10 py-5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md transform hover:scale-105"
              type="button"
            >
              {isRunning ? "일시정지" : "시작"}
            </button>
            <button
              onClick={() => {
                setElapsedTime(0)
                setTemps({})
                setIsRunning(false)
                setStatusMessage("")
              }}
              className="px-10 py-5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-bold text-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-md transform hover:scale-105"
              type="button"
            >
              리셋
            </button>
            <button
              onClick={handleEndRoast}
              className="px-10 py-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-2xl hover:from-red-600 hover:to-red-700 transition-all shadow-md transform hover:scale-105"
              type="button"
            >
              배출
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">온도 기록</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {TEMP_BUTTONS.map((temp) => {
            const isRecorded = temps[temp]
            const isHighlighted = highlightedTemps.includes(temp)
            return (
              <button
                key={temp}
                onClick={() => handleTempClick(temp)}
                className={`px-4 py-5 rounded-xl font-bold text-2xl transition-all shadow-md transform hover:scale-105 ${
                  isRecorded
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-2 border-blue-700"
                    : isHighlighted
                      ? "bg-gray-400 text-white border-2 border-gray-500 hover:bg-gray-500"
                      : "bg-gray-200 text-gray-700 border-2 border-gray-300 hover:bg-gray-300"
                }`}
                type="button"
              >
                <div>{temp}°</div>
                {isRecorded && <div className="text-xs font-semibold mt-1">{temps[temp]}</div>}
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleEndRoast}
            className="px-12 py-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-2xl hover:from-red-600 hover:to-red-700 transition-all shadow-md transform hover:scale-105"
            type="button"
          >
            배출
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">자동 계산 구간</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200 shadow-sm">
            <p className="text-sm font-semibold text-gray-600 mb-2">메일라드 (150°-180°)</p>
            <p className="text-2xl font-black text-blue-700">{maillardTime || "--:--"}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border-2 border-orange-200 shadow-sm">
            <p className="text-sm font-semibold text-gray-600 mb-2">발현(디벨롭) (182/183°-배출)</p>
            <p className="text-2xl font-black text-orange-700">{developTime || "--:--"}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border-2 border-purple-200 shadow-sm">
            <p className="text-sm font-semibold text-gray-600 mb-2">DTR (%)</p>
            <p className="text-2xl font-black text-purple-700">{dtr ? `${dtr}%` : "--%"}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-2 border-green-200 shadow-sm">
            <p className="text-sm font-semibold text-gray-600 mb-2">전체 시간</p>
            <p className="text-2xl font-black text-green-700">{temps["end"] || "--:--"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">로스팅 노트</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-h-[120px] text-base font-medium shadow-sm resize-none"
          placeholder="로스팅 과정에 대한 메모를 입력하세요..."
        />
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">컵핑 노트</h2>
        <textarea
          value={cuppingNotes}
          onChange={(e) => setCuppingNotes(e.target.value)}
          className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-h-[120px] text-base font-medium shadow-sm resize-none"
          placeholder="컵핑 결과를 입력하세요..."
        />
      </div>

      <div className="flex gap-6 justify-center pb-8">
        <button
          onClick={handleSave}
          className="px-12 py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold text-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg transform hover:scale-105"
          type="button"
        >
          저장
        </button>
        <button
          onClick={onCancel}
          className="px-12 py-5 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-bold text-xl hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg transform hover:scale-105"
          type="button"
        >
          취소
        </button>
      </div>

      {/* Bean list editor modal */}
      {isEditingBeanList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">원두 목록 편집</h3>
            <div className="space-y-3 mb-6">
              {editableBeanList.map((bean, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={bean}
                    onChange={(e) => handleUpdateBeanItem(index, e.target.value)}
                    className="flex-1 px-5 py-3 text-xl border-3 border-gray-300 rounded-2xl focus:border-gray-500 focus:outline-none"
                    placeholder="원두명"
                  />
                  <button
                    onClick={() => handleDeleteBeanItem(index)}
                    className="px-6 py-4 bg-red-500 text-white text-lg rounded-2xl hover:bg-red-600 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddBeanItem}
              className="mt-6 px-8 py-4 bg-green-500 text-white text-xl rounded-2xl hover:bg-green-600 transition-colors w-full"
            >
              + 원두 추가
            </button>
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => {
                  console.log("[v0] Cancel button clicked")
                  setIsEditingBeanList(false)
                }}
                className="flex-1 px-8 py-4 bg-gray-300 text-gray-700 text-xl rounded-2xl hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  console.log("[v0] Save button clicked, calling handleSaveBeanList")
                  handleSaveBeanList()
                }}
                className="flex-1 px-8 py-4 bg-blue-600 text-white text-xl rounded-2xl hover:bg-blue-700 transition-colors"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
