import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Truck,
    Settings,
    Plus,
    Search,
    ClipboardList,
    Database,
    LogOut,
    User
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from './firebase';

// Import components
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import InventoryTab from './components/InventoryTab';
import SerialTrackingTab from './components/SerialTrackingTab';
import PartnersTab from './components/PartnersTab';
import InOutTab from './components/InOutTab';
import CustomersTab from './components/CustomersTab';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
    );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return children;
};

// Main Dashboard Component
const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('inventory');
    const [searchQuery, setSearchQuery] = useState('');
    const { currentUser, logout } = useAuth();

    // Firebase state
    const [inventory, setInventory] = useState([]);
    const [serials, setSerials] = useState([]);
    const [partners, setPartners] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [customerState, setCustomerState] = useState({ searchTerm: '', selected: null });

    // Real-time listeners for Firestore
    useEffect(() => {
        if (!currentUser) return;

        const inventoryQuery = query(
            collection(db, 'inventory'),
            where('userId', '==', currentUser.uid)
        );
        const unsubInventory = onSnapshot(inventoryQuery, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));
            setInventory(items);
        });

        const serialsQuery = query(
            collection(db, 'serials'),
            where('userId', '==', currentUser.uid)
        );
        const unsubSerials = onSnapshot(serialsQuery, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));
            setSerials(items);
        });

        const partnersQuery = query(
            collection(db, 'partners'),
            where('userId', '==', currentUser.uid)
        );
        const unsubPartners = onSnapshot(partnersQuery, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));
            setPartners(items);
        });

        const transactionsQuery = query(
            collection(db, 'transactions'),
            where('userId', '==', currentUser.uid)
        );
        const unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));
            setTransactions(items);
        });

        return () => {
            unsubInventory();
            unsubSerials();
            unsubPartners();
            unsubTransactions();
        };
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const getTabTitle = () => {
        const titles = {
            'inventory': '창고별 재고 현황',
            'inout': '입출고 거래 내역',
            'serial': '시리얼 번호 추적',
            'partners': '거래처 정보 관리',
            'customers': '고객 정보 관리'
        };
        return titles[activeTab] || '대시보드';
    };

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
            {/* 사이드바 */}
            <div className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl">
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                        <Database className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">PC-ERP Pro</h1>
                        <p className="text-xs text-slate-500">재고관리 시스템</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavItem
                        active={activeTab === 'inventory'}
                        onClick={() => setActiveTab('inventory')}
                        icon={<LayoutDashboard size={20} />}
                        label="재고 현황"
                    />
                    <NavItem
                        active={activeTab === 'inout'}
                        onClick={() => setActiveTab('inout')}
                        icon={<Truck size={20} />}
                        label="입출고 관리"
                    />
                    <NavItem
                        active={activeTab === 'serial'}
                        onClick={() => setActiveTab('serial')}
                        icon={<Package size={20} />}
                        label="S/N 추적"
                    />
                    <NavItem
                        active={activeTab === 'partners'}
                        onClick={() => setActiveTab('partners')}
                        icon={<ClipboardList size={20} />}
                        label="거래처 정보"
                    />
                    <NavItem
                        active={activeTab === 'customers'}
                        onClick={() => setActiveTab('customers')}
                        icon={<User size={20} />}
                        label="고객 정보"
                    />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <NavItem
                        active={false}
                        onClick={() => { }}
                        icon={<Settings size={20} />}
                        label="설정"
                    />
                    <button
                        onClick={handleLogout}
                        className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">로그아웃</span>
                    </button>
                    <div className="mt-4 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs">
                        <div className="text-slate-500 mb-1">로그인 계정</div>
                        <div className="text-white font-semibold truncate">{currentUser?.email}</div>
                    </div>
                </div>
            </div>

            {/* 메인 영역 */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* 상단 헤더 */}
                <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800/50 flex items-center justify-between px-8 shadow-xl">
                    <h2 className="text-lg font-bold text-white tracking-tight">
                        {getTabTitle()}
                    </h2>
                    <div className="flex items-center gap-4">
                        {(activeTab === 'inventory' || activeTab === 'serial') && (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="품목명, 코드 검색..."
                                    className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 w-64 outline-none placeholder:text-slate-600"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </header>

                {/* 대시보드 콘텐츠 */}
                <main className="flex-1 overflow-auto p-8 bg-gradient-to-br from-slate-950 to-slate-900">
                    {activeTab === 'inventory' && (
                        <InventoryTab
                            inventory={inventory}
                            setInventory={setInventory}
                            searchQuery={searchQuery}
                            userId={currentUser.uid}
                        />
                    )}

                    {activeTab === 'serial' && (
                        <SerialTrackingTab
                            serials={serials}
                            inventory={inventory}
                            userId={currentUser.uid}
                        />
                    )}

                    {activeTab === 'partners' && (
                        <PartnersTab
                            partners={partners}
                            setPartners={setPartners}
                            userId={currentUser.uid}
                            transactions={transactions}
                        />
                    )}

                    {activeTab === 'inout' && (
                        <InOutTab
                            transactions={transactions}
                            setTransactions={setTransactions}
                            inventory={inventory}
                            setInventory={setInventory}
                            userId={currentUser.uid}
                            partners={partners}
                        />
                    )}

                    {activeTab === 'customers' && (
                        <CustomersTab
                            transactions={transactions}
                            customerState={customerState}
                            setCustomerState={setCustomerState}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

// 재사용 가능한 컴포넌트
const NavItem = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
            ? 'bg-blue-600 text-white shadow-lg scale-105'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:scale-102'
            }`}
    >
        {icon}
        <span className="font-medium">{label}</span>
    </button>
);

export default App;
