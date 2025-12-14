import { Leaf, Award, TrendingUp, ShieldCheck, Truck, Users } from "lucide-react";

const features = [
    {
        title: "Para Produtores",
        description: "Venda sua produção diretamente, defina seus preços e alcance mais clientes sem intermediários.",
        icon: Leaf,
        color: "text-green-600",
        bg: "bg-green-50",
    },
    {
        title: "Para Consumidores",
        description: "Tenha acesso a alimentos frescos, saudáveis e com origem garantida, direto da fazenda.",
        icon: ShieldCheck,
        color: "text-blue-600",
        bg: "bg-blue-50",
    },
    {
        title: "Para Restaurantes",
        description: "Reduza custos de insumos e ofereça ingredientes de alta qualidade para seus clientes.",
        icon: TrendingUp,
        color: "text-orange-600",
        bg: "bg-orange-50",
    },
    {
        title: "Logística Simplificada",
        description: "Ferramentas para organizar entregas e gerenciar pedidos de forma eficiente.",
        icon: Truck,
        color: "text-purple-600",
        bg: "bg-purple-50",
    },
    {
        title: "Impacto Local",
        description: "Fortaleça a economia local apoiando pequenos e médios produtores rurais.",
        icon: Users,
        color: "text-red-600",
        bg: "bg-red-50",
    },
    {
        title: "Selo de Qualidade",
        description: "Identifique produtores com práticas sustentáveis através do nosso Selo Verde.",
        icon: Award,
        color: "text-yellow-600",
        bg: "bg-yellow-50",
    },
];

export function Features() {
    return (
        <section id="features" className="py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Por que escolher o AgroLinq?
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Uma plataforma completa pensada para todos os elos da cadeia produtiva,
                        trazendo tecnologia para o campo e qualidade para a mesa.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon className={`h-6 w-6 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
