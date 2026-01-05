
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppState, FarmerTicket } from '../types';
import { formatDate, formatCurrency, formatNumber } from '../utils/format';

interface Props {
  state: AppState;
  onDelete: (id: string) => void;
}

const FarmerList: React.FC<Props> = ({ state, onDelete }) => {
  const navigate = useNavigate();
  const [ticketToDelete, setTicketToDelete] = useState<FarmerTicket | null>(null);

  const getTicketStats = (ticket: FarmerTicket) => {
    const gross = ticket.weights.reduce((sum, w) => sum + w.value, 0);
    const bags = ticket.weights.length;
    const tare = (bags / ticket.tareConfig.bagsRatio) * ticket.tareConfig.deductionKg;
    const net = Math.max(0, gross - tare);
    const total = net * ticket.price;
    return { gross, bags, tare, net, total };
  };

  const confirmDelete = () => {
    if (ticketToDelete) {
      onDelete(ticketToDelete.id);
      setTicketToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-dark">
      {/* Header */}
      <header className="p-4 pt-6 bg-background-dark flex items-center justify-between z-10">
        <h1 className="text-2xl font-black tracking-tight">Danh Sách Nông Dân</h1>
        <Link to="/settings" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-[28px]">settings</span>
        </Link>
      </header>

      {/* List */}
      <main className="flex-1 overflow-y-auto px-4 pb-24 no-scrollbar">
        {state.tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-5xl">person_off</span>
            </div>
            <p className="font-bold uppercase tracking-widest text-sm">Chưa có nông dân nào</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {state.tickets.map(ticket => {
              const stats = getTicketStats(ticket);
              return (
                <div 
                  key={ticket.id}
                  onClick={() => navigate(`/weigh/${ticket.id}`)}
                  className="bg-surface-dark p-4 rounded-[32px] border border-white/5 shadow-2xl active:scale-[0.97] transition-all cursor-pointer relative overflow-hidden group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-white leading-tight mb-1">{ticket.name}</h3>
                      <div className="flex items-center gap-2 opacity-50">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        <p className="text-[11px] font-bold uppercase tracking-wider">{formatDate(ticket.createdAt)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setTicketToDelete(ticket); 
                      }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-500/10 text-red-500 active:bg-red-500 active:text-white transition-all shadow-lg"
                    >
                      <span className="material-symbols-outlined text-[24px]">delete</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                    {/* Hàng 1 */}
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">TỔNG SỐ BAO</p>
                      <p className="text-2xl font-black text-white">{stats.bags} <span className="text-sm font-bold opacity-30">bao</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">GIÁ LÚA</p>
                      <p className="text-2xl font-black text-white">{formatNumber(ticket.price, 0)} <span className="text-sm font-bold opacity-30">đ/kg</span></p>
                    </div>

                    {/* Hàng 2 */}
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">TỔNG KHỐI LƯỢNG (THÔ)</p>
                      <p className="text-2xl font-black text-white">{formatNumber(stats.gross, 1)} <span className="text-sm font-bold opacity-30 tracking-normal">kg</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-red-400 uppercase font-black tracking-widest mb-1">TỔNG TRỪ BÌ</p>
                      <p className="text-2xl font-black text-red-400">-{formatNumber(stats.tare, 1)} <span className="text-sm font-bold opacity-50 tracking-normal">kg</span></p>
                    </div>

                    {/* Hàng 3: Chốt hạ */}
                    <div className="col-span-2 pt-4 border-t border-white/10 flex justify-between items-end bg-gradient-to-t from-black/20 to-transparent -mx-4 -mb-4 px-4 pb-4">
                      <div className="flex-1">
                        <p className="text-[11px] text-primary font-black uppercase tracking-widest mb-1">KHỐI LƯỢNG THỰC</p>
                        <p className="text-3xl font-black text-primary drop-shadow-[0_0_10px_rgba(19,236,19,0.3)]">
                          {formatNumber(stats.net, 1)} <span className="text-base">kg</span>
                        </p>
                      </div>
                      <div className="text-right flex-1">
                        <p className="text-[11px] text-yellow-500 font-black uppercase tracking-widest mb-1">THÀNH TIỀN</p>
                        <p className="text-3xl font-black text-yellow-400">
                          {ticket.weights.length > 0 ? formatCurrency(stats.total).replace(' VNĐ', '') : '---'}
                          <span className="text-base ml-1">đ</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FAB */}
      <Link 
        to="/create" 
        className="fixed bottom-8 right-6 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-black shadow-[0_10px_30px_rgba(19,236,19,0.4)] active:scale-90 transition-all z-20 border-4 border-background-dark"
      >
        <span className="material-symbols-outlined font-black text-4xl">add</span>
      </Link>

      {/* Custom Confirmation Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md transition-all animate-in fade-in duration-200">
          <div className="bg-[#1a2a1a] w-full max-w-sm rounded-[40px] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <span className="material-symbols-outlined text-5xl">warning</span>
              </div>
              <h2 className="text-2xl font-black text-white mb-3 leading-tight px-2">Xác nhận xóa nông dân <span className="text-red-400">"{ticketToDelete.name}"</span>?</h2>
              <p className="text-gray-400 text-sm leading-relaxed px-4">Toàn bộ mã cân và thông số tính toán sẽ bị xóa vĩnh viễn và không thể khôi phục lại.</p>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <button 
                onClick={confirmDelete}
                className="w-full h-16 bg-red-500 text-white font-black rounded-[24px] text-lg active:scale-95 transition-all shadow-lg shadow-red-500/20"
              >
                XÓA VĨNH VIỄN
              </button>
              <button 
                onClick={() => setTicketToDelete(null)}
                className="w-full h-16 bg-white/5 text-gray-400 font-bold rounded-[24px] text-lg active:bg-white/10 transition-all"
              >
                QUAY LẠI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerList;
