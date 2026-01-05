
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const Settings: React.FC<Props> = ({ settings, onUpdate }) => {
  const navigate = useNavigate();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onUpdate(localSettings);
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 pt-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold">Cài Đặt Chung</h1>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {/* Tare Section */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">CÔNG THỨC TRỪ BÌ MẶC ĐỊNH</h2>
          <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-2">Số lượng bao</label>
                <input 
                  type="number"
                  className="w-full bg-input-dark border-none rounded-xl h-14 text-center text-xl font-bold focus:ring-1 focus:ring-primary"
                  value={localSettings.defaultTare.bagsRatio}
                  onChange={(e) => setLocalSettings({
                    ...localSettings, 
                    defaultTare: { ...localSettings.defaultTare, bagsRatio: Number(e.target.value) }
                  })}
                />
              </div>
              <div className="pt-6 font-bold text-gray-600">=</div>
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-2">Số kg trừ</label>
                <div className="relative">
                  <input 
                    type="number"
                    className="w-full bg-input-dark border-none rounded-xl h-14 text-center text-xl font-bold focus:ring-1 focus:ring-primary pr-10"
                    value={localSettings.defaultTare.deductionKg}
                    onChange={(e) => setLocalSettings({
                      ...localSettings, 
                      defaultTare: { ...localSettings.defaultTare, deductionKg: Number(e.target.value) }
                    })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500">KG</span>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 flex gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">lightbulb</span>
              <p className="text-xs text-gray-300">
                Cứ <span className="text-white font-bold">{localSettings.defaultTare.bagsRatio} bao</span> sẽ trừ <span className="text-white font-bold">{localSettings.defaultTare.deductionKg}kg</span> bì.
              </p>
            </div>
          </div>
        </section>

        {/* Audio Section */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">ÂM THANH</h2>
          <div className="bg-surface-dark rounded-2xl border border-white/5 divide-y divide-white/5">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-input-dark rounded-full flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">volume_up</span>
                </div>
                <div>
                  <p className="font-medium">Đọc số cân</p>
                  <p className="text-xs text-gray-500">Tự động phát âm thanh khi lưu</p>
                </div>
              </div>
              <button 
                onClick={() => setLocalSettings({ ...localSettings, isVoiceEnabled: !localSettings.isVoiceEnabled })}
                className={`w-12 h-7 rounded-full transition-colors relative ${localSettings.isVoiceEnabled ? 'bg-primary' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 size-5 bg-white rounded-full transition-all ${localSettings.isVoiceEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        <div className="pt-4 opacity-30 text-center">
          <p className="text-xs">Cân Lúa Pro v1.0.0</p>
        </div>
      </main>

      <footer className="p-4 pb-8">
        <button 
          onClick={handleSave}
          className="w-full bg-primary text-black font-bold h-14 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          Lưu Cài Đặt
        </button>
      </footer>
    </div>
  );
};

export default Settings;
