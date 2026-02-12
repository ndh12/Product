import React, { useState } from 'react';
import {
    Users,
    Search,
    Phone,
    TrendingUp,
    Database,
    Calendar,
    ClipboardList,
    ChevronRight
} from 'lucide-react';

const CustomersTab = ({ transactions, customerState, setCustomerState }) => {
    const { searchTerm, selected: selectedCustomer } = customerState;

    const setSearchTerm = (val) => setCustomerState({ ...customerState, searchTerm: val });
    const setSelectedCustomer = (val) => setCustomerState({ ...customerState, selected: val });

    // Extract unique customers from transactions
    const customers = Array.from(new Set(
        transactions
            .filter(t => t.customerPhone)
            .map(t => t.customerPhone)
    )).map(phone => {
        const customerTransactions = transactions.filter(t => t.customerPhone === phone);
        const lastPurchase = customerTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        return {
            phone,
            transactionCount: customerTransactions.length,
            lastPurchaseDate: lastPurchase?.date,
            totalItems: customerTransactions.reduce((sum, t) => sum + (parseInt(t.quantity) || 0), 0)
        };
    });

    const filteredCustomers = customers.filter(c =>
        c.phone.includes(searchTerm)
    );

    return (
        <div className="flex h-[calc(100vh-12rem)] gap-6 animate-fade-in">
            {/* 왼쪽: 고객 목록 */}
            <div className="w-80 bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-800/30">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="전화번호 검색..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-800 border-slate-700 text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
                    {filteredCustomers.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 italic text-sm">
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        filteredCustomers.map(customer => (
                            <div
                                key={customer.phone}
                                onClick={() => setSelectedCustomer(customer)}
                                className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between border ${selectedCustomer?.phone === customer.phone
                                    ? 'bg-blue-600/20 border-blue-500/50 shadow-inner'
                                    : 'border-transparent hover:bg-slate-800/50 hover:border-slate-700'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${selectedCustomer?.phone === customer.phone ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400'
                                        }`}>
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <div className={`font-bold ${selectedCustomer?.phone === customer.phone ? 'text-blue-400' : 'text-slate-200'
                                            }`}>
                                            {customer.phone}
                                        </div>
                                        <div className="text-[10px] text-slate-500">최근: {customer.lastPurchaseDate}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-white">{customer.transactionCount}회</div>
                                    <ChevronRight size={14} className={selectedCustomer?.phone === customer.phone ? 'text-blue-500' : 'text-slate-700'} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 오른쪽: 상세 정보 및 구매 이력 */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
                {selectedCustomer ? (
                    <>
                        {/* 상세 통계 */}
                        <div className="grid grid-cols-3 gap-4">
                            <StatBox label="전체 구매 횟수" value={`${selectedCustomer.transactionCount}회`} color="blue" icon={<TrendingUp size={20} />} />
                            <StatBox label="총 구매 수량" value={`${selectedCustomer.totalItems}개`} color="green" icon={<Database size={20} />} />
                            <StatBox label="마지막 방문일" value={selectedCustomer.lastPurchaseDate} color="orange" icon={<Calendar size={20} />} />
                        </div>

                        {/* 상세 구매 이력 테이블 */}
                        <div className="bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl overflow-hidden flex-1">
                            <div className="p-5 border-b border-slate-800 flex items-center gap-2 bg-slate-800/30">
                                <ClipboardList className="text-blue-500" size={20} />
                                <h3 className="font-bold text-white tracking-tight">상세 구매 이력</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-800/50 border-b border-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">날짜</th>
                                            <th className="px-6 py-4">품목명</th>
                                            <th className="px-6 py-4 text-right">수량</th>
                                            <th className="px-6 py-4 text-right">단가</th>
                                            <th className="px-6 py-4">비고</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {transactions
                                            .filter(t => t.customerPhone === selectedCustomer.phone)
                                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                                            .map((t, idx) => (
                                                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-6 py-4 text-slate-400 font-medium text-sm">{t.date}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-100">{t.productName}</div>
                                                        <div className="text-[10px] text-slate-500 font-mono italic">{t.productId}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-blue-400">{t.quantity}</td>
                                                    <td className="px-6 py-4 text-right text-slate-300 font-mono text-sm">₩{t.price?.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-slate-500 italic text-xs max-w-xs truncate">{t.notes || '-'}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-800 text-slate-500">
                        <Users size={64} className="mb-4 opacity-10" />
                        <p className="text-lg font-medium">고객을 선택하면 상세 구매 내역을 볼 수 있습니다.</p>
                        <p className="text-sm opacity-60 mt-2">입출고 관리에서 전화번호를 입력하여 거래를 등록하세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatBox = ({ label, value, color, icon }) => {
    const colors = {
        blue: 'border-blue-500 text-blue-400',
        green: 'border-green-500 text-green-400',
        orange: 'border-orange-500 text-orange-400',
    };
    return (
        <div className="bg-slate-900/50 backdrop-blur-sm p-5 rounded-xl border border-slate-800 border-l-4 shadow-xl">
            <div className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1">{label}</div>
            <div className={`text-2xl font-black flex items-center gap-2 ${colors[color]}`}>
                {value} {icon}
            </div>
        </div>
    );
};

export default CustomersTab;
