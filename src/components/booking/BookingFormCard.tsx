import { CalendarDays, Phone, User, Loader2, Clock, Calendar, AlertCircle, Ban, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

import {
    Service,
    WorkingPeriod,
    AvailableDate,
    DateStatus,
    PeriodStatus
} from '@/lib/booking-engine';

export interface BookingFormData {
    phone_number: string;
    full_name: string;
    date_of_birth: string;
    service_id: string;
    preferred_date: string;
    preferred_period_id: string;
    patient_type: 'adult' | 'child';
    guardian_phone_number: string;
    guardian_name: string;
    guardian_email: string;
}

interface BookingFormCardProps {
    services: Service[];
    availableDates: AvailableDate[];
    availablePeriods: (WorkingPeriod & { status: PeriodStatus; availableSlots: number })[];
    formData: BookingFormData;
    setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>;
    isSubmitting: boolean;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    selectedDateInfo: AvailableDate | null | undefined;
}

export function BookingFormCard({
    services,
    availableDates,
    availablePeriods,
    formData,
    setFormData,
    isSubmitting,
    onSubmit,
    selectedDateInfo,
}: BookingFormCardProps) {
    const isChild = formData.patient_type === 'child';

    return (
        <section className="py-8 md:py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto">
                    <Card className="shadow-xl border-border/40 overflow-hidden" id="booking-form">
                        {/* Card Header with gradient accent */}
                        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                            <CardHeader className="text-center pb-4 pt-8">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <CalendarDays className="w-7 h-7 text-primary" />
                                </div>
                                <CardTitle className="text-2xl md:text-3xl">Request an Appointment</CardTitle>
                                <CardDescription className="text-base mt-3 max-w-md mx-auto">
                                    Fill out the form below and our staff will contact you to confirm the exact time.
                                </CardDescription>
                            </CardHeader>
                        </div>

                        <CardContent className="p-6 md:p-8">
                            <form onSubmit={onSubmit} className="space-y-8">
                                {/* Contact Information Section */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">Contact Information</h3>
                                            <p className="text-xs text-muted-foreground">How we can reach you</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone_number" className="text-sm font-medium">Phone Number *</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="phone_number"
                                                placeholder="05X XXX XXXX"
                                                className="pl-12 h-12 text-base"
                                                value={formData.phone_number}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground pl-1">This will be used to contact you and identify your records</p>
                                    </div>
                                </div>

                                {/* Personal Information Section */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">Personal Information</h3>
                                            <p className="text-xs text-muted-foreground">Tell us about the patient</p>
                                        </div>
                                    </div>

                                    {/* Patient Type Selector */}
                                    <div className="space-y-2">
                                        <Label htmlFor="patient_type" className="text-sm font-medium">Patient Type</Label>
                                        <Select
                                            value={formData.patient_type}
                                            onValueChange={(value: 'adult' | 'child') => setFormData(prev => ({
                                                ...prev,
                                                patient_type: value,
                                                // Clear guardian fields when switching back to adult
                                                ...(value === 'adult' ? { guardian_phone_number: '', guardian_name: '', guardian_email: '' } : {}),
                                            }))}
                                        >
                                            <SelectTrigger className="h-12 text-base">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="adult">Adult</SelectItem>
                                                <SelectItem value="child">Child</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="full_name" className="text-sm font-medium">
                                                {isChild ? 'Child Full Name' : 'Full Name'} *
                                            </Label>
                                            <Input
                                                id="full_name"
                                                placeholder={isChild ? "Enter child's full name" : "Enter your full name"}
                                                className="h-12 text-base"
                                                value={formData.full_name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="date_of_birth" className="text-sm font-medium">Date of Birth *</Label>
                                            <Input
                                                id="date_of_birth"
                                                type="date"
                                                className="h-12 text-base"
                                                value={formData.date_of_birth}
                                                onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Guardian Information Section - only for children */}
                                {isChild && (
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Users className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">Guardian Information</h3>
                                                <p className="text-xs text-muted-foreground">Parent or guardian details</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guardian_phone_number" className="text-sm font-medium">Guardian Phone Number *</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="guardian_phone_number"
                                                    placeholder="05X XXX XXXX"
                                                    className="pl-12 h-12 text-base"
                                                    value={formData.guardian_phone_number}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, guardian_phone_number: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="guardian_name" className="text-sm font-medium">Guardian Name *</Label>
                                                <Input
                                                    id="guardian_name"
                                                    placeholder="Enter guardian's full name"
                                                    className="h-12 text-base"
                                                    value={formData.guardian_name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, guardian_name: e.target.value }))}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="guardian_email" className="text-sm font-medium">Guardian Email</Label>
                                                <Input
                                                    id="guardian_email"
                                                    type="email"
                                                    placeholder="email@example.com (optional)"
                                                    className="h-12 text-base"
                                                    value={formData.guardian_email}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, guardian_email: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Appointment Details Section */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">Appointment Details</h3>
                                            <p className="text-xs text-muted-foreground">Choose your service and time</p>
                                        </div>
                                    </div>

                                    {/* Service Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="service" className="text-sm font-medium">Select Service *</Label>
                                        <Select
                                            value={formData.service_id}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, service_id: value }))}
                                        >
                                            <SelectTrigger className="h-12 text-base">
                                                <SelectValue placeholder="Choose a service" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {services.map((service) => (
                                                    <SelectItem key={service.id} value={service.id}>
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span>{service.name}</span>
                                                            <span className="text-muted-foreground text-sm">
                                                                {service.duration} min {service.price > 0 ? `• ${service.price} SAR` : ''}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formData.service_id && (
                                            <p className="text-sm text-muted-foreground pl-1">
                                                {services.find(s => s.id === formData.service_id)?.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Date & Period Selection */}
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="date" className="text-sm font-medium">Preferred Date *</Label>
                                            <Select
                                                value={formData.preferred_date}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_date: value, preferred_period_id: '' }))}
                                            >
                                                <SelectTrigger className="h-12 text-base">
                                                    <SelectValue placeholder="Select a date" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableDates.map((dateInfo) => (
                                                        <SelectItem
                                                            key={dateInfo.date}
                                                            value={dateInfo.date}
                                                            disabled={dateInfo.status !== 'available'}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {dateInfo.status === 'holiday' && (
                                                                    <Ban className="w-4 h-4 text-destructive" />
                                                                )}
                                                                {(dateInfo.status === 'no_periods' || dateInfo.status === 'full') && (
                                                                    <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
                                                                )}
                                                                <span className={dateInfo.status !== 'available' ? 'text-muted-foreground' : ''}>
                                                                    {dateInfo.label}
                                                                </span>
                                                                {dateInfo.status === 'holiday' && (
                                                                    <span className="text-xs text-destructive ml-1">(Holiday)</span>
                                                                )}
                                                                {dateInfo.status === 'no_periods' && (
                                                                    <span className="text-xs text-[#F59E0B] ml-1">(Closed)</span>
                                                                )}
                                                                {dateInfo.status === 'full' && (
                                                                    <span className="text-xs text-[#F59E0B] ml-1">(Fully Booked)</span>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="period" className="text-sm font-medium">Preferred Period *</Label>
                                            <Select
                                                value={formData.preferred_period_id}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_period_id: value }))}
                                                disabled={!formData.preferred_date || selectedDateInfo?.status !== 'available'}
                                            >
                                                <SelectTrigger className="h-12 text-base">
                                                    <SelectValue placeholder={
                                                        !formData.preferred_date
                                                            ? "Select date first"
                                                            : selectedDateInfo?.status !== 'available'
                                                                ? "Date not available"
                                                                : "Select a period"
                                                    } />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availablePeriods.map((period) => (
                                                        <SelectItem
                                                            key={period.id}
                                                            value={period.id}
                                                            disabled={period.status === 'full'}
                                                            className={cn(
                                                                "h-12 border-b border-border/40 last:border-0",
                                                                period.status === 'full' && "opacity-60 cursor-not-allowed bg-muted/30"
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-between w-full pr-2">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn(
                                                                        "w-8 h-8 rounded-lg flex items-center justify-center",
                                                                        period.status === 'full' ? "bg-muted text-muted-foreground" : "bg-primary/5 text-primary"
                                                                    )}>
                                                                        <Clock className="w-4 h-4" />
                                                                    </div>
                                                                    <span className={cn(
                                                                        "font-medium",
                                                                        period.status === 'full' ? "text-muted-foreground" : "text-foreground"
                                                                    )}>
                                                                        {period.name}
                                                                    </span>
                                                                </div>
                                                                {period.status === 'full' && (
                                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted border border-border/50">
                                                                        <Ban className="w-3 h-3 text-muted-foreground" />
                                                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                                                            Fully Booked
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Show reason why date is unavailable */}
                                    {selectedDateInfo && selectedDateInfo.status !== 'available' && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                {selectedDateInfo.status === 'holiday' && (
                                                    <span className="font-medium">Holiday: </span>
                                                )}
                                                {selectedDateInfo.status === 'no_periods' && (
                                                    <span className="font-medium">Clinic Closed: </span>
                                                )}
                                                {selectedDateInfo.status === 'full' && (
                                                    <span className="font-medium">Fully Booked: </span>
                                                )}
                                                {selectedDateInfo.reason}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="bg-muted/40 px-5 py-4 rounded-xl border border-border/30">
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold text-foreground">Note:</span> The exact appointment time will be confirmed by our staff after reviewing your request.
                                        </p>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                                    size="lg"
                                    disabled={isSubmitting || (selectedDateInfo?.status !== 'available')}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CalendarDays className="w-5 h-5 mr-2" />
                                            Submit Booking Request
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
