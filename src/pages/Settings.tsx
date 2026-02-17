import { useState, useEffect } from "react";
import { Building2, Calendar, Clock, Plus, Trash2, Upload, Save, CalendarOff, Pencil, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettings } from "@/hooks/useSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { HolidaysSection } from "@/components/settings/HolidaysSection";
import { UsersSection } from "@/components/settings/UsersSection";
import { GallerySection } from "@/components/settings/GallerySection";
import { TestimonialsSection } from "@/components/settings/TestimonialsSection";
import { useAuthContext } from "@/contexts/AuthContext";
import { Quote, Image as ImageIcon } from "lucide-react";

export default function Settings() {
  const { isAdmin } = useAuthContext();
  const {
    clinicSettings,
    workingDays,
    holidays,
    isLoading,
    updateClinicSettings,
    toggleWorkingDay,
    addPeriod,
    updatePeriod,
    deletePeriod,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    addRecurringHoliday,
    updateRecurringHoliday,
  } = useSettings();

  // Period dialog state
  const [isAddPeriodDialogOpen, setIsAddPeriodDialogOpen] = useState(false);
  const [isEditPeriodDialogOpen, setIsEditPeriodDialogOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [selectedDayName, setSelectedDayName] = useState<string>("");
  const [editingPeriod, setEditingPeriod] = useState<{ id: string; name: string; start_time: string; end_time: string } | null>(null);
  const [periodName, setPeriodName] = useState("");
  const [periodStart, setPeriodStart] = useState("09:00");
  const [periodEnd, setPeriodEnd] = useState("12:00");

  // Local form state for clinic profile - initialized from settings
  const [clinicName, setClinicName] = useState(clinicSettings?.clinic_name || "");
  const [clinicDescription, setClinicDescription] = useState(clinicSettings?.clinic_description || "");
  const [phone, setPhone] = useState(clinicSettings?.phone || "");
  const [email, setEmail] = useState(clinicSettings?.email || "");
  const [address, setAddress] = useState(clinicSettings?.address || "");
  const [logoUrl, setLogoUrl] = useState(clinicSettings?.logo_url || "");

  // Sync form state when clinicSettings loads/changes
  useEffect(() => {
    if (clinicSettings) {
      setClinicName(clinicSettings.clinic_name || "");
      setClinicDescription(clinicSettings.clinic_description || "");
      setPhone(clinicSettings.phone || "");
      setEmail(clinicSettings.email || "");
      setAddress(clinicSettings.address || "");
      setLogoUrl(clinicSettings.logo_url || "");
    }
  }, [clinicSettings]);

  const handleSaveClinicProfile = async () => {
    await updateClinicSettings({
      clinic_name: clinicName,
      clinic_description: clinicDescription || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      logo_url: logoUrl || null,
    });
  };

  const handleOpenAddPeriod = (dayId: string, dayName: string) => {
    setSelectedDayId(dayId);
    setSelectedDayName(dayName);
    setPeriodName("");
    setPeriodStart("09:00");
    setPeriodEnd("12:00");
    setIsAddPeriodDialogOpen(true);
  };

  const handleOpenEditPeriod = (dayId: string, dayName: string, period: { id: string; name: string; start_time: string; end_time: string }) => {
    setSelectedDayId(dayId);
    setSelectedDayName(dayName);
    setEditingPeriod(period);
    setPeriodName(period.name);
    setPeriodStart(period.start_time.substring(0, 5));
    setPeriodEnd(period.end_time.substring(0, 5));
    setIsEditPeriodDialogOpen(true);
  };

  const handleAddPeriod = async () => {
    if (!selectedDayId || !periodName.trim()) return;

    await addPeriod(selectedDayId, {
      name: periodName.trim(),
      start_time: periodStart,
      end_time: periodEnd,
    });
    setIsAddPeriodDialogOpen(false);
  };

  const handleUpdatePeriod = async () => {
    if (!editingPeriod) return;

    await updatePeriod(editingPeriod.id, {
      name: periodName.trim(),
      start_time: periodStart,
      end_time: periodEnd,
    });
    setIsEditPeriodDialogOpen(false);
    setEditingPeriod(null);
  };

  const handleDeletePeriod = async (periodId: string) => {
    await deletePeriod(periodId);
  };

  const handleBookingRangeChange = async (value: string) => {
    await updateClinicSettings({ booking_range_days: parseInt(value, 10) });
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Settings"
          description="Configure your clinic settings and preferences."
        />
        <div className="space-y-6">
          <Skeleton className="h-12 w-full max-w-2xl" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Settings"
        description="Configure your clinic settings and preferences."
      />

      <Tabs defaultValue="clinic" className="space-y-6">
        <TabsList className={`grid w-full max-w-4xl ${isAdmin ? "grid-cols-5" : "grid-cols-4"}`}>
          <TabsTrigger value="clinic" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clinic Profile</span>
            <span className="sm:hidden">Clinic</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="gap-2">
            <Quote className="h-4 w-4" />
            Testimonials
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule</span>
            <span className="sm:hidden">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="holidays" className="gap-2">
            <CalendarOff className="h-4 w-4" />
            Holidays
          </TabsTrigger>
          <TabsTrigger value="booking" className="gap-2">
            <Clock className="h-4 w-4" />
            Booking
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          )}
        </TabsList>

        {/* Clinic Profile Tab */}
        <TabsContent value="clinic">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Profile</CardTitle>
              <CardDescription>
                This information will be displayed on the patient booking page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-start gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Clinic Logo" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2 flex-1 max-w-md">
                  <Label htmlFor="logo-url">Clinic Logo URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logo-url"
                      placeholder="https://..."
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                    />
                    {logoUrl && (
                      <Button variant="ghost" size="sm" onClick={() => setLogoUrl("")}>Remove</Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Provide a URL for your clinic's logo image.
                  </p>
                </div>
              </div>

              {/* Clinic Name */}
              <div className="grid gap-2">
                <Label htmlFor="clinic-name">Clinic Name</Label>
                <Input
                  id="clinic-name"
                  placeholder="Enter clinic name"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="clinic-desc">Short Description</Label>
                <Textarea
                  id="clinic-desc"
                  placeholder="Describe your clinic..."
                  rows={3}
                  value={clinicDescription}
                  onChange={(e) => setClinicDescription(e.target.value)}
                />
              </div>

              {/* Contact Information */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="clinic-phone">Phone Number</Label>
                  <Input
                    id="clinic-phone"
                    placeholder="+1 234-567-8900"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clinic-email">Email Address</Label>
                  <Input
                    id="clinic-email"
                    type="email"
                    placeholder="contact@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="clinic-address">Address</Label>
                <Input
                  id="clinic-address"
                  placeholder="Enter clinic address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveClinicProfile}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <CardTitle>Gallery Management</CardTitle>
              <CardDescription>
                Customize the images shown in your clinic's gallery.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GallerySection />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <CardTitle>Testimonials Management</CardTitle>
              <CardDescription>
                Control the patient feedback displayed on your marketing page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestimonialsSection />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Working Days & Periods Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Working Days & Periods</CardTitle>
              <CardDescription>
                Configure your clinic's working schedule. Gaps between periods are automatically considered breaks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workingDays.map((day) => (
                <div key={day.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={day.is_working}
                        onCheckedChange={(checked) => toggleWorkingDay(day.id, checked)}
                      />
                      <span className={`font-medium ${!day.is_working ? "text-muted-foreground" : ""}`}>
                        {day.day_name}
                      </span>
                      {!day.is_working && (
                        <Badge variant="secondary">Closed</Badge>
                      )}
                    </div>
                    {day.is_working && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAddPeriod(day.id, day.day_name)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Period
                      </Button>
                    )}
                  </div>

                  {day.is_working && day.periods.length > 0 && (
                    <div className="space-y-2 ml-10">
                      {day.periods.map((period) => (
                        <div
                          key={period.id}
                          className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-2"
                        >
                          <div className="flex items-center gap-4">
                            <span className="font-medium">{period.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {period.start_time.substring(0, 5)} - {period.end_time.substring(0, 5)}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleOpenEditPeriod(day.id, day.day_name, period)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeletePeriod(period.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {day.is_working && day.periods.length === 0 && (
                    <p className="ml-10 text-sm text-muted-foreground">
                      No periods configured. Add a period to enable bookings.
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Holidays Tab */}
        <TabsContent value="holidays">
          <div className="space-y-1 mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Holidays & Special Dates</h2>
            <p className="text-muted-foreground">
              Manage clinic closures and holidays that affect the booking calendar.
            </p>
          </div>
          <HolidaysSection
            holidays={holidays}
            addHoliday={addHoliday}
            updateHoliday={updateHoliday}
            deleteHoliday={deleteHoliday}
            addRecurringHoliday={addRecurringHoliday}
            updateRecurringHoliday={updateRecurringHoliday}
          />
        </TabsContent>

        {/* Booking Range Tab */}
        <TabsContent value="booking">
          <Card>
            <CardHeader>
              <CardTitle>Booking Range Settings</CardTitle>
              <CardDescription>
                Control how far in advance patients can book appointments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="booking-range-toggle" className="text-base font-medium">
                    Enable Booking Range Limit
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {clinicSettings?.booking_range_enabled !== false
                      ? "Appointments are limited to a maximum advance booking period."
                      : "Booking range is disabled. Appointments can be scheduled without any advance limit."}
                  </p>
                </div>
                <Switch
                  id="booking-range-toggle"
                  checked={clinicSettings?.booking_range_enabled !== false}
                  onCheckedChange={(checked) => updateClinicSettings({ booking_range_enabled: checked })}
                />
              </div>

              {/* Days Input - only shown when enabled */}
              {clinicSettings?.booking_range_enabled !== false && (
                <div className="grid gap-2 max-w-sm">
                  <Label htmlFor="booking-range">Maximum Booking Range</Label>
                  <Select
                    value={clinicSettings?.booking_range_days?.toString() || "30"}
                    onValueChange={handleBookingRangeChange}
                  >
                    <SelectTrigger id="booking-range">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="15">15 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="45">45 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Patients can book appointments up to {clinicSettings?.booking_range_days || 30} days in advance.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab - Admin Only */}
        {isAdmin && (
          <TabsContent value="users">
            <UsersSection />
          </TabsContent>
        )}
      </Tabs>

      {/* Add Period Dialog */}
      <Dialog open={isAddPeriodDialogOpen} onOpenChange={setIsAddPeriodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Period for {selectedDayName}</DialogTitle>
            <DialogDescription>
              Define a new working period. Any gap between periods is considered a break.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="period-name">Period Name</Label>
              <Input
                id="period-name"
                placeholder="e.g., Morning, Afternoon, Evening"
                value={periodName}
                onChange={(e) => setPeriodName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="period-start">Start Time</Label>
                <Input
                  id="period-start"
                  type="time"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="period-end">End Time</Label>
                <Input
                  id="period-end"
                  type="time"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPeriodDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPeriod} disabled={!periodName.trim()}>
              Add Period
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Period Dialog */}
      <Dialog open={isEditPeriodDialogOpen} onOpenChange={setIsEditPeriodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Period for {selectedDayName}</DialogTitle>
            <DialogDescription>
              Update the working period details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-period-name">Period Name</Label>
              <Input
                id="edit-period-name"
                placeholder="e.g., Morning, Afternoon, Evening"
                value={periodName}
                onChange={(e) => setPeriodName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-period-start">Start Time</Label>
                <Input
                  id="edit-period-start"
                  type="time"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-period-end">End Time</Label>
                <Input
                  id="edit-period-end"
                  type="time"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPeriodDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePeriod} disabled={!periodName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
