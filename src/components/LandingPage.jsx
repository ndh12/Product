import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, TrendingUp, Shield, Zap } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -top-48 -left-48 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -bottom-48 -right-48 animate-pulse delay-1000"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
                {/* Logo and Title */}
                <div className="text-center mb-12 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mb-6 shadow-2xl">
                        <Database size={48} className="text-white" />
                    </div>
                    <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        PC-ERP Pro
                    </h1>
                    <p className="text-xl text-blue-200 mb-2">컴퓨터 부품 재고관리 시스템</p>
                    <p className="text-gray-400">효율적인 재고 관리로 비즈니스를 성장시키세요</p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl w-full">
                    <FeatureCard
                        icon={<TrendingUp size={32} />}
                        title="실시간 재고 추적"
                        description="다중 창고 재고를 실시간으로 모니터링하고 관리하세요"
                    />
                    <FeatureCard
                        icon={<Shield size={32} />}
                        title="안전한 데이터 관리"
                        description="Firebase 기반 클라우드 저장으로 데이터를 안전하게 보호합니다"
                    />
                    <FeatureCard
                        icon={<Zap size={32} />}
                        title="빠른 입출고 처리"
                        description="간편한 UI로 입출고 작업을 신속하게 처리하세요"
                    />
                </div>

                {/* CTA Button */}
                <button
                    onClick={() => navigate('/login')}
                    className="group relative px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-bold text-lg shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                >
                    <span className="relative z-10">시작하기</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                {/* Footer */}
                <div className="mt-16 text-center text-gray-500 text-sm">
                    <p>© 2026 PC-ERP Pro. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
        <div className="text-blue-400 mb-4">{icon}</div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
    </div>
);

export default LandingPage;
