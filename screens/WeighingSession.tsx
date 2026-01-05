
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FarmerTicket, WeightItem, AppSettings } from '../types';
import { formatNumber } from '../utils/format';

interface Props {
  tickets: FarmerTicket[];
  settings: AppSettings;
  onUpdate: (id: string, updates: Partial<FarmerTicket>) => void;
}

const ROWS_PER_TABLE = 5;
const COLS_PER_TABLE = 5;
const BAGS_PER_TABLE = 25; // 5x5
const TABLES_PER_PAGE = 3; // 3 tables = 75 bags
const GROUP_SIZE_75 = 75;

const WeighingSession: React.FC<Props> = ({ tickets, settings, onUpdate }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ticket = tickets.find(t => t.id === id);
  
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!ticket) return null;

  const grossWeight = ticket.weights.reduce((sum, w) => sum + w.value, 0);
  const totalBags = ticket.weights.length;

  // Tự động cuộn đến ô đang hoạt động
  useEffect(() => {
    if (scrollRef.current && keyboardVisible) {
      const activeEl = scrollRef.current.querySelector('.active-slot');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [totalBags, editingId, isUnlocked, keyboardVisible]);

  const speak = (text: string) => {
    if (settings.isVoiceEnabled && 'speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'vi-VN';
      msg.rate = 1.2; 
      msg.volume = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(msg);
    }
  };

  const handleKeyClick = (key: string) => {
    if (key === 'hide') {
      setKeyboardVisible(false);
    } else if (key === 'backspace') {
      setInputValue(prev => prev.slice(0, -1));
    } else {
      if (inputValue.length < 3) {
        setInputValue(prev => prev + key);
      }
    }
  };

  const handleSave = () => {
    if (!inputValue) return;
    const val = Number(inputValue) / 10;
    
    let currentCount = totalBags;
    let voiceMessage = val.toString().replace('.', ' phẩy ');

    if (editingId) {
      onUpdate(ticket.id, {
        weights: ticket.weights.map(w => w.id === editingId ? { ...w, value: val } : w)
      });
      setEditingId(null);
    } else {
      const newItem: WeightItem = {
        id: Date.now().toString(),
        value: val,
        timestamp: Date.now(),
      };
      onUpdate(ticket.id, { weights: [...ticket.weights, newItem] });
      currentCount++;

      // Thông báo khi hết 1 cột (5 bao)
      if (currentCount > 0 && currentCount % ROWS_PER_TABLE === 0) {
        voiceMessage += ". hết một cột.";
      }
    }
    
    setInputValue('');
    speak(voiceMessage);
  };

  const startEdit = (w: WeightItem) => {
    setEditingId(w.id);
    setInputValue(''); 
    setKeyboardVisible(true);
  };

  const getWeightAt = (tableIdx: number, row: number, col: number) => {
    const globalIdx = (tableIdx * BAGS_PER_TABLE) + (col * ROWS_PER_TABLE) + row;
    return ticket.weights[globalIdx];
  };

  const renderTable = (tableIdx: number) => {
    const tableWeights = ticket.weights.slice(tableIdx * BAGS_PER_TABLE, (tableIdx + 1) * BAGS_PER_TABLE);
    const tableSum = tableWeights.reduce((s, w) => s + w.value, 0);
    
    const colSums = Array(COLS_PER_TABLE).fill(0).map((_, c) => {
      let sum = 0;
      for (let r = 0; r < ROWS_PER_TABLE; r++) {
        const w = getWeightAt(tableIdx, r, c);
        if (w) sum += w.value;
      }
      return sum;
    });

    const nextIdx = ticket.weights.length;
    const nextTable = Math.floor(nextIdx / BAGS_PER_TABLE);
    const nextRem = nextIdx % BAGS_PER_TABLE;
    const nextCol = Math.floor(nextRem / ROWS_PER_TABLE);
    const nextRow = nextRem % ROWS_PER_TABLE;

    return (
      <div key={`table-${tableIdx}`} className="mb-8 bg-[#0a1a0a] rounded-xl overflow-hidden border border-[#1a3a1a] shadow-lg">
        <div className="bg-[#153515] p-3 flex justify-between items-center border-b border-[#1a4a1a]">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-sm">grid_view</span>
            <span className="font-black uppercase text-xs tracking-widest">BẢNG {tableIdx + 1}</span>
          </div>
          <span className="text-white font-mono text-3xl font-black">{formatNumber(tableSum)}</span>
        </div>

        <div className="grid grid-cols-5 px-1.5 pt-2">
          {Array(5).fill(0).map((_, i) => (
            <div key={`cap-${i}`} className="text-center text-[10px] font-bold text-gray-400 uppercase">C{i+1}</div>
          ))}
        </div>

        <div className="p-1.5 grid grid-cols-5 gap-1.5">
          {Array(ROWS_PER_TABLE * COLS_PER_TABLE).fill(0).map((_, i) => {
            const visualRow = Math.floor(i / COLS_PER_TABLE);
            const visualCol = i % COLS_PER_TABLE;
            const weight = getWeightAt(tableIdx, visualRow, visualCol);
            
            const isNext = !editingId && tableIdx === nextTable && visualRow === nextRow && visualCol === nextCol;
            const isEditing = weight && editingId === weight.id;
            const isActive = isNext || isEditing;

            return (
              <button
                key={`${tableIdx}-${i}`}
                onClick={() => {
                  if (isUnlocked) {
                    if (weight) startEdit(weight);
                    else setKeyboardVisible(true);
                  }
                }}
                className={`h-16 rounded-lg flex items-center justify-center font-mono text-2xl font-black transition-all border ${
                  isActive ? 'border-red-500 ring-4 ring-red-500/50 bg-[#2a1a1a] active-slot shadow-[0_0_20px_rgba(239,68,68,0.6)] z-10' : 
                  weight ? 'bg-[#1a2a1a] border-[#2a3a2a] text-white' : 
                  'bg-[#050a05] border-[#101a10] text-gray-800'
                }`}
              >
                {weight ? formatNumber(weight.value) : (isNext ? '?' : '')}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-5 bg-[#0d210d] border-t-2 border-[#1a3a1a]">
          {colSums.map((sum, c) => (
            <div key={`sum-${c}`} className="text-center font-mono h-20 flex flex-col items-center justify-center border-r border-[#1a3a1a] last:border-r-0">
              <span className="text-xl font-black text-yellow-500 leading-none">
                {sum > 0 ? formatNumber(sum) : '---'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const tableCount = Math.max(1, Math.ceil((ticket.weights.length + 1) / BAGS_PER_TABLE));
  
  const renderListWithPages = () => {
    const elements: React.ReactElement[] = [];
    for (let i = 0; i < tableCount; i++) {
      elements.push(renderTable(i));
      
      if ((i + 1) % TABLES_PER_PAGE === 0 || i === tableCount - 1) {
        const startBag = Math.floor(i / TABLES_PER_PAGE) * GROUP_SIZE_75 + 1;
        const endBag = Math.min((Math.floor(i / TABLES_PER_PAGE) + 1) * GROUP_SIZE_75, totalBags);
        const pageWeights = ticket.weights.slice(startBag - 1, endBag);
        const pageSum = pageWeights.reduce((s, w) => s + w.value, 0);
        
        if (pageWeights.length > 0) {
          elements.push(
            <div key={`page-summary-${i}`} className="mb-12 px-5 py-5 bg-primary/10 border-y-2 border-primary/20 rounded-xl flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-black text-primary uppercase tracking-wider">TỔNG TRANG {Math.floor(i / TABLES_PER_PAGE) + 1}</span>
                <span className="text-[10px] text-gray-400 font-bold">Bao {startBag} - {endBag}</span>
              </div>
              <span className="text-4xl font-black font-mono text-white">{formatNumber(pageSum)}</span>
            </div>
          );
        }
      }
    }
    return elements;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      <header className="flex-none bg-[#102210] p-4 shadow-xl z-20 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="text-center">
            <h2 className="text-lg text-white font-black uppercase tracking-widest italic">{ticket.name}</h2>
          </div>
          <div className="w-10" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1a2a1a] p-3 rounded-2xl text-center border border-white/5 shadow-inner">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Số bao</p>
            <p className="text-4xl font-black font-mono text-primary leading-none">{totalBags}</p>
          </div>
          <div className="bg-[#1a2a1a] p-3 rounded-2xl text-center border border-white/5 shadow-inner">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Tổng Thô (kg)</p>
            <p className="text-4xl font-black font-mono leading-none">{formatNumber(grossWeight)}</p>
          </div>
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden">
        {!isUnlocked && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl z-30 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20 ring-8 ring-primary/5">
              <span className="material-symbols-outlined text-primary text-5xl">lock</span>
            </div>
            <h3 className="text-2xl font-black mb-2 uppercase italic tracking-tighter">BẢO MẬT CÂN</h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm">Bấm nút để mở khóa bàn phím nhập mã lúa</p>
            <button 
              onClick={() => setIsUnlocked(true)}
              className="w-full h-16 bg-primary text-black font-black rounded-3xl text-lg shadow-2xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined font-black">lock_open</span>
              MỞ KHÓA NGAY
            </button>
          </div>
        )}

        <main ref={scrollRef} className="h-full overflow-y-auto p-4 no-scrollbar bg-[#050c05]">
          {renderListWithPages()}
          <div className="h-[35rem]" />
        </main>

        {!keyboardVisible && isUnlocked && (
          <button 
            onClick={() => setKeyboardVisible(true)}
            className="fixed bottom-10 right-6 w-16 h-16 bg-primary text-black rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 active:scale-90 transition-all z-50 border-4 border-black"
          >
            <span className="material-symbols-outlined text-4xl font-black">keyboard</span>
          </button>
        )}
      </div>

      {isUnlocked && keyboardVisible && (
        <footer className="flex-none bg-[#111] border-t border-white/10 p-2 pb-6 shadow-[0_-20px_40px_rgba(0,0,0,0.8)] z-40">
          <div className="flex items-center justify-between px-6 py-4 bg-[#222] rounded-2xl mb-3 border border-white/5">
            <div className="flex flex-col">
              <span className="text-[10px] text-primary font-black uppercase tracking-widest mb-0.5">
                {editingId ? `Sửa #${ticket.weights.findIndex(w => w.id === editingId) + 1}` : `Mã #${totalBags + 1}`}
              </span>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Nhập 3 số</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-5xl font-black font-mono tracking-tighter text-white">
                {inputValue.length === 0 ? '0' : formatNumber(Number(inputValue) / 10)}
              </span>
              <span className="animate-pulse w-1.5 h-10 bg-primary rounded-full" />
              <span className="text-sm font-black text-gray-600">KG</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 h-72">
            {[1, 2, 3].map(n => (
              <button key={n} onClick={() => handleKeyClick(n.toString())} className="bg-white/5 rounded-2xl text-4xl font-black active:bg-white/20 active:scale-90 transition-all border border-white/5">{n}</button>
            ))}
            <button onClick={() => handleKeyClick('backspace')} className="bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center active:bg-red-500/20 active:scale-90 transition-all border border-red-500/10">
              <span className="material-symbols-outlined text-4xl">backspace</span>
            </button>
            
            {[4, 5, 6].map(n => (
              <button key={n} onClick={() => handleKeyClick(n.toString())} className="bg-white/5 rounded-2xl text-4xl font-black active:bg-white/20 active:scale-90 transition-all border border-white/5">{n}</button>
            ))}
            <button 
              onClick={handleSave} 
              disabled={inputValue.length === 0}
              className={`row-span-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-2xl ${
                inputValue.length > 0 ? 'bg-primary text-black shadow-primary/40 active:scale-95' : 'bg-gray-800 text-gray-600 opacity-50'
              }`}
            >
              <span className="material-symbols-outlined font-black text-5xl">check_circle</span>
              <span className="text-xs font-black uppercase tracking-widest">LƯU</span>
            </button>
            
            {[7, 8, 9].map(n => (
              <button key={n} onClick={() => handleKeyClick(n.toString())} className="bg-white/5 rounded-2xl text-4xl font-black active:bg-white/20 active:scale-90 transition-all border border-white/5">{n}</button>
            ))}
            
            <button 
              onClick={() => handleKeyClick('hide')} 
              className="bg-gray-800 rounded-2xl flex flex-col items-center justify-center active:bg-gray-700 active:scale-90 transition-all border border-white/5"
            >
              <span className="material-symbols-outlined text-gray-400 text-2xl">keyboard_hide</span>
              <span className="text-[8px] font-black text-gray-500 uppercase mt-1">Ẩn</span>
            </button>
            <button key="0" onClick={() => handleKeyClick('0')} className="bg-white/5 rounded-2xl text-4xl font-black active:bg-white/20 active:scale-90 transition-all border border-white/5">0</button>
            <button 
              onClick={() => { setEditingId(null); setInputValue(''); }} 
              className="bg-gray-800 rounded-2xl text-[10px] font-black text-gray-500 active:bg-gray-700 active:scale-90 transition-all uppercase px-1 leading-tight"
            >
              Hủy sửa
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default WeighingSession;
