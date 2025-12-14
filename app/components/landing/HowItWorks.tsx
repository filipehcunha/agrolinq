export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-20 bg-slate-50 border-y border-slate-200">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Como funciona
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Conectar-se com produtores locais nunca foi tão simples.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                            <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg shadow-green-200">
                                1
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Cadastre-se</h3>
                            <p className="text-gray-600">
                                Crie sua conta gratuitamente como produtor, consumidor ou restaurante em poucos minutos.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                            <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg shadow-green-200">
                                2
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Conecte-se</h3>
                            <p className="text-gray-600">
                                Explore produtos, negocie diretamente e feche parcerias sustentáveis.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                            <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg shadow-green-200">
                                3
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Cresça</h3>
                            <p className="text-gray-600">
                                Acompanhe seus pedidos, receba feedbacks e expanda sua rede de negócios.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
