import Link from "next/link";
import { ArrowRight, ShoppingBasket, Truck, Store } from "lucide-react";

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-50 via-white to-white" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
                    <div className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-800">
                        <span className="flex h-2 w-2 rounded-full bg-green-600 mr-2"></span>
                        Conectando o campo à cidade
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 text-balance">
                        A ponte direta entre <br className="hidden md:block" />
                        <span className="text-green-600">quem produz</span> e <span className="text-green-600">quem consome</span>.
                    </h1>

                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl text-balance leading-relaxed">
                        O AgroLinq elimina intermediários, garantindo preços justos para produtores,
                        alimentos frescos para consumidores e eficiência para restaurantes.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <Link
                            href="/cadastro"
                            className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-full bg-green-600 px-8 text-sm font-medium text-white shadow-lg transition-all hover:bg-green-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-700"
                        >
                            Criar conta grátis
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-8 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
                        >
                            Saiba mais
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 items-center opacity-80">
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <Truck size={24} />
                            </div>
                            <span className="font-semibold text-gray-700">Produtores</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                <Store size={24} />
                            </div>
                            <span className="font-semibold text-gray-700">Restaurantes</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                                <ShoppingBasket size={24} />
                            </div>
                            <span className="font-semibold text-gray-700">Consumidores</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
