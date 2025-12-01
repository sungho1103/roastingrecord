'use client';

import { useState, useEffect, useRef } from 'react';
import { RoastingRecord, TEMP_BUTTONS, WEIGHT_OPTIONS, DEFAULT_BEANS } from '../types';

interface RoastingRecorderProps {
  onSave: (record: RoastingRecord) => void;
  onCancel: () => void;
  editRecord?: RoastingRecord | null;
}

export default function RoastingRecorder({ onSave, onCancel, editRecord }: RoastingRecorderProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [temps, setTemps] = useState<{ [key: string]: string }>({});
  const [beanName, setBeanName] = useState('');
  const [customBeanName, setCustomBeanName] = useState('');
  const [showBeanInput, setShowBeanInput] = useState(false);
  const [beanOrigin, setBeanOrigin] = useState('');
  const [greenWeight, setGreenWeight] = useState('');
  const [selectedWeight, setSelectedWeight] = useState<number>(0);
  const [roastedWeight, setRoastedWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [cuppingNotes, setCuppingNotes] = useState('');
  const [beanList, setBeanList] = useState<string[]>([...DEFAULT_BEANS]);
  const [statusMessage, setStatusMessage] = useState('');
  const [fan1, setFan1] = useState('');
  const [heater, setHeater] = useState('');
  const [fan2, setFan2] = useState('');
  const [recordId, setRecordId] = useState('');
  const [roastTime, setRoastTime] = useState('');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // 수정 모드일 때 데이터 로드
  useEffect(() => {
    if (editRecord) {
      setBeanName(editRecord.beanName);
      setBeanOrigin(editRecord.beanOrigin || '');
      setGreenWeight(editRecord.greenWeight.toString());
      setRoastedWeight(editRecord.roastedWeight?.toString() || '');
      setNotes(editRecord.notes || '');
      setCuppingNotes(editRecord.cuppingNotes || '');
      setTemps(editRecord.temps);
      setFan1(editRecord.fan1?.toString() || '');
      setHeater(editRecord.heater?.toString() || '');
      setFan2(editRecord.fan2?.toString() || '');
      setRecordId(editRecord.id || '');
      setRoastTime(editRecord.time || '');
      
      if (editRecord.totalTime) {
        const [min, sec] = editRecord.totalTime.split(':').map(Number);
        setElapsedTime(min * 60 + sec);
      }
    }
  }, [editRecord]);

  // 로컬 스토리지에서 원두 리스트 로드
  useEffect(() => {
    const savedBeans = localStorage.getItem('bean-list');
    if (savedBeans) {
      setBeanList(JSON.parse(savedBeans));
    }
  }, []);

  // 타이머 로직
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000); // 1초마다 업데이트
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleTempClick = (temp: number) => {
    // 이미 기록된 온도를 다시 누르면 취소
    if (temps[temp]) {
      const { [temp]: removed, ...rest } = temps;
      setTemps(rest);
      setStatusMessage('❌ 온도 기록 취소됨');
      return;
    }

    const currentTime = formatTime(elapsedTime);
    setTemps(prev => ({
      ...prev,
      [temp]: currentTime
    }));

    // 상태 메시지 설정
    if (temp === 150) {
      setStatusMessage('⚡ Maillard Zone');
    } else if (temp === 180) {
      setStatusMessage('🔥 곧 크랙 시작!');
    } else if (temp === 182 || temp === 183) {
      setStatusMessage('💥 CP - Development Zone 시작');
    }
  };

  const handleEndRoast = () => {
    const endTime = formatTime(elapsedTime);
    setTemps(prev => ({
      ...prev,
      'end': endTime
    }));
    setIsRunning(false);
    setStatusMessage('✅ 로스팅 완료!');
  };

  const handleBeanChange = (value: string) => {
    setBeanName(value);
    if (value && value !== 'custom') {
      // 원두명의 첫 단어를 원산지로 자동 입력
      const firstWord = value.split(' ')[0];
      setBeanOrigin(firstWord);
    }
  };

  const handleAddBean = () => {
    if (customBeanName.trim()) {
      const newBeanList = [...beanList, customBeanName.trim()];
      setBeanList(newBeanList);
      localStorage.setItem('bean-list', JSON.stringify(newBeanList));
      setBeanName(customBeanName.trim());
      
      // 첫 단어를 원산지로
      const firstWord = customBeanName.trim().split(' ')[0];
      setBeanOrigin(firstWord);
      
      setCustomBeanName('');
      setShowBeanInput(false);
    }
  };

  const handleSetCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setRoastTime(`${hours}:${minutes}`);
  };

  const handleWeightChange = (value: number) => {
    setSelectedWeight(value);
    if (value > 0) {
      setGreenWeight(value.toString());
    } else {
      setGreenWeight('');
    }
  };

  const calculateMaillardTime = (): string | undefined => {
    const temp150 = temps['150'];
    const temp180 = temps['180'];
    
    if (!temp150 || !temp180) return undefined;
    
    const [min1, sec1] = temp150.split(':').map(Number);
    const [min2, sec2] = temp180.split(':').map(Number);
    const diff = (min2 * 60 + sec2) - (min1 * 60 + sec1);
    
    return formatTime(diff);
  };

  const calculateDevelopTime = (): string | undefined => {
    const temp183 = temps['183'];
    const endTemp = temps['end'];
    
    if (!temp183 || !endTemp) return undefined;
    
    const [min1, sec1] = temp183.split(':').map(Number);
    const [min2, sec2] = endTemp.split(':').map(Number);
    const diff = (min2 * 60 + sec2) - (min1 * 60 + sec1);
    
    return formatTime(diff);
  };

  const calculateDTR = (): number | undefined => {
    const developTime = calculateDevelopTime();
    const totalTime = temps['end'];
    
    if (!developTime || !totalTime) return undefined;
    
    const [dMin, dSec] = developTime.split(':').map(Number);
    const [tMin, tSec] = totalTime.split(':').map(Number);
    
    const dSeconds = dMin * 60 + dSec;
    const tSeconds = tMin * 60 + tSec;
    
    return Number(((dSeconds / tSeconds) * 100).toFixed(2));
  };

  const calculateYield = (): number | undefined => {
    const green = parseFloat(greenWeight);
    const roasted = parseFloat(roastedWeight);
    
    if (!green || !roasted) return undefined;
    
    return Number(((roasted / green) * 100).toFixed(2));
  };

  const handleSave = () => {
    if (!beanName || !greenWeight) {
      alert('원두명과 투입량은 필수입니다.');
      return;
    }

    const now = new Date().toISOString();
    const dateStr = new Date().toISOString().split('T')[0];
    
    const record: RoastingRecord = {
      id: recordId || editRecord?.id || `${Date.now()}`, // recordId를 최우선으로
      date: dateStr,
      time: roastTime || undefined,
      beanName,
      beanOrigin: beanOrigin || undefined,
      greenWeight: parseFloat(greenWeight),
      roastedWeight: roastedWeight ? parseFloat(roastedWeight) : undefined,
      yield: calculateYield(),
      fan1: fan1 ? parseFloat(fan1) : undefined,
      heater: heater ? parseFloat(heater) : undefined,
      fan2: fan2 ? parseFloat(fan2) : undefined,
      temps,
      maillardTime: calculateMaillardTime(),
      developTime: calculateDevelopTime(),
      dtr: calculateDTR(),
      totalTime: temps['end'],
      notes: notes || undefined,
      cuppingNotes: cuppingNotes || undefined,
      createdAt: editRecord?.createdAt || now,
      updatedAt: now,
    };

    onSave(record);
  };

  const maillardTime = calculateMaillardTime();
  const developTime = calculateDevelopTime();
  const dtr = calculateDTR();
  const yieldPercent = calculateYield();

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* 기본 정보 카드 - 파스텔 톤 */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl shadow-md border border-purple-200 p-6 space-y-5">
        <h2 className="text-3xl font-bold text-purple-700 flex items-center gap-2">
          ☕ {editRecord ? '로스팅 기록 수정' : '새 로스팅 기록'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 날짜 + 시간 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              로스팅 시작 시간
            </label>
            <div className="flex gap-2">
              <input
                type="time"
                value={roastTime}
                onChange={(e) => setRoastTime(e.target.value)}
                className="flex-1 px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-300 bg-white text-lg"
                placeholder="HH:MM"
              />
              <button
                onClick={handleSetCurrentTime}
                className="px-4 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all shadow-sm"
                type="button"
              >
                현재시간
              </button>
            </div>
          </div>
          
          {/* ID (사용자 직접 입력만) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ID (선택사항)
            </label>
            <input
              type="text"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-300 bg-white text-lg"
              placeholder="직접 입력 (선택)"
              maxLength={20}
            />
          </div>
          
          {/* 원두명 드롭다운 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              원두명 *
            </label>
            <div className="flex gap-2">
              <select
                value={beanName}
                onChange={(e) => handleBeanChange(e.target.value)}
                className="flex-1 px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-300 bg-white text-lg"
              >
                <option value="">선택하세요</option>
                {beanList.map((bean) => (
                  <option key={bean} value={bean}>{bean}</option>
                ))}
              </select>
              <button
                onClick={() => setShowBeanInput(!showBeanInput)}
                className="px-4 py-3 bg-gradient-to-r from-blue-300 to-cyan-300 text-white rounded-xl font-semibold hover:from-blue-400 hover:to-cyan-400 transition-all shadow-sm"
                title="원두 추가"
                type="button"
              >
                + 추가
              </button>
            </div>
            
            {showBeanInput && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={customBeanName}
                  onChange={(e) => setCustomBeanName(e.target.value)}
                  placeholder="새 원두명 입력"
                  className="flex-1 px-4 py-2 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-300"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddBean()}
                />
                <button
                  onClick={handleAddBean}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
                >
                  추가
                </button>
              </div>
            )}
          </div>
          
          {/* 원산지 (자동 입력) */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              원산지 (자동 입력됨)
            </label>
            <input
              type="text"
              value={beanOrigin}
              onChange={(e) => setBeanOrigin(e.target.value)}
              className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-amber-50 text-lg font-semibold"
              placeholder="자동으로 채워집니다"
            />
          </div>
          
          {/* 투입량 드롭다운 */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              투입량 (g) *
            </label>
            <select
              value={selectedWeight}
              onChange={(e) => handleWeightChange(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white text-lg font-semibold"
            >
              <option value="">선택하세요</option>
              {WEIGHT_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
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
                className="w-full mt-2 px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 text-lg font-semibold"
              />
            )}
          </div>
          
          {/* 배출량 */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              배출량 (g)
            </label>
            <input
              type="number"
              value={roastedWeight}
              onChange={(e) => setRoastedWeight(e.target.value)}
              className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white text-lg font-semibold"
              placeholder="425"
            />
            {yieldPercent && (
              <p className="text-sm font-bold text-green-700 mt-2 bg-green-100 inline-block px-3 py-1 rounded-full">
                ✅ 수율: {yieldPercent}%
              </p>
            )}
          </div>
        </div>
        
        {/* 초기 세팅값 */}
        <div className="border-t-2 border-amber-200 pt-5">
          <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
            ⚙️ 초기 세팅값
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                FAN1
              </label>
              <input
                type="number"
                value={fan1}
                onChange={(e) => setFan1(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-lg font-semibold"
                placeholder="예: 3"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Heater
              </label>
              <input
                type="number"
                value={heater}
                onChange={(e) => setHeater(e.target.value)}
                className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 bg-white text-lg font-semibold"
                placeholder="예: 4"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                FAN2
              </label>
              <input
                type="number"
                value={fan2}
                onChange={(e) => setFan2(e.target.value)}
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-lg font-semibold"
                placeholder="예: 5"
                step="0.1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 타이머 및 온도 기록 카드 - 파스텔 톤 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-md border border-indigo-200 p-8 space-y-6">
        <h3 className="text-3xl font-bold text-indigo-600 flex items-center gap-3">
          ⏱️ 로스팅 타이머
        </h3>
        
        {/* 타이머 디스플레이 */}
        <div className="text-center bg-white rounded-3xl p-8 border-2 border-indigo-200 shadow-inner">
          <div className="text-9xl md:text-[12rem] font-mono font-black text-indigo-600 mb-4 tracking-wider">
            {formatTime(elapsedTime)}
          </div>
          
          {/* 상태 메시지 */}
          {statusMessage && (
            <div className="text-2xl font-bold text-indigo-700 bg-gradient-to-r from-pink-100 to-purple-100 px-6 py-4 rounded-2xl mb-4 border border-purple-200">
              {statusMessage}
            </div>
          )}
          
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-10 py-5 rounded-2xl font-bold text-white text-xl shadow-md transition-all transform hover:scale-105 ${
                isRunning 
                  ? 'bg-gradient-to-r from-red-300 to-pink-300 hover:from-red-400 hover:to-pink-400' 
                  : 'bg-gradient-to-r from-green-300 to-emerald-300 hover:from-green-400 hover:to-emerald-400'
              }`}
            >
              {isRunning ? '⏸️ 일시정지' : '▶️ 시작'}
            </button>
            
            <button
              onClick={() => {
                setIsRunning(false);
                setElapsedTime(0);
                setTemps({});
                setStatusMessage('');
              }}
              className="px-10 py-5 rounded-2xl font-bold bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 hover:from-gray-300 hover:to-gray-400 text-xl shadow-md transition-all transform hover:scale-105"
            >
              🔄 리셋
            </button>
          </div>
        </div>

        {/* 온도 버튼들 - 더 크게, 파스텔 톤 */}
        <div className="space-y-4">
          <h4 className="font-bold text-indigo-600 text-2xl">🌡️ 온도 기록 (다시 누르면 취소)</h4>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {TEMP_BUTTONS.map((temp) => (
              <button
                key={temp}
                onClick={() => handleTempClick(temp)}
                disabled={!isRunning && !temps[temp]}
                className={`px-5 py-6 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-md ${
                  temps[temp]
                    ? 'bg-gradient-to-br from-orange-200 to-pink-200 text-orange-800 border-2 border-orange-300 scale-105'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 hover:from-gray-200 hover:to-gray-300 border-2 border-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="text-2xl font-black">{temp}°</div>
                {temps[temp] && (
                  <div className="text-sm mt-1 font-mono bg-white bg-opacity-70 px-2 py-1 rounded">
                    {temps[temp]}
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* 배출 버튼 - 매우 크게, 파스텔 톤 */}
          <button
            onClick={handleEndRoast}
            disabled={!isRunning}
            className={`w-full px-8 py-8 rounded-3xl font-black text-white text-3xl shadow-lg transition-all transform hover:scale-[1.02] ${
              temps['end']
                ? 'bg-gradient-to-r from-purple-300 to-pink-300 border-2 border-purple-400'
                : 'bg-gradient-to-r from-blue-300 to-cyan-300 hover:from-blue-400 hover:to-cyan-400 border-2 border-blue-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {temps['end'] ? `✅ 배출 완료 (${temps['end']})` : '🔥 배출'}
          </button>
        </div>

        {/* 자동 계산 구간 - 파스텔 톤 */}
        <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-6 space-y-3 border-2 border-orange-200 shadow-md">
          <h4 className="font-black text-orange-700 text-2xl flex items-center gap-2">
            📊 자동 계산
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-orange-200 shadow-sm">
              <span className="text-gray-600 font-semibold block text-sm">전체 로스팅 시간</span>
              <span className="text-3xl font-black text-orange-600 block mt-1">
                {temps['end'] || '-'}
              </span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-orange-200 shadow-sm">
              <span className="text-gray-600 font-semibold block text-sm">메일라드 (150-180°C)</span>
              <span className="text-3xl font-black text-orange-600 block mt-1">
                {maillardTime || '-'}
              </span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-orange-200 shadow-sm">
              <span className="text-gray-600 font-semibold block text-sm">디벨롭 (183-배출)</span>
              <span className="text-3xl font-black text-orange-600 block mt-1">
                {developTime || '-'}
              </span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-orange-200 shadow-sm">
              <span className="text-gray-600 font-semibold block text-sm">DTR</span>
              <span className="text-3xl font-black text-orange-600 block mt-1">
                {dtr ? `${dtr}%` : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 메모 카드 - 파스텔 톤 */}
      <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl shadow-md border border-teal-200 p-6 space-y-4">
        <h3 className="text-2xl font-bold text-teal-700 flex items-center gap-2">
          📝 메모
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              로스팅 메모
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-base"
              placeholder="로스팅 중 특이사항, 프로파일 변경사항 등..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              컵핑 노트
            </label>
            <textarea
              value={cuppingNotes}
              onChange={(e) => setCuppingNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white text-base"
              placeholder="향미, 바디, 산미, 후미 등..."
            />
          </div>
        </div>
      </div>

      {/* 저장/취소 버튼 */}
      <div className="flex gap-4 sticky bottom-4">
        <button
          onClick={handleSave}
          className="flex-1 px-8 py-6 bg-gradient-to-r from-green-300 to-emerald-300 text-white rounded-3xl font-black text-xl hover:from-green-400 hover:to-emerald-400 shadow-lg transition-all transform hover:scale-[1.02] border-2 border-green-400"
        >
          💾 저장
        </button>
        <button
          onClick={onCancel}
          className="px-8 py-6 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-3xl font-black text-xl hover:from-gray-300 hover:to-gray-400 shadow-md transition-all"
        >
          ❌ 취소
        </button>
      </div>
    </div>
  );
}
