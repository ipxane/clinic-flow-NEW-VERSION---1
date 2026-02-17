import { useState, useEffect } from 'react';
import { Phone, CalendarDays, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StickyHeaderProps {
    clinicName: string;
    phoneNumber: string | null;
}

export function StickyHeader({ clinicName, phoneNumber }: StickyHeaderProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToForm = () => {
        document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isVisible
                    ? 'translate-y-0 opacity-100'
                    : '-translate-y-full opacity-0 pointer-events-none'
                }`}
        >
            <div className="bg-card/95 backdrop-blur-md border-b border-border/50 shadow-md">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Stethoscope className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground text-sm md:text-base truncate max-w-[200px] md:max-w-none">
                            {clinicName}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {phoneNumber && (
                            <a href={`tel:${phoneNumber}`}>
                                <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex">
                                    <Phone className="w-3.5 h-3.5" />
                                    Call
                                </Button>
                                <Button variant="outline" size="icon" className="sm:hidden h-8 w-8">
                                    <Phone className="w-3.5 h-3.5" />
                                </Button>
                            </a>
                        )}
                        <Button size="sm" className="gap-1.5" onClick={scrollToForm}>
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Book Appointment</span>
                            <span className="sm:hidden">Book</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
