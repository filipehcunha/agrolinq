export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-green-600">AGROLINQ Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Bem-vindo(a)</span>
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                        U
                    </div>
                </div>
            </header>
            <main className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Visão Geral</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Total de Vendas</h3>
                            <p className="text-3xl font-bold text-gray-900">R$ 0,00</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Pedidos Ativos</h3>
                            <p className="text-3xl font-bold text-gray-900">0</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Mensagens</h3>
                            <p className="text-3xl font-bold text-gray-900">0</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
