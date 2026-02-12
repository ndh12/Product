import React, { useState } from 'react';
import {
    Search,
    Hash,
    Package,
    Calendar,
    Database,
    ArrowRightLeft,
    ShieldCheck,
    ClipboardList
} from 'lucide-react';

const SerialTrackingTab = ({ serials, inventory }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSerial, setSelectedSerial] = useState(null);

    const filteredSerials = serials.filter(s =>
        s.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.productId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-12rem)] gap-6 animate-fade-in">
            {/* 왼쪽: 시리얼 목록 */}
            <div className="w-96 bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-800/30">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="S/N, 품목명 검색..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-800 border-slate-700 text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600 transition-all font-mono"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
                    {filteredSerials.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 italic text-sm">
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        filteredSerials.map(serial => (
                            <div
                                key={serial.firestoreId}
                                onClick={() => setSelectedSerial(serial)}
                                className={`p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 border ${selectedSerial?.firestoreId === serial.firestoreId
                                        ? 'bg-blue-600/20 border-blue-500/50 shadow-inner'
                                        : 'border-transparent hover:bg-slate-800/50 hover:border-slate-700'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${selectedSerial?.firestoreId === serial.firestoreId ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400'
                                    }`}>
                                    <Hash size={18} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className={`font-mono text-xs font-bold truncate ${selectedSerial?.firestoreId === serial.firestoreId ? 'text-blue-400' : 'text-slate-200'
                                        }`}>
                                        {serial.serialNumber}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate">{serial.productName}</div>
                                </div>
                                <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${serial.status === '재고' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                                    }`}>
                                    {serial.status || '재고'}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 오른쪽: 상세 정보 및 히스토리 */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
                {selectedSerial ? (
                    <>
                        {/* 상세 정보 카드 */}
                        <div className="bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 shadow-inner text-blue-400">
                                    <Hash size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tight font-mono">{selectedSerial.serialNumber}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedSerial.status === '재고' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                            }`}>
                                            {selectedSerial.status || '재고'}
                                        </span>
                                        <span className="text-slate-500 text-xs font-medium">품목: {selectedSerial.productName} ({selectedSerial.productId})</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                                <InfoItem icon={<Calendar size={18} />} label="최초 등록일" value={selectedSerial.purchaseDate || '-'} />
                                <InfoItem icon={<Database size={18} />} label="현재 창고" value={selectedSerial.warehouse || '본사'} />
                                <InfoItem icon={<ArrowRightLeft size={18} />} label="최근 거래 상태" value={selectedSerial.status || '-'} />
                            </div>
                        </div>

                        {/* 시리얼 히스토리 */}
                        <div className="bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl overflow-hidden flex-1">
                            <div className="p-5 border-b border-slate-800 flex items-center gap-2 bg-slate-800/30">
                                <ShieldCheck className="text-blue-500" size={20} />
                                <h3 className="font-bold text-white tracking-tight">상태 변경 이력</h3>
                            </div>
                            <div className="p-12 text-center text-slate-500 italic">
                                <ClipboardList size={48} className="mx-auto mb-4 opacity-10" />
                                <p>상세 히스토리 추적 기능이 준비 중입니다.</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-800 text-slate-500">
                        <Package size={64} className="mb-4 opacity-10" />
                        <p className="text-lg font-medium">시리얼 번호를 선택하면 상세 추적 정보를 볼 수 있습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-3">
        <div className="text-slate-500">{icon}</div>
        <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-600 mb-0.5">{label}</div>
            <div className="text-slate-200 font-medium">{value || '-'}</div>
        </div>
    </div>
);

export default SerialTrackingTab;
