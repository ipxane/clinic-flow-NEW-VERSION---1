import { Clock, Phone, CalendarDays, Star, LucideIcon } from 'lucide-react';
import { MarketingFeature } from '@/lib/marketing-content';

interface FeatureCardsProps {
    feature1Title: string | null;
    feature1Description: string | null;
    feature2Title: string | null;
    feature2Description: string | null;
    feature3Title: string | null;
    feature3Description: string | null;
    extraFeatures?: MarketingFeature[];
}

const defaultIcons: LucideIcon[] = [Clock, Phone, CalendarDays, Star];

export function FeatureCards({
    feature1Title,
    feature1Description,
    feature2Title,
    feature2Description,
    feature3Title,
    feature3Description,
    extraFeatures,
}: FeatureCardsProps) {
    const baseFeatures = [
        { title: feature1Title || 'Quick Response', description: feature1Description || 'We will contact you soon' },
        { title: feature2Title || 'Personal Call', description: feature2Description || 'Staff will confirm details' },
        { title: feature3Title || 'Flexible Booking', description: feature3Description || 'Choose your preferred time' },
    ];

    // Merge extra features from marketing_content
    const allFeatures = extraFeatures && extraFeatures.length > 0
        ? [...baseFeatures, ...extraFeatures.map(f => ({ title: f.title, description: f.description }))]
        : baseFeatures;

    const columns = allFeatures.length <= 3 ? 3 : 4;

    return (
        <section className="py-12 md:py-16 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/2 to-transparent" />
            <div className="relative container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    {allFeatures.length > 3 && (
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Why Choose Us</h2>
                        </div>
                    )}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns} gap-6 md:gap-8`}>
                        {allFeatures.map((feature, index) => {
                            const Icon = defaultIcons[index % defaultIcons.length];
                            return (
                                <div
                                    key={index}
                                    className="group relative bg-card rounded-2xl border border-border/50 p-8 text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-[60px] rounded-tr-2xl" />
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                                            <Icon className="w-8 h-8 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
