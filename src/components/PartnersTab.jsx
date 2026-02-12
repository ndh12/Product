import React, { useState } from 'react';
import { ClipboardList, ChevronRight, Building2, CreditCard, Phone, Mail, Plus, X, Edit2, Trash2, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const PartnersTab = ({ partners, setPartners, userId, transactions = [] }) => {
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingPartner, setEditingPartner] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        ceo: '',
        type: '',
        item: '',
        creditLimit: 0,
        currentCredit: 0,
        manager: '',
        phone: '',
        email: '',
        address: '',
        paymentTerms: '',
        notes: ''
    });

    const handleOpenModal = (partner = null) => {
        if (partner) {
            setEditingPartner(partner);
            setFormData(partner);
        } else {
            setEditingPartner(null);
            setFormData({
                id: '',
                name: '',
                ceo: '',
                type: '',
                item: '',
                creditLimit: 0,
                currentCredit: 0,
                manager: '',
                phone: '',
                email: '',
                address: '',
                paymentTerms: '',
                notes: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingPartner) {
                const partnerRef = doc(db, 'partners', editingPartner.firestoreId);
                const { firestoreId, ...updateData } = formData;
                await updateDoc(partnerRef, {
                    ...updateData,
                    updatedAt: new Date().toISOString()
                });
                setSelectedPartner({ ...formData, firestoreId: editingPartner.firestoreId });
            } else {
                const docRef = await addDoc(collection(db, 'partners'), {
                    ...formData,
                    userId: userId,
                    createdAt: new Date().toISOString()
                });
                setSelectedPartner({ ...formData, firestoreId: docRef.id });
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error saving partner:', error);
            alert(`저장 중 오류가 발생했습니다: ${error.message}`);
        }
    };

    const handleDelete = async (firestoreId) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            await deleteDoc(doc(db, 'partners', firestoreId));
            if (selectedPartner?.firestoreId === firestoreId) {
                setSelectedPartner(null);
            }
        } catch (error) {
            console.error('Error deleting partner:', error);
            alert(`삭제 중 오류가 발생했습니다: ${error.message}`);
        }
    };

    const getCreditStatus = (partner) => {
        const usagePercent = (partner.currentCredit / partner.creditLimit) * 100;
        if (usagePercent >= 90) return { color: 'text-red-600', bg: 'bg-red-100', label: '한도 임박' };
        if (usagePercent >= 70) return { color: 'text-orange-600', bg: 'bg-orange-100', label: '주의' };
        return { color: 'text-green-600', bg: 'bg-green-100', label: '정상' };
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* 신규 등록 버튼 */}
            <div className="flex justify-end">
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                    <Plus size={20} /> 거래처 등록
                </button>
            </div>

            {/* 거래처 상세 정보 */}
            {selectedPartner && (
                <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-blue-600">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <ClipboardList className="text-blue-600" /> 거래처 상세 정보
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleOpenModal(selectedPartner)}
                                className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                            >
                                수정
                            </button>
                            <button
                                onClick={() => handleDelete(selectedPartner.firestoreId)}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                삭제
                            </button>
                            <button
                                onClick={() => setSelectedPartner(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                title="상세 정보 닫기"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        <InputGroup label="거래처코드" value={selectedPartner.id} readonly />
                        <InputGroup label="상호(이름)" value={selectedPartner.name} readonly />
                        <InputGroup label="대표자명" value={selectedPartner.ceo} readonly />
                        <InputGroup label="업태" value={selectedPartner.type} readonly />
                        <InputGroup label="종목" value={selectedPartner.item} readonly />
                        <InputGroup label="전담 직원" value={selectedPartner.manager} readonly />
                        <InputGroup label="연락처" value={selectedPartner.phone} icon={<Phone size={16} />} readonly />
                        <InputGroup label="이메일" value={selectedPartner.email} icon={<Mail size={16} />} readonly />
                        <div className="md:col-span-2">
                            <InputGroup label="주소" value={selectedPartner.address} readonly />
                        </div>
                        <InputGroup label="결제 조건" value={selectedPartner.paymentTerms} readonly />
                        <div className="md:col-span-2">
                            <InputGroup label="비고" value={selectedPartner.notes} readonly />
                        </div>
                    </div>

                    {/* 여신 정보 */}
                    <div className="mt-8 pt-6 border-t">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <CreditCard className="text-blue-600" size={20} />
                            여신 한도 관리
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 mb-1">여신 한도</div>
                                <div className="text-2xl font-bold text-gray-800">
                                    ₩{selectedPartner.creditLimit?.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 mb-1">현재 사용액</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    ₩{selectedPartner.currentCredit?.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 mb-1">잔여 한도</div>
                                <div className="text-2xl font-bold text-green-600">
                                    ₩{((selectedPartner.creditLimit || 0) - (selectedPartner.currentCredit || 0)).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* 여신 사용률 바 */}
                        <div className="mt-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">여신 사용률</span>
                                <span className="font-bold">
                                    {(((selectedPartner.currentCredit || 0) / (selectedPartner.creditLimit || 1)) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className={`h-full transition-all ${((selectedPartner.currentCredit || 0) / (selectedPartner.creditLimit || 1)) >= 0.9 ? 'bg-red-600' :
                                        ((selectedPartner.currentCredit || 0) / (selectedPartner.creditLimit || 1)) >= 0.7 ? 'bg-orange-500' :
                                            'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min(((selectedPartner.currentCredit || 0) / (selectedPartner.creditLimit || 1)) * 100, 100)}%` }}
                                />
                            </div>
                            <div className="mt-2">
                                {(() => {
                                    const status = getCreditStatus(selectedPartner);
                                    return (
                                        <span className={`${status.bg} ${status.color} px-3 py-1 rounded-full text-xs font-bold`}>
                                            {status.label}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* 거래 내역 */}
                    <div className="mt-8 pt-6 border-t">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <ClipboardList className="text-blue-600" size={20} />
                            거래 내역
                        </h4>

                        {(() => {
                            const partnerTransactions = transactions.filter(t =>
                                t.supplier === selectedPartner.name || t.destination === selectedPartner.name
                            ).sort((a, b) => new Date(b.date) - new Date(a.date));

                            if (partnerTransactions.length === 0) {
                                return (
                                    <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-400">
                                        <p>거래 내역이 없습니다.</p>
                                    </div>
                                );
                            }

                            const getTypeIcon = (type) => {
                                switch (type) {
                                    case '입고': return <TrendingUp className="text-green-600" size={16} />;
                                    case '출고': return <TrendingDown className="text-red-600" size={16} />;
                                    case '이동': return <ArrowRightLeft className="text-blue-600" size={16} />;
                                    default: return null;
                                }
                            };

                            const getTypeBadge = (type) => {
                                const badges = {
                                    '입고': 'bg-green-100 text-green-700',
                                    '출고': 'bg-red-100 text-red-700',
                                    '이동': 'bg-blue-100 text-blue-700',
                                };
                                return badges[type] || 'bg-gray-100 text-gray-700';
                            };

                            return (
                                <div className="bg-white rounded-lg border overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b">
                                            <tr className="text-xs uppercase tracking-wider text-gray-600">
                                                <th className="px-4 py-3">날짜</th>
                                                <th className="px-4 py-3">구분</th>
                                                <th className="px-4 py-3">품목명</th>
                                                <th className="px-4 py-3 text-right">수량</th>
                                                <th className="px-4 py-3 text-right">단가</th>
                                                <th className="px-4 py-3">비고</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {partnerTransactions.map((txn, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm text-gray-600 font-medium">{txn.date}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`${getTypeBadge(txn.type)} px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit`}>
                                                            {getTypeIcon(txn.type)}
                                                            {txn.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-gray-800">{txn.productName}</div>
                                                        <div className="text-xs text-gray-500 font-mono">{txn.productId}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-gray-900">{txn.quantity}</td>
                                                    <td className="px-4 py-3 text-right text-gray-700 font-mono text-sm">
                                                        {txn.price > 0 ? `₩${txn.price?.toLocaleString()}` : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{txn.notes || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {!selectedPartner && partners.length === 0 && (
                <div className="bg-white p-12 rounded-xl shadow-md text-center text-gray-400">
                    <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                    <p>등록된 거래처가 없습니다.</p>
                    <p className="text-sm mt-2">"거래처 등록" 버튼을 눌러 새 거래처를 추가하세요.</p>
                </div>
            )}

            {/* 거래처 목록 */}
            {partners.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b font-bold text-sm text-gray-600 uppercase flex items-center gap-2">
                        <Building2 size={16} />
                        등록된 거래처 목록 ({partners.length})
                    </div>
                    <div className="divide-y">
                        {partners.map(p => {
                            const status = getCreditStatus(p);
                            return (
                                <div
                                    key={p.firestoreId}
                                    className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${selectedPartner?.firestoreId === p.firestoreId ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'
                                        }`}
                                    onClick={() => setSelectedPartner(p)}
                                >
                                    <div className="flex-1">
                                        <div className="font-bold text-lg">{p.name}</div>
                                        <div className="text-sm text-gray-500 mt-1">{p.id} | {p.manager} | {p.item}</div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-xs text-gray-600">
                                                여신: ₩{p.currentCredit?.toLocaleString()} / ₩{p.creditLimit?.toLocaleString()}
                                            </span>
                                            <span className={`${status.bg} ${status.color} px-2 py-1 rounded text-xs font-bold`}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-400" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white tracking-tight">{editingPartner ? '거래처 수정' : '신규 거래처 등록'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">거래처코드 *</label>
                                    <input
                                        type="text"
                                        value={formData.id}
                                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                        disabled={!!editingPartner}
                                        placeholder="예: 220-81-65848"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">상호(이름) *</label>
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
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">대표자명 *</label>
                                    <input
                                        type="text"
                                        value={formData.ceo}
                                        onChange={(e) => setFormData({ ...formData, ceo: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">업태 *</label>
                                    <input
                                        type="text"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                        placeholder="예: 제조업, 유통업"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">종목 *</label>
                                    <input
                                        type="text"
                                        value={formData.item}
                                        onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                        placeholder="예: CPU, GPU 유통"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">전담 직원</label>
                                    <input
                                        type="text"
                                        value={formData.manager}
                                        onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">연락처</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="02-1234-5678"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">이메일</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="contact@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-400 mb-2">주소</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">여신 한도 (₩)</label>
                                    <input
                                        type="number"
                                        value={formData.creditLimit}
                                        onChange={(e) => setFormData({ ...formData, creditLimit: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">현재 사용액 (₩)</label>
                                    <input
                                        type="number"
                                        value={formData.currentCredit}
                                        onChange={(e) => setFormData({ ...formData, currentCredit: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-400 mb-2">결제 조건</label>
                                <input
                                    type="text"
                                    value={formData.paymentTerms}
                                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="예: 월말 결제, 익월 15일"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-400 mb-2">비고</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-800 border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    rows="2"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                                >
                                    {editingPartner ? '수정 완료' : '등록하기'}
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
        </div>
    );
};

const InputGroup = ({ label, value, readonly = true, icon }) => (
    <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-600">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
            <input
                type="text"
                value={value || ''}
                readOnly={readonly}
                className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border rounded-md outline-none ${readonly ? 'bg-gray-50 text-gray-700' : 'bg-white'
                    }`}
            />
        </div>
    </div>
);

export default PartnersTab;
