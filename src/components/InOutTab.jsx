import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowRightLeft, Filter, Plus, X } from 'lucide-react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const InOutTab = ({ transactions, setTransactions, inventory, setInventory, userId, partners = [] }) => {
    const [filterType, setFilterType] = useState('전체');
    const [filterDate, setFilterDate] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        type: '입고',
        productId: '',
        quantity: 0,
        destination: '',
        supplier: '',
        notes: '',
        serialNumbers: '',
        date: new Date().toISOString().split('T')[0],
        customerPhone: ''
    });

    const filteredTransactions = transactions.filter(txn => {
        const typeMatch = filterType === '전체' || txn.type === filterType;
        const dateMatch = !filterDate || txn.date === filterDate;
        return typeMatch && dateMatch;
    });

    const today = new Date().toISOString().split('T')[0];
    const todayIn = transactions.filter(t => t.type === '입고' && t.date === today).length;
    const todayOut = transactions.filter(t => t.type === '출고' && t.date === today).length;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const product = inventory.find(item => item.id === formData.productId);
        if (!product) {
            alert('선택한 품목을 찾을 수 없습니다.');
            return;
        }

        // Outbound validation
        if (formData.type === '출고') {
            const currentStock = product.total || 0;
            if (currentStock < formData.quantity) {
                alert(`재고가 부족합니다. (현재 재고: ${currentStock}개)`);
                return;
            }
        }

        try {
            // Add transaction
            await addDoc(collection(db, 'transactions'), {
                ...formData,
                productName: product.name,
                price: product.price,
                date: formData.date,
                userId: userId,
                user: '관리자',
                createdAt: new Date().toISOString(),
                serialNumbers: formData.serialNumbers.split('\n').filter(sn => sn.trim())
            });

            // Register serial numbers if provided
            if (formData.type === '입고' && formData.serialNumbers.trim()) {
                const serialsToRegister = formData.serialNumbers
                    .split('\n')
                    .map(sn => sn.trim())
                    .filter(sn => sn !== '');

                for (const sn of serialsToRegister) {
                    await addDoc(collection(db, 'serials'), {
                        serialNumber: sn,
                        productId: product.id,
                        productName: product.name,
                        userId: userId,
                        status: '재고',
                        purchaseDate: formData.date,
                        supplier: formData.supplier,
                        createdAt: new Date().toISOString()
                    });
                }
            }

            // Update inventory based on transaction type
            const productRef = doc(db, 'inventory', product.firestoreId);
            let newMain = product.main || 0;
            let newShop = product.shop || 0;

            if (formData.type === '입고') {
                newMain += parseInt(formData.quantity);
            } else if (formData.type === '출고') {
                newMain -= parseInt(formData.quantity);
            }

            await updateDoc(productRef, {
                main: newMain,
                total: newMain,
                updatedAt: new Date().toISOString()
            });

            // Automatic Partner Registration & Credit Sync
            if (formData.type === '입고' && formData.supplier.trim()) {
                const partnerExists = partners.some(p => p.name === formData.supplier);
                if (!partnerExists) {
                    await addDoc(collection(db, 'partners'), {
                        id: `AUTO-${Date.now().toString().slice(-6)}`,
                        name: formData.supplier,
                        userId: userId,
                        createdAt: new Date().toISOString(),
                        notes: '입출고 관리에서 자동 등록됨',
                        creditLimit: 0,
                        currentCredit: 0
                    });
                }
            } else if (formData.type === '출고' && formData.destination) {
                const partner = partners.find(p => p.name === formData.destination);
                if (partner) {
                    const partnerRef = doc(db, 'partners', partner.firestoreId);
                    const transactionValue = parseInt(formData.quantity) * (product.price || 0);
                    await updateDoc(partnerRef, {
                        currentCredit: (partner.currentCredit || 0) + transactionValue,
                        updatedAt: new Date().toISOString()
                    });
                }
            }

            setShowModal(false);
            setFormData({
                type: '입고',
                productId: '',
                quantity: 0,
                destination: '',
                supplier: '',
                notes: '',
                serialNumbers: '',
                date: new Date().toISOString().split('T')[0],
                customerPhone: ''
            });
        } catch (error) {
            console.error('Error adding transaction:', error);
            alert(`거래 등록 중 오류가 발생했습니다: ${error.message}`);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case '입고': return <TrendingUp className="text-green-600" size={18} />;
            case '출고': return <TrendingDown className="text-red-600" size={18} />;
            default: return null;
        }
    };

    const getTypeBadge = (type) => {
        const badges = {
            '입고': 'bg-green-100 text-green-700',
            '출고': 'bg-red-100 text-red-700',
        };
        return badges[type] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-800 border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-slate-400 text-sm font-medium mb-1">금일 입고</div>
                            <div className="text-3xl font-bold text-green-500 text-shadow-glow-green">{todayIn}</div>
                        </div>
                        <TrendingUp className="text-green-600" size={40} />
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-800 border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-slate-400 text-sm font-medium mb-1">금일 출고</div>
                            <div className="text-3xl font-bold text-red-500 text-shadow-glow-red">{todayOut}</div>
                        </div>
                        <TrendingDown className="text-red-600" size={40} />
                    </div>
                </div>
            </div>

            {/* 필터 및 등록 버튼 */}
            <div className="bg-slate-900/50 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Filter className="text-slate-500" size={20} />
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-slate-400">구분:</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-slate-800 border-slate-700 text-slate-200 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option>전체</option>
                            <option>입고</option>
                            <option>출고</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-slate-400">날짜:</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="bg-slate-800 border-slate-700 text-slate-200 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {(filterType !== '전체' || filterDate) && (
                        <button
                            onClick={() => { setFilterType('전체'); setFilterDate(''); }}
                            className="px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            필터 초기화
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
                >
                    <Plus size={18} /> 거래 등록
                </button>
            </div>

            {/* 거래 내역 테이블 */}
            <div className="bg-slate-900/50 backdrop-blur-md rounded-xl shadow-lg border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider">
                                <th className="px-6 py-4">날짜</th>
                                <th className="px-6 py-4">구분</th>
                                <th className="px-6 py-4">품목코드</th>
                                <th className="px-6 py-4">품목명</th>
                                <th className="px-6 py-4 text-right">수량</th>
                                <th className="px-6 py-4">출처/목적지</th>
                                <th className="px-6 py-4 text-right">단가</th>
                                <th className="px-6 py-4">담당자</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                                        조회된 거래 내역이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map(txn => (
                                    <tr key={txn.firestoreId} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-400 font-medium">{txn.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`${getTypeBadge(txn.type)} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit`}>
                                                {getTypeIcon(txn.type)}
                                                {txn.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-slate-500">{txn.productId}</td>
                                        <td className="px-6 py-4 font-bold text-slate-200">{txn.productName}</td>
                                        <td className="px-6 py-4 text-right font-black text-white">{txn.quantity}</td>
                                        <td className="px-6 py-4 text-sm text-slate-300">
                                            {txn.supplier || txn.destination || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-200 font-mono">
                                            {txn.price > 0 ? `₩${txn.price?.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">{txn.user}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white tracking-tight">거래 등록</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">거래 구분 *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    >
                                        <option value="입고">입고</option>
                                        <option value="출고">출고</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">날짜 *</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">품목 선택 *</label>
                                    <select
                                        value={formData.productId}
                                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    >
                                        <option value="">선택하세요</option>
                                        {inventory.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.id} - {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">수량 *</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                        min="1"
                                    />
                                </div>
                            </div>

                            {formData.type === '입고' && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">공급업체</label>
                                    <input
                                        list="partners-list"
                                        value={formData.supplier}
                                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="공급업체 입력 또는 선택"
                                    />
                                    <datalist id="partners-list">
                                        {partners.map(partner => (
                                            <option key={partner.firestoreId} value={partner.name} />
                                        ))}
                                    </datalist>
                                </div>
                            )}

                            {formData.type === '출고' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-400 mb-2">출고처</label>
                                        <select
                                            value={formData.destination}
                                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            required
                                        >
                                            <option value="">출고처 선택</option>
                                            {partners.map(partner => (
                                                <option key={partner.firestoreId} value={partner.name}>
                                                    {partner.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-400 mb-2">고객 전화번호</label>
                                        <input
                                            type="tel"
                                            value={formData.customerPhone}
                                            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="010-0000-0000"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-400 mb-2">비고</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    rows="2"
                                />
                            </div>

                            {formData.type === '입고' && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">시리얼 번호 (한 줄에 하나씩 입력)</label>
                                    <textarea
                                        value={formData.serialNumbers}
                                        onChange={(e) => setFormData({ ...formData, serialNumbers: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm transition-all"
                                        rows="3"
                                        placeholder="예: SN-12345&#10;SN-67890"
                                    />
                                    <p className="text-xs text-blue-400 mt-1">입력한 시리얼 수량만큼 거래 수량에도 자동으로 반영하는 것이 권장되지만, 현재는 별개로 작동합니다.</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                                >
                                    등록하기
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 border border-slate-700 text-slate-400 rounded-lg font-bold hover:bg-slate-800 hover:text-white transition-all active:scale-95"
                                >
                                    취소
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )}
        </div >
    );
};

export default InOutTab;
