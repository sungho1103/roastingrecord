'use client';

import { useState, useEffect, useRef } from 'react';
import { RoastingRecord, TEMP_BUTTONS } from '../types';

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
  const [beanOrigin, setBeanOrigin] = useState('');
  const [greenWeight, setGreenWeight] = useState('');
  const [roastedWeight, setRoastedWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [cuppingNotes, setCuppingNotes] = useState('');
  
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
      
      // 총 시간을 초로 변환
      if (editRecord.totalTime) {
        const [min, sec] = editRecord.totalTime.split(':').map(Number);
        setElapsedTime(min * 60 + sec);
      }
    }
  }, [editRecord]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);
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
    const currentTime = formatTime(elapsedTime);
    setTemps(prev => ({
      ...prev,
      [temp]: currentTime
    }));
  };

  const handleEndRoast = () => {
    const endTime = formatTime(elapsedTime);
    setTemps(prev => ({
      ...prev,
      'end': endTime
    }));
    setIsRunning(false);
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
      id: editRecord?.id || String(Math.floor(10000 + Math.random() * 90000)),
      date: dateStr,
      beanName,
      beanOrigin: beanOrigin || undefined,
      greenWeight: parseFloat(greenWeight),
      roastedWeight: roastedWeight ? parseFloat(roastedWeight) : undefined,
      yield: calculateYield(),
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
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* 기본 정보 */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {editRecord ? '로스팅 기록 수정' : '새 로스팅 기록'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              원두명 *
            </label>
            <input
              type="text"
              value={beanName}
              onChange={(e) => setBeanName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
              placeholder="예: 에티오피아 예가체프"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              원산지
            </label>
            <input
              type="text"
              value={beanOrigin}
              onChange={(e) => setBeanOrigin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
              placeholder="예: Ethiopia"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              투입량 (g) *
            </label>
            <input
              type="number"
              value={greenWeight}
              onChange={(e) => setGreenWeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
              placeholder="500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              배출량 (g)
            </label>
            <input
              type="number"
              value={roastedWeight}
              onChange={(e) => setRoastedWeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
              placeholder="425"
            />
            {yieldPercent && (
              <p className="text-sm text-gray-600 mt-1">수율: {yieldPercent}%</p>
            )}
          </div>
        </div>
      </div>


      {/* 타이머 및 온도 기록 */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-800">로스팅 타이머</h3>
        
        {/* 타이머 디스플레이 */}
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-amber-600 mb-4">
            {formatTime(elapsedTime)}
          </div>
          
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-6 py-3 rounded-lg font-semibold text-white ${
                isRunning 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isRunning ? '일시정지' : '시작'}
            </button>
            
            <button
              onClick={() => {
                setIsRunning(false);
                setElapsedTime(0);
                setTemps({});
              }}
              className="px-6 py-3 rounded-lg font-semibold text-white bg-gray-500 hover:bg-gray-600"
            >
              리셋
            </button>
          </div>
        </div>

        {/* 온도 버튼들 */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700">온도 기록</h4>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {TEMP_BUTTONS.map((temp) => (
              <button
                key={temp}
                onClick={() => handleTempClick(temp)}
                disabled={!isRunning && !temps[temp]}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  temps[temp]
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                <div className="text-sm">{temp}°C</div>
                {temps[temp] && (
                  <div className="text-xs mt-1">{temps[temp]}</div>
                )}
              </button>
            ))}
          </div>
          
          {/* 배출 버튼 */}
          <button
            onClick={handleEndRoast}
            disabled={!isRunning}
            className={`w-full px-6 py-4 rounded-lg font-bold text-white text-lg ${
              temps['end']
                ? 'bg-purple-500'
                : 'bg-blue-500 hover:bg-blue-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {temps['end'] ? `배출 완료 (${temps['end']})` : '배출'}
          </button>
        </div>

        {/* 자동 계산 구간 */}
        <div className="bg-amber-50 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-gray-800">자동 계산</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">메일라드 (150-180°C):</span>
              <span className="ml-2 font-semibold text-amber-700">
                {maillardTime || '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">디벨롭 (183-배출):</span>
              <span className="ml-2 font-semibold text-amber-700">
                {developTime || '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">DTR:</span>
              <span className="ml-2 font-semibold text-amber-700">
                {dtr ? `${dtr}%` : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 메모 */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            로스팅 메모
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
            placeholder="로스팅 중 특이사항, 프로파일 변경사항 등..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            컵핑 노트
          </label>
          <textarea
            value={cuppingNotes}
            onChange={(e) => setCuppingNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
            placeholder="향미, 바디, 산미, 후미 등..."
          />
        </div>
      </div>

      {/* 저장/취소 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700"
        >
          저장
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
        >
          취소
        </button>
      </div>
    </div>
  );
}
