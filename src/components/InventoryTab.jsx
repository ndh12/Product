import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Package, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const InventoryTab = ({ inventory, setInventory, searchQuery, userId }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        category: '',
        total: 0,
        main: 0,
        safety: 0,
        price: 0,
        specs: ''
    });

    const filteredInventory = inventory.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const lowStockCount = inventory.filter(item => item.total < item.safety).length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.total * item.price), 0);
    const totalItems = inventory.reduce((sum, item) => sum + item.total, 0);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({
                id: '',
                name: '',
                category: '',
                total: 0,
                main: 0,
                safety: 0,
                price: 0,
                specs: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingItem) {
                // Update existing item - use Firestore document ID, not product code
                const itemRef = doc(db, 'inventory', editingItem.firestoreId);
                const { firestoreId, ...updateData } = formData; // Remove firestoreId from update
                await updateDoc(itemRef, {
                    ...updateData,
                    total: parseInt(formData.main),
                    main: parseInt(formData.main),
                    shop: 0,
                    updatedAt: new Date().toISOString()
                });
            } else {
                // Add new item
                await addDoc(collection(db, 'inventory'), {
                    ...formData,
                    total: parseInt(formData.main),
                    shop: 0,
                    userId: userId,
                    createdAt: new Date().toISOString()
                });
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error saving item:', error);
            alert(`저장 중 오류가 발생했습니다: ${error.message}`);
        }
    };

    const handleDelete = async (firestoreId) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            await deleteDoc(doc(db, 'inventory', firestoreId));
        } catch (error) {
            console.error('Error deleting item:', error);
            alert(`삭제 중 오류가 발생했습니다: ${error.message}`);
        }
    };

    return (
        <>
            {/* 요약 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatusCard label="총 품목 수" value={inventory.length} color="blue" icon={<Package size={16} />} />
                <StatusCard label="적정재고 미달" value={lowStockCount} color="red" icon={<AlertTriangle size={16} />} />
                <StatusCard label="총 재고 수량" value={totalItems.toLocaleString()} color="green" icon={<TrendingUp size={16} />} />
                <StatusCard label="총 재고 가치" value={`${(totalValue / 1000000).toFixed(1)}M`} color="orange" icon={<TrendingDown size={16} />} />
            </div>

            {/* 신규 등록 버튼 */}
            <div className="mb-6 flex justify-end">
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                    <Plus size={20} /> 신규 등록
                </button>
            </div>

            {/* 재고 테이블 */}
            <div className="bg-slate-900/50 backdrop-blur-md rounded-xl shadow-lg border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider">
                                <th className="px-6 py-4">품목명</th>
                                <th className="px-6 py-4">카테고리</th>
                                <th className="px-6 py-4 text-right">재고 수량</th>
                                <th className="px-6 py-4 text-right">안전 재고</th>
                                <th className="px-6 py-4 text-right">단가</th>
                                <th className="px-6 py-4">상태</th>
                                <th className="px-6 py-4">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="px-6 py-12 text-center text-gray-400">
                                        등록된 재고가 없습니다. "신규 등록" 버튼을 눌러 재고를 추가하세요.
                                    </td>
                                </tr>
                            ) : (
                                filteredInventory.map(item => (
                                    <tr key={item.firestoreId} className="hover:bg-slate-800/30 transition-colors border-b border-slate-800/50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-blue-400 text-shadow-glow-blue">{item.name}</div>
                                            {item.specs && <div className="text-xs text-slate-500">{item.specs}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs font-bold border border-slate-700">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-white">{item.total?.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right text-slate-500 italic text-xs">{item.safety?.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right text-slate-200 font-mono">
                                            ₩{item.price?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.total < item.safety ? (
                                                <span className="bg-red-900/30 text-red-400 border border-red-800/50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                                                    <AlertTriangle size={12} /> 발주 필요
                                                </span>
                                            ) : (
                                                <span className="bg-green-900/30 text-green-400 border border-green-800/50 px-3 py-1 rounded-full text-xs font-bold">정상</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="p-2 text-blue-400 hover:bg-blue-900/30 rounded transition-colors"
                                                    title="수정"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.firestoreId)}
                                                    className="p-2 text-red-400 hover:bg-red-900/30 rounded transition-colors"
                                                    title="삭제"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
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
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                            <h3 className="text-xl font-bold text-white tracking-tight">{editingItem ? '재고 수정' : '신규 재고 등록'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">품목코드 *</label>
                                    <input
                                        type="text"
                                        value={formData.id}
                                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                        disabled={!!editingItem}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">품목명 *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">카테고리 *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    >
                                        <option value="">선택하세요</option>
                                        <option value="CPU">CPU</option>
                                        <option value="GPU">GPU</option>
                                        <option value="RAM">RAM</option>
                                        <option value="SSD">SSD</option>
                                        <option value="HDD">HDD</option>
                                        <option value="Motherboard">Motherboard</option>
                                        <option value="PSU">PSU</option>
                                        <option value="Case">Case</option>
                                        <option value="Cooler">Cooler</option>
                                        <option value="기타">기타</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">단가 (₩) *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">재고 수량 *</label>
                                    <input
                                        type="number"
                                        value={formData.main}
                                        onChange={(e) => setFormData({ ...formData, main: parseInt(e.target.value) || 0, total: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">안전 재고 *</label>
                                    <input
                                        type="number"
                                        value={formData.safety}
                                        onChange={(e) => setFormData({ ...formData, safety: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-400 mb-2">사양 정보</label>
                                <textarea
                                    value={formData.specs}
                                    onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    rows="2"
                                    placeholder="예: DDR5-5600 CL36, 16GB"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                                >
                                    {editingItem ? '수정 완료' : '등록하기'}
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
                </div>
            )}
        </>
    );
};

const StatusCard = ({ label, value, color, icon }) => {
    const colors = {
        blue: 'border-blue-500 text-blue-400',
        red: 'border-red-500 text-red-400',
        green: 'border-green-500 text-green-400',
        orange: 'border-orange-500 text-orange-400',
    };
    return (
        <div className="bg-slate-900/50 backdrop-blur-sm p-5 rounded-xl border border-slate-800 border-l-4 shadow-xl">
            <div className="text-slate-500 text-sm font-medium mb-1">{label}</div>
            <div className={`text-2xl font-black flex items-center gap-2 ${colors[color]}`}>
                {value} {icon}
            </div>
        </div>
    );
};

export default InventoryTab;
