
import Link from 'next/link';
import { ShoppingBasket, Tractor } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-green-800 mb-4 tracking-tight">AGROLINQ</h1>
          <p className="text-xl text-green-700 font-medium">Conectando quem planta a quem consome.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Produtor Card */}
          <Link
            href="/produtor"
            className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-green-500 transform hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Tractor size={120} className="text-green-600" />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center h-full justify-between">
              <div>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Tractor size={40} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Sou Produtor</h2>
                <p className="text-gray-600 mb-6">Cadastre seus produtos, gerencie seu estoque e acompanhe suas vendas.</p>
              </div>
              <span className="inline-block w-full py-3 bg-green-600 text-white font-bold rounded-lg group-hover:bg-green-700 transition-colors">
                Acessar Painel Produtor
              </span>
            </div>
          </Link>

          {/* Consumidor Card */}
          <Link
            href="/consumidor"
            className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-orange-400 transform hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShoppingBasket size={120} className="text-orange-500" />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center h-full justify-between">
              <div>
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBasket size={40} className="text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Sou Consumidor</h2>
                <p className="text-gray-600 mb-6">Encontre produtos frescos da sua região e compre direto do produtor.</p>
              </div>
              <span className="inline-block w-full py-3 bg-orange-500 text-white font-bold rounded-lg group-hover:bg-orange-600 transition-colors">
                Ir para Loja
              </span>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center text-green-800/60 text-sm">
          &copy; 2024 Agrolinq. Todos os direitos reservados.
        </div>
      </div>
    </main>
  );
}
