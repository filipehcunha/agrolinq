import Link from "next/link";
import { Leaf } from "lucide-react";

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white transition-transform group-hover:scale-110">
                        <Leaf size={20} fill="currentColor" />
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">
                        Agro<span className="text-green-600">Linq</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">
                        Recursos
                    </Link>
                    <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">
                        Como funciona
                    </Link>
                    <Link href="#contact" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">
                        Contato
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors hidden sm:block"
                    >
                        Entrar
                    </Link>
                    <Link
                        href="/cadastro"
                        className="inline-flex h-9 items-center justify-center rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-700 disabled:pointer-events-none disabled:opacity-50"
                    >
                        Começar agora
                    </Link>
                </div>
            </div>
        </header>
    );
}
