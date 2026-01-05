
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSettings, FarmerTicket } from '../types';

interface Props {
  settings: AppSettings;
  onAdd: (ticket: FarmerTicket) => void;
}

const CreateTicket: React.FC<Props> = ({ settings, onAdd }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('9200');
  const [tareConfig, setTareConfig] = useState(settings.defaultTare);

  const handleCreate = () => {
    if (!name.trim()) return alert('Vui lòng nhập tên nông dân');
    
    const newTicket: FarmerTicket = {
      id: Date.now().toString(),
      name: name.trim(),
      price: Number(price.replace(/\D/g, '')),
      tareConfig,
      weights: [],
      status: 'active',
      createdAt: Date.now(),
    };

    onAdd(newTicket);
    navigate(`/weigh/${newTicket.id}`);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 pt-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h1 className="text-xl font-bold">Tạo Phiếu Cân Mới</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 p-4 space-y-6 overflow-y-auto no-scrollbar">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">person</span>
            <h2 className="text-sm font-bold uppercase text-gray-400">Thông tin nông dân</h2>
          </div>
          <div className="bg-surface-dark p-4 rounded-2xl border border-white/5">
            <label className="text-xs text-gray-500 mb-2 block">Tên chủ ruộng / Nông dân</label>
            <input 
              type="text"
              placeholder="Ví dụ: Chú Bảy, Anh Tư..."
              className="w-full bg-input-dark border-none rounded-xl h-12 px-4 focus:ring-1 focus:ring-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">payments</span>
            <h2 className="text-sm font-bold uppercase text-gray-400">Đơn giá</h2>
          </div>
          <div className="bg-surface-dark p-4 rounded-2xl border border-white/5">
            <label className="text-xs text-gray-500 mb-2 block">Giá lúa hôm nay (VNĐ/kg)</label>
            <div className="relative">
              <input 
                type="tel"
                className="w-full bg-input-dark border-none rounded-xl h-14 px-4 text-xl font-bold focus:ring-1 focus:ring-primary pr-12"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">đ/kg</span>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">scale</span>
            <h2 className="text-sm font-bold uppercase text-gray-400">Cấu hình trừ bì (Tare)</h2>
          </div>
          <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 space-y-4">
             <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-2 text-center">Trừ (kg)</label>
                <input 
                  type="number"
                  className="w-full bg-input-dark border-none rounded-xl h-12 text-center font-bold focus:ring-1 focus:ring-primary"
                  value={tareConfig.deductionKg}
                  onChange={(e) => setTareConfig({ ...tareConfig, deductionKg: Number(e.target.value) })}
                />
              </div>
              <div className="pt-6 font-bold text-gray-600">cho</div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-2 text-center">Mỗi (bao)</label>
                <input 
                  type="number"
                  className="w-full bg-input-dark border-none rounded-xl h-12 text-center font-bold focus:ring-1 focus:ring-primary"
                  value={tareConfig.bagsRatio}
                  onChange={(e) => setTareConfig({ ...tareConfig, bagsRatio: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="p-4 pb-8">
        <button 
          onClick={handleCreate}
          className="w-full bg-primary text-black font-bold h-14 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          Bắt đầu cân <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </footer>
    </div>
  );
};

export default CreateTicket;
