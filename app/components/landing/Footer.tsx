import { Leaf } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4 text-white">
                            <Leaf size={24} className="text-green-500" />
                            <span className="text-xl font-bold">AgroLinq</span>
                        </div>
                        <p className="text-sm text-gray-400 max-w-sm">
                            Conectando o campo à cidade de forma sustentável, justa e eficiente.
                            Junte-se a nós nessa revolução do agronegócio.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Plataforma</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-green-400 transition-colors">Sobre nós</a></li>
                            <li><a href="#" className="hover:text-green-400 transition-colors">Produtores</a></li>
                            <li><a href="#" className="hover:text-green-400 transition-colors">Restaurantes</a></li>
                            <li><a href="#" className="hover:text-green-400 transition-colors">Consumidores</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-green-400 transition-colors">Termos de Uso</a></li>
                            <li><a href="#" className="hover:text-green-400 transition-colors">Privacidade</a></li>
                            <li><a href="#" className="hover:text-green-400 transition-colors">Cookies</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} AgroLinq. Todos os direitos reservados.</p>
                    <p>Feito com ❤️ para o agronegócio.</p>
                </div>
            </div>
        </footer>
    );
}
