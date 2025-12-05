"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { RoastingRecord } from "../types"
import { TEMP_BUTTONS, WEIGHT_OPTIONS } from "../types"

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
  onMemoUpdate?: (memo: string) => void // Added for memo update
}

export default function RoastingRecorder({
  onSave,
  onCancel,
  editRecord,
  presets,
  beanList,
  onBeanListUpdate,
  onMemoUpdate, // Added for memo update
}: RoastingRecorderProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [temps, setTemps] = useState<{ [key: string]: string }>({})
  const [beanName, setBeanName] = useState("")
  const [customBeanName, setCustomBeanName] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [beanOrigin, setBeanOrigin] = useState("")
  const [greenWeight, setGreenWeight] = useState<number>(0) // Changed to number
  const [customGreenWeight, setCustomGreenWeight] = useState<string>("") // Added for custom weight input
  const [showCustomWeight, setShowCustomWeight] = useState(false) // Added to control custom weight input visibility
  const [selectedWeight, setSelectedWeight] = useState<number>(0)
  const [roastedWeight, setRoastedWeight] = useState<number>(0) // Changed to number
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
  const [maillardFrozenTime, setMaillardFrozenTime] = useState<string>("")
  const [maillardFrozenPercent, setMaillardFrozenPercent] = useState<number | undefined>(undefined)
  const [currentDevelopTime, setCurrentDevelopTime] = useState<string>("")
  const [currentDevelopPercent, setCurrentDevelopPercent] = useState<number | undefined>(undefined)
  const [floatingPosition, setFloatingPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [firstCrackTime, setFirstCrackTime] = useState<string>("")
  const [secondCrackTime, setSecondCrackTime] = useState<string>("")
  const [finalTemp, setFinalTemp] = useState<string>("")
  const [showCustomBean, setShowCustomBean] = useState(false)
  const [yieldValue, setYieldValue] = useState<number | undefined>(undefined)
  const [isDischargePressed, setIsDischargePressed] = useState(false) // Added state to track if discharge button was pressed

  const [lastRecordedTemp, setLastRecordedTemp] = useState<number | undefined>(undefined)

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
  const [storedPresets, setStoredPresets] = useState(loadPresetsFromStorage())

  const handlePresetChange = (preset: number) => {
    setCurrentPreset(preset)
    setFan1(presets ? presets[preset].fan1 : storedPresets[preset].fan1)
    setHeater(presets ? presets[preset].heater : storedPresets[preset].heater)
    setFan2(presets ? presets[preset].fan2 : storedPresets[preset].fan2)
  }

  const handleAddPreset = () => {
    const newPresetNumber = Object.keys(storedPresets).length + 1
    const newPresets = {
      ...storedPresets,
      [newPresetNumber]: {
        fan1: "75",
        heater: "90",
        fan2: "2.5",
        name: `세팅${newPresetNumber}`,
      },
    }
    setStoredPresets(newPresets)
    localStorage.setItem("roasting_presets", JSON.stringify(newPresets))
  }

  // Fetches bean list from parent if not editing
  const fetchBeanListFromParent = () => {
    if (!editRecord) {
      setBeanListState(beanList)
    }
  }

  useEffect(() => {
    if (editRecord) {
      setBeanName(editRecord.beanName)
      setBeanOrigin(editRecord.beanOrigin || "")
      setGreenWeight(editRecord.greenWeight)
      setRoastedWeight(editRecord.roastedWeight || 0)
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
      setFirstCrackTime(editRecord.firstCrackTime || "")
      setSecondCrackTime(editRecord.secondCrackTime || "")
      setFinalTemp(editRecord.finalTemp?.toString() || "")
      setYieldValue(editRecord.yield)
      setLastRecordedTemp(editRecord.finalTemp ? Number(editRecord.finalTemp) : undefined) // Load lastRecordedTemp from editRecord

      if (editRecord.totalTime) {
        const [min, sec] = editRecord.totalTime.split(":").map(Number)
        setElapsedTime(min * 60 + sec)
      }
    } else {
      fetchBeanListFromParent()
    }
  }, [editRecord])

  useEffect(() => {
    if (greenWeight > 0) {
      setRoastedWeight(Number((greenWeight * 0.85).toFixed(0)))
      setYieldValue(Number((((greenWeight * 0.85) / greenWeight) * 100).toFixed(2)))
    } else {
      setRoastedWeight(0)
      setYieldValue(undefined)
    }
  }, [greenWeight])

  useEffect(() => {
    if (isRunning && !isDischargePressed) {
      // Modified to keep floating menu visible until discharge is pressed
      startTimeRef.current = Date.now() - elapsedTime * 1000
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000))

        const temp150 = temps["150"]
        const temp180 = temps["180"] // Check for 180 to stop Maillard tracking
        const temp182 = temps["182"]
        const temp183 = temps["183"]

        if (temp150 && !temp180) {
          // Only calculate Maillard if temp reaches 150 but not yet 180
          const [min1, sec1] = temp150.split(":").map(Number)
          const temp150Seconds = min1 * 60 + sec1
          const currentSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
          const diff = currentSeconds - temp150Seconds

          if (diff > 0) {
            const timeStr = formatTime(diff)
            setCurrentMaillardTime(timeStr)
            const percent = Number(((diff / currentSeconds) * 100).toFixed(2))
            setCurrentMaillardPercent(percent)
            // Store frozen values when 180 is about to be pressed
            setMaillardFrozenTime(timeStr)
            setMaillardFrozenPercent(percent)
          }
        } else if (temp150 && temp180) {
          const [min1, sec1] = temp150.split(":").map(Number)
          const [min2, sec2] = temp180.split(":").map(Number)
          const diff = min2 * 60 + sec2 - (min1 * 60 + sec1)
          const timeStr = formatTime(diff)
          setMaillardFrozenTime(timeStr)
          const currentSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
          const percent = Number(((diff / currentSeconds) * 100).toFixed(2))
          setMaillardFrozenPercent(percent)
        }

        const startTemp = temp182 || temp183
        if (startTemp) {
          const [min1, sec1] = startTemp.split(":").map(Number)
          const startSeconds = min1 * 60 + sec1
          const currentSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
          const diff = currentSeconds - startSeconds

          if (diff > 0) {
            const timeStr = formatTime(diff)
            setCurrentDevelopTime(timeStr)
            const percent = Number(((diff / currentSeconds) * 100).toFixed(2))
            setCurrentDevelopPercent(percent)
          }
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
  }, [isRunning, temps, elapsedTime])

  useEffect(() => {
    console.log("[v0] RoastingRecorder: beanList prop changed:", beanList)
    setBeanListState(beanList)
  }, [beanList])

  // Added useEffect to update memo whenever it changes, syncing with parent
  useEffect(() => {
    console.log("[v0] Memo value changed:", memo)
    if (onMemoUpdate) {
      console.log("[v0] Calling onMemoUpdate with memo:", memo)
      onMemoUpdate(memo)
    }
  }, [memo, onMemoUpdate])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const handleTempClick = (temp: number) => {
    const timeStr = formatTime(elapsedTime)
    setTemps((prev) => ({ ...prev, [temp]: timeStr }))

    setLastRecordedTemp(temp)
    console.log("[v0] Temperature button clicked:", temp, "- lastRecordedTemp updated")

    if (temp === 180) {
      // Maillard time is already stored in frozen state, just update status
      setStatusMessage("곧 크랙 시작!")
    } else if (temp === 150) {
      setStatusMessage("Maillard Zone")
    } else if (temp === 182 || temp === 183) {
      setStatusMessage("CP - Development Zone 시작")
    }
  }

  const handleDischarge = () => {
    setIsRunning(false)
    setIsDischargePressed(true)
    const timeStr = formatTime(elapsedTime)
    setTemps((prev) => ({ ...prev, end: timeStr }))

    if (lastRecordedTemp !== undefined) {
      setFinalTemp(lastRecordedTemp.toString())
      console.log("[v0] Discharge pressed - Final temp set to:", lastRecordedTemp)
    } else {
      console.log("[v0] Discharge pressed - No lastRecordedTemp available")
    }

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
      setGreenWeight(value)
    } else {
      setGreenWeight(0)
    }
  }

  // Renamed from calculateFirstCrackToDevelopTime to calculateFirstCrackToDischargeTime
  const calculateFirstCrackToDischargeTime = () => {
    if (!firstCrackTime || !temps["end"]) return undefined

    const [fcMin, fcSec] = firstCrackTime.split(":").map(Number)
    const [endMin, endSec] = temps["end"].split(":").map(Number)

    const fcTotalSec = fcMin * 60 + fcSec
    const endTotalSec = endMin * 60 + endSec

    const diffSec = endTotalSec - fcTotalSec
    if (diffSec < 0) return undefined

    const min = Math.floor(diffSec / 60)
    const sec = diffSec % 60

    return `${min}:${sec.toString().padStart(2, "0")}`
  }

  const handleFirstCrack = () => {
    const timeStr = formatTime(elapsedTime)
    setFirstCrackTime(timeStr)
  }

  const handleSecondCrack = () => {
    const timeStr = formatTime(elapsedTime)
    setSecondCrackTime(timeStr)
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
    const green = Number.parseFloat(greenWeight.toString())
    const roasted = Number.parseFloat(roastedWeight.toString())

    if (!green || !roasted || green === 0) return undefined

    return Number(((roasted / green) * 100).toFixed(2))
  }

  const handleSaveRecord = () => {
    if (!beanName.trim() || greenWeight === 0) {
      // Validation updated
      alert("원두명과 투입량을 입력해주세요.")
      return
    }

    const maillardTime = calculateMaillardTime()
    const maillardPercent = calculateMaillardPercent()
    const developTime = calculateDevelopTime()
    const dtr = calculateDTR()
    const totalTime = temps["end"] || formatTime(elapsedTime)
    const yieldPercent = calculateYield()

    console.log("[v0] Saving record - finalTemp value:", finalTemp)
    console.log("[v0] Saving record - finalTemp as number:", finalTemp ? Number(finalTemp) : undefined)

    const newRecord: RoastingRecord = {
      id: editRecord?.id || Date.now().toString().slice(-5),
      date: roastDate,
      time: roastTime,
      beanName: beanName.trim(),
      beanOrigin: beanOrigin || undefined, // Added beanOrigin
      greenWeight,
      roastedWeight,
      yield: yieldPercent,
      fan1: fan1 ? Number(fan1) : undefined,
      heater: heater ? Number(heater) : undefined,
      fan2: fan2 ? Number(fan2) : undefined,
      temps,
      firstCrackTime: firstCrackTime || undefined,
      secondCrackTime: secondCrackTime || undefined,
      finalTemp: finalTemp ? Number(finalTemp) : undefined,
      maillardTime: maillardTime || undefined,
      developTime: developTime || undefined,
      dtr: dtr || undefined,
      totalTime,
      notes: notes || undefined,
      cuppingNotes: cuppingNotes || undefined,
      memo: memo || undefined,
      createdAt: editRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log("[v0] Complete record to be saved:", newRecord)

    onSave(newRecord)
    handleReset()
    setIsDischargePressed(false) // Reset discharge state
  }

  const handleReset = () => {
    setBeanName("")
    setGreenWeight(0)
    setRoastedWeight(0)
    setFan1("")
    setFan2("")
    setHeater("")
    setTemps({})
    setElapsedTime(0)
    setIsRunning(false)
    setNotes("")
    setCuppingNotes("")
    setMemo("")
    setRoastTime("")
    setRoastDate(new Date().toISOString().split("T")[0])
    setCurrentMaillardTime("")
    setCurrentMaillardPercent(undefined)
    setFirstCrackTime("")
    setSecondCrackTime("")
    setFinalTemp("")
    setYieldValue(undefined)
    setCustomGreenWeight("") // Reset custom green weight
    setShowCustomWeight(false) // Reset custom weight visibility
    setIsDischargePressed(false) // Reset discharge state
    setLastRecordedTemp(undefined) // Reset last recorded temp
    setMaillardFrozenTime("") // Reset frozen maillard time
    setMaillardFrozenPercent(undefined) // Reset frozen maillard percent
    setCurrentDevelopTime("") // Reset current develop time
    setCurrentDevelopPercent(undefined) // Reset current develop percent
  }

  const maillardTime = calculateMaillardTime()
  const developTime = calculateDevelopTime()
  const dtr = calculateDTR()
  const yieldPercent = calculateYield()

  const currentDevelopTimeCalc = calculateCurrentDevelopTime()
  const currentDTRCalc = calculateCurrentDTR()
  const maillardPercentCalc = calculateMaillardPercent()

  const highlightedTemps = [100, 130, 150, 180, 182, 183, 190]

  const displayMaillardTime = currentMaillardTime || maillardFrozenTime
  const displayMaillardPercent = currentMaillardPercent !== undefined ? currentMaillardPercent : maillardFrozenPercent

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
      {showFloating &&
        (temps["150"] || temps["182"] || temps["183"] || firstCrackTime) &&
        (isRunning || isDischargePressed) && (
          <div
            className="fixed z-50 cursor-move select-none"
            style={{
              top: floatingPosition.y === 0 ? "1rem" : `${floatingPosition.y}px`,
              left: floatingPosition.x === 0 ? "1rem" : `${floatingPosition.x}px`,
            }}
            onMouseDown={handleMouseDown}
          >
            <div className="relative">
              <button
                onClick={() => setShowFloating(false)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800/80 text-white rounded-full hover:bg-gray-900 flex items-center justify-center text-sm font-bold z-10"
                type="button"
              >
                ×
              </button>
              <div className="space-y-2">
                {(maillardFrozenTime || currentMaillardTime) && (
                  <div className="text-red-600 font-black text-6xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    M: {temps["180"] ? maillardFrozenTime : currentMaillardTime}
                    {temps["180"]
                      ? maillardFrozenPercent !== undefined && ` (${maillardFrozenPercent}%)`
                      : currentMaillardPercent !== undefined && ` (${currentMaillardPercent}%)`}
                  </div>
                )}
                {(temps["182"] || temps["183"]) && (
                  <div className="text-red-600 font-black text-6xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    D: {isRunning ? currentDevelopTimeCalc : calculateDevelopTime() || "0:00"}
                    {isRunning
                      ? currentDevelopPercent !== undefined && ` (${currentDevelopPercent}%)`
                      : calculateDTR() !== undefined && ` (${calculateDTR()}%)`}
                  </div>
                )}
                {firstCrackTime && (
                  <div className="text-blue-600 font-black text-6xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    1st→배출: {calculateFirstCrackToDischargeTime() || "계산중..."}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {!showFloating && (isRunning || isDischargePressed) && (
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  오늘
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
          </div>

          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-800 mb-3">투입량 (g)</label>
            <div className="flex gap-3 mb-3">
              {WEIGHT_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    if (option.value === 0) {
                      setShowCustomWeight(true)
                      setGreenWeight(0)
                    } else {
                      setShowCustomWeight(false)
                      setGreenWeight(option.value)
                    }
                  }}
                  className={`flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-sm ${
                    greenWeight === option.value && option.value !== 0
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
            {showCustomWeight && (
              <input
                type="number"
                value={customGreenWeight}
                onChange={(e) => {
                  setCustomGreenWeight(e.target.value)
                  setGreenWeight(Number(e.target.value))
                }}
                placeholder="직접 입력 (g)"
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-lg font-medium shadow-sm"
              />
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-700">원두명</label>
            <div className="flex items-center gap-4">
              <select
                value={beanName}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === "기타") {
                    setShowCustomBean(true)
                    setBeanName("") // Clear beanName when selecting "기타"
                  } else {
                    setShowCustomBean(false)
                    setBeanName(value)
                    const firstWord = value.split(" ")[0]
                    setBeanOrigin(firstWord)
                  }
                }}
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-lg font-medium shadow-sm"
              >
                <option value="">선택하세요</option>
                {beanListState.map((bean) => (
                  <option key={bean} value={bean}>
                    {bean}
                  </option>
                ))}
                <option value="기타">기타 (직접입력)</option>
              </select>
              {greenWeight > 0 && (
                <span className="text-lg font-semibold text-gray-700 whitespace-nowrap">{greenWeight}g</span>
              )}
            </div>
            {showCustomBean && (
              <input
                type="text"
                value={beanName} // Use beanName for custom input as well
                onChange={(e) => {
                  setBeanName(e.target.value)
                  const firstWord = e.target.value.split(" ")[0]
                  setBeanOrigin(firstWord)
                }}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-lg font-medium shadow-sm mt-3"
                placeholder="원두명 입력"
                maxLength={50}
              />
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
            <label className="block text-base font-semibold text-gray-700">배출량 (g) - 자동계산 85%</label>
            <input
              type="number"
              value={roastedWeight}
              onChange={(e) => setRoastedWeight(Number(e.target.value))}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-lg font-medium shadow-sm"
              placeholder="자동계산됨 (수정가능)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-base font-semibold text-gray-700">메모</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => {
                  console.log("[v0] Memo input changed to:", e.target.value)
                  setMemo(e.target.value)
                }}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-lg font-medium shadow-sm"
                placeholder="메모 입력 (로스팅목록에 표시됩니다)"
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

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">기본 세팅값</h3>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(presets || storedPresets).map((preset) => {
                  const presetNum = Number(preset)
                  return (
                    <button
                      key={preset}
                      onClick={() => handlePresetChange(presetNum)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        currentPreset === presetNum
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      type="button"
                    >
                      {presetNum} -{" "}
                      {presets ? presets[presetNum].name : storedPresets[presetNum].name || `세팅${presetNum}`}
                    </button>
                  )
                })}
                <button
                  onClick={handleAddPreset}
                  className="px-4 py-2 rounded-lg font-semibold bg-green-500 text-white hover:bg-green-600 transition-all"
                  type="button"
                >
                  + 추가
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">F1</label>
                <input
                  type="number"
                  value={fan1}
                  onChange={(e) => setFan1(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-lg font-medium shadow-sm"
                  placeholder="0-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ht</label>
                <input
                  type="number"
                  value={heater}
                  onChange={(e) => setHeater(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-lg font-medium shadow-sm"
                  placeholder="0-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">F2</label>
                <input
                  type="number"
                  value={fan2}
                  onChange={(e) => setFan2(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-lg font-medium shadow-sm"
                  placeholder="0-100"
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
              onClick={handleReset} // Use handleReset for reset functionality
              className="px-10 py-5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-bold text-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-md transform hover:scale-105"
              type="button"
            >
              리셋
            </button>
            <button
              onClick={handleFirstCrack}
              disabled={!isRunning || isDischargePressed} // Disable if not running or discharge pressed
              className="flex-1 px-8 py-4 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold text-lg shadow-lg transition-all transform hover:scale-105"
              type="button"
            >
              1st 크랙
            </button>
            <button
              onClick={handleDischarge}
              disabled={!isRunning || isDischargePressed} // Disable if not running or discharge pressed
              className="flex-1 px-8 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold text-lg shadow-lg transition-all transform hover:scale-105"
              type="button"
            >
              배출
            </button>
            <button
              onClick={handleSecondCrack}
              disabled={!isRunning || isDischargePressed} // Disable if not running or discharge pressed
              className="flex-1 px-8 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold text-lg shadow-lg transition-all transform hover:scale-105"
              type="button"
            >
              2nd 크랙
            </button>
          </div>

          {(firstCrackTime || secondCrackTime) && (
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
              <h3 className="text-lg font-bold text-orange-800 mb-2">크랙 기록</h3>
              <div className="space-y-1">
                {firstCrackTime && (
                  <p className="text-base font-semibold text-orange-700">1st 크랙: {firstCrackTime}</p>
                )}
                {secondCrackTime && (
                  <p className="text-base font-semibold text-orange-700">2nd 크랙: {secondCrackTime}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">온도 기록</h2>
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
            onClick={handleDischarge}
            disabled={!isRunning || isDischargePressed}
            className="px-12 py-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-2xl hover:from-red-600 hover:to-red-700 transition-all shadow-md transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
          onClick={handleSaveRecord}
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

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">배출 직전 최종 온도</h2>
        <div className="space-y-3">
          <label className="block text-base font-semibold text-gray-700">배출 직전 최종 온도(°C)</label>
          <div className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl bg-gray-50 text-lg font-bold text-gray-800">
            {finalTemp ? `${finalTemp}°C` : "배출 버튼을 누르면 자동 기록됩니다"}
          </div>
        </div>
      </div>
    </div>
  )
}
