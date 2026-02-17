import { useState } from "react";
import { Plus, Trash2, Pencil, CalendarOff, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Holiday, HolidayType } from "@/hooks/useSettings";

// Month names for display
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Short month names
const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Days per month (ignoring leap years for validation simplicity)
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

interface HolidaysSectionProps {
  holidays: Holiday[];
  addHoliday: (holiday: { 
    date: string; 
    type: HolidayType; 
    note?: string;
    start_date?: string;
    end_date?: string;
  }) => Promise<Holiday | null>;
  updateHoliday: (
    holidayId: string,
    updates: { date?: string; type?: HolidayType; note?: string | null; start_date?: string | null; end_date?: string | null }
  ) => Promise<void>;
  deleteHoliday: (holidayId: string) => Promise<void>;
  addRecurringHoliday: (holiday: {
    recurring_start_month: number;
    recurring_start_day: number;
    recurring_end_month: number;
    recurring_end_day: number;
    note?: string;
  }) => Promise<Holiday | null>;
  updateRecurringHoliday: (
    holidayId: string,
    updates: {
      recurring_start_month?: number;
      recurring_start_day?: number;
      recurring_end_month?: number;
      recurring_end_day?: number;
      note?: string | null;
    }
  ) => Promise<void>;
}

// Types for Section 1 (excludes holiday type and recurring_annual)
type SpecificHolidayType = "closed" | "long_holiday" | "special";

export function HolidaysSection({
  holidays,
  addHoliday,
  updateHoliday,
  deleteHoliday,
  addRecurringHoliday,
  updateRecurringHoliday,
}: HolidaysSectionProps) {
  // Section 1: Specific Dates dialog state
  const [isAddSpecificDialogOpen, setIsAddSpecificDialogOpen] = useState(false);
  const [isEditSpecificDialogOpen, setIsEditSpecificDialogOpen] = useState(false);
  const [editingSpecificHoliday, setEditingSpecificHoliday] = useState<Holiday | null>(null);
  const [specificDate, setSpecificDate] = useState("");
  const [specificType, setSpecificType] = useState<SpecificHolidayType>("closed");
  const [specificNote, setSpecificNote] = useState("");
  const [specificStartDate, setSpecificStartDate] = useState("");
  const [specificEndDate, setSpecificEndDate] = useState("");

  // Section 2: Recurring dialog state
  const [isAddRecurringDialogOpen, setIsAddRecurringDialogOpen] = useState(false);
  const [isEditRecurringDialogOpen, setIsEditRecurringDialogOpen] = useState(false);
  const [editingRecurringHoliday, setEditingRecurringHoliday] = useState<Holiday | null>(null);
  const [recurringStartMonth, setRecurringStartMonth] = useState("1");
  const [recurringStartDay, setRecurringStartDay] = useState("1");
  const [recurringEndMonth, setRecurringEndMonth] = useState("1");
  const [recurringEndDay, setRecurringEndDay] = useState("1");
  const [recurringNote, setRecurringNote] = useState("");

  // Filter holidays by section
  const specificHolidays = holidays.filter(h => h.type !== "recurring_annual" && h.type !== "holiday");
  const recurringHolidays = holidays.filter(h => h.type === "recurring_annual");

  // --- Section 1: Specific Dates & Ranges handlers ---
  const handleOpenAddSpecific = () => {
    setSpecificDate("");
    setSpecificType("closed");
    setSpecificNote("");
    setSpecificStartDate("");
    setSpecificEndDate("");
    setIsAddSpecificDialogOpen(true);
  };

  const handleOpenEditSpecific = (holiday: Holiday) => {
    setEditingSpecificHoliday(holiday);
    setSpecificDate(holiday.date);
    setSpecificType(holiday.type as SpecificHolidayType);
    setSpecificNote(holiday.note || "");
    setSpecificStartDate(holiday.start_date || "");
    setSpecificEndDate(holiday.end_date || "");
    setIsEditSpecificDialogOpen(true);
  };

  const handleAddSpecific = async () => {
    if (specificType === "long_holiday") {
      if (!specificStartDate || !specificEndDate) return;
      if (specificEndDate < specificStartDate) return;
    } else {
      if (!specificDate) return;
    }
    
    await addHoliday({
      date: specificType === "long_holiday" ? specificStartDate : specificDate,
      type: specificType,
      note: specificNote.trim() || undefined,
      start_date: specificType === "long_holiday" ? specificStartDate : undefined,
      end_date: specificType === "long_holiday" ? specificEndDate : undefined,
    });
    setIsAddSpecificDialogOpen(false);
  };

  const handleUpdateSpecific = async () => {
    if (!editingSpecificHoliday) return;
    
    if (specificType === "long_holiday") {
      if (!specificStartDate || !specificEndDate) return;
      if (specificEndDate < specificStartDate) return;
    } else {
      if (!specificDate) return;
    }
    
    await updateHoliday(editingSpecificHoliday.id, {
      date: specificType === "long_holiday" ? specificStartDate : specificDate,
      type: specificType,
      note: specificNote.trim() || null,
      start_date: specificType === "long_holiday" ? specificStartDate : null,
      end_date: specificType === "long_holiday" ? specificEndDate : null,
    });
    setIsEditSpecificDialogOpen(false);
    setEditingSpecificHoliday(null);
  };

  // --- Section 2: Recurring Annual Holidays handlers ---
  const handleOpenAddRecurring = () => {
    setRecurringStartMonth("1");
    setRecurringStartDay("1");
    setRecurringEndMonth("1");
    setRecurringEndDay("1");
    setRecurringNote("");
    setIsAddRecurringDialogOpen(true);
  };

  const handleOpenEditRecurring = (holiday: Holiday) => {
    setEditingRecurringHoliday(holiday);
    setRecurringStartMonth(String(holiday.recurring_start_month || 1));
    setRecurringStartDay(String(holiday.recurring_start_day || 1));
    setRecurringEndMonth(String(holiday.recurring_end_month || 1));
    setRecurringEndDay(String(holiday.recurring_end_day || 1));
    setRecurringNote(holiday.note || "");
    setIsEditRecurringDialogOpen(true);
  };

  const handleAddRecurring = async () => {
    await addRecurringHoliday({
      recurring_start_month: parseInt(recurringStartMonth),
      recurring_start_day: parseInt(recurringStartDay),
      recurring_end_month: parseInt(recurringEndMonth),
      recurring_end_day: parseInt(recurringEndDay),
      note: recurringNote.trim() || undefined,
    });
    setIsAddRecurringDialogOpen(false);
  };

  const handleUpdateRecurring = async () => {
    if (!editingRecurringHoliday) return;
    
    await updateRecurringHoliday(editingRecurringHoliday.id, {
      recurring_start_month: parseInt(recurringStartMonth),
      recurring_start_day: parseInt(recurringStartDay),
      recurring_end_month: parseInt(recurringEndMonth),
      recurring_end_day: parseInt(recurringEndDay),
      note: recurringNote.trim() || null,
    });
    setIsEditRecurringDialogOpen(false);
    setEditingRecurringHoliday(null);
  };

  // --- Formatting helpers ---
  const getSpecificTypeBadge = (type: HolidayType) => {
    switch (type) {
      case "closed":
        return <Badge variant="destructive">Closed</Badge>;
      case "special":
        return <Badge variant="secondary">Special</Badge>;
      case "long_holiday":
        return <Badge variant="outline">Date Range</Badge>;
      default:
        return <Badge variant="default">{type}</Badge>;
    }
  };

  const formatSpecificDate = (holiday: Holiday) => {
    if (holiday.type === "long_holiday" && holiday.start_date && holiday.end_date) {
      const startFormatted = new Date(holiday.start_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const endFormatted = new Date(holiday.end_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${startFormatted} - ${endFormatted}`;
    }
    return new Date(holiday.date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatRecurringPeriod = (holiday: Holiday) => {
    if (!holiday.recurring_start_month || !holiday.recurring_start_day ||
        !holiday.recurring_end_month || !holiday.recurring_end_day) {
      return "—";
    }
    const startMonth = SHORT_MONTHS[holiday.recurring_start_month - 1];
    const endMonth = SHORT_MONTHS[holiday.recurring_end_month - 1];
    
    if (holiday.recurring_start_month === holiday.recurring_end_month &&
        holiday.recurring_start_day === holiday.recurring_end_day) {
      return `${startMonth} ${holiday.recurring_start_day}`;
    }
    return `${startMonth} ${holiday.recurring_start_day} - ${endMonth} ${holiday.recurring_end_day}`;
  };

  // Generate day options based on selected month
  const getDaysForMonth = (month: string) => {
    const monthIndex = parseInt(month) - 1;
    const maxDays = DAYS_IN_MONTH[monthIndex] || 31;
    return Array.from({ length: maxDays }, (_, i) => i + 1);
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Specific Dates & Ranges */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarOff className="h-5 w-5" />
              Specific Dates & Ranges
            </CardTitle>
            <CardDescription>
              One-time or temporary closures and special days. These apply only to the specified dates.
            </CardDescription>
          </div>
          <Button onClick={handleOpenAddSpecific}>
            <Plus className="mr-2 h-4 w-4" />
            Add Exception
          </Button>
        </CardHeader>
        <CardContent>
          {specificHolidays.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No specific exceptions configured.</p>
              <p className="text-sm">Add closed dates or date ranges to block bookings.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date / Range</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specificHolidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell className="font-medium">
                        {formatSpecificDate(holiday)}
                      </TableCell>
                      <TableCell>{getSpecificTypeBadge(holiday.type)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {holiday.note || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEditSpecific(holiday)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteHoliday(holiday.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 rounded-lg bg-muted/50 p-4">
            <h4 className="font-medium mb-2">Exception Types</h4>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <p><strong>Closed:</strong> Single day clinic closure (e.g., maintenance)</p>
              <p><strong>Date Range:</strong> Extended closure spanning multiple days (e.g., vacation)</p>
              <p><strong>Special:</strong> Day with different working hours (does not block booking)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Recurring Annual Holidays */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Recurring Annual Holidays
            </CardTitle>
            <CardDescription>
              Holidays that repeat every year automatically. Define the period once and it applies to all future years.
            </CardDescription>
          </div>
          <Button onClick={handleOpenAddRecurring}>
            <Plus className="mr-2 h-4 w-4" />
            Add Recurring Holiday
          </Button>
        </CardHeader>
        <CardContent>
          {recurringHolidays.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recurring holidays configured.</p>
              <p className="text-sm">Add annual holidays like New Year or Christmas.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period (Every Year)</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurringHolidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell className="font-medium">
                        {formatRecurringPeriod(holiday)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {holiday.note || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEditRecurring(holiday)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteHoliday(holiday.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Specific Date Dialog */}
      <Dialog open={isAddSpecificDialogOpen} onOpenChange={setIsAddSpecificDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Exception</DialogTitle>
            <DialogDescription>
              Add a specific date or date range when the clinic is closed or has special hours.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="specific-type">Type</Label>
              <Select value={specificType} onValueChange={(v) => setSpecificType(v as SpecificHolidayType)}>
                <SelectTrigger id="specific-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="long_holiday">Date Range</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {specificType === "long_holiday" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="specific-start-date">Start Date</Label>
                  <Input 
                    id="specific-start-date" 
                    type="date" 
                    value={specificStartDate}
                    onChange={(e) => setSpecificStartDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="specific-end-date">End Date</Label>
                  <Input 
                    id="specific-end-date" 
                    type="date" 
                    value={specificEndDate}
                    min={specificStartDate}
                    onChange={(e) => setSpecificEndDate(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="specific-date">Date</Label>
                <Input 
                  id="specific-date" 
                  type="date" 
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                />
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="specific-note">Note (Optional)</Label>
              <Input 
                id="specific-note" 
                placeholder="e.g., Doctor unavailable, Maintenance" 
                value={specificNote}
                onChange={(e) => setSpecificNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSpecificDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddSpecific} 
              disabled={specificType === "long_holiday" 
                ? (!specificStartDate || !specificEndDate || specificEndDate < specificStartDate) 
                : !specificDate
              }
            >
              Add Exception
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Specific Date Dialog */}
      <Dialog open={isEditSpecificDialogOpen} onOpenChange={setIsEditSpecificDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exception</DialogTitle>
            <DialogDescription>
              Update the exception details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-specific-type">Type</Label>
              <Select value={specificType} onValueChange={(v) => setSpecificType(v as SpecificHolidayType)}>
                <SelectTrigger id="edit-specific-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="long_holiday">Date Range</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {specificType === "long_holiday" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-specific-start-date">Start Date</Label>
                  <Input 
                    id="edit-specific-start-date" 
                    type="date" 
                    value={specificStartDate}
                    onChange={(e) => setSpecificStartDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-specific-end-date">End Date</Label>
                  <Input 
                    id="edit-specific-end-date" 
                    type="date" 
                    value={specificEndDate}
                    min={specificStartDate}
                    onChange={(e) => setSpecificEndDate(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="edit-specific-date">Date</Label>
                <Input 
                  id="edit-specific-date" 
                  type="date" 
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                />
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="edit-specific-note">Note (Optional)</Label>
              <Input 
                id="edit-specific-note" 
                placeholder="e.g., Doctor unavailable, Maintenance" 
                value={specificNote}
                onChange={(e) => setSpecificNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSpecificDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateSpecific} 
              disabled={specificType === "long_holiday" 
                ? (!specificStartDate || !specificEndDate || specificEndDate < specificStartDate) 
                : !specificDate
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Recurring Holiday Dialog */}
      <Dialog open={isAddRecurringDialogOpen} onOpenChange={setIsAddRecurringDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Recurring Annual Holiday</DialogTitle>
            <DialogDescription>
              Define a holiday period that repeats every year. No year selection needed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>From</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={recurringStartMonth} onValueChange={setRecurringStartMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, i) => (
                      <SelectItem key={i} value={String(i + 1)}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={recurringStartDay} onValueChange={setRecurringStartDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDaysForMonth(recurringStartMonth).map((day) => (
                      <SelectItem key={day} value={String(day)}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>To</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={recurringEndMonth} onValueChange={setRecurringEndMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, i) => (
                      <SelectItem key={i} value={String(i + 1)}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={recurringEndDay} onValueChange={setRecurringEndDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDaysForMonth(recurringEndMonth).map((day) => (
                      <SelectItem key={day} value={String(day)}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="recurring-note">Note (Optional)</Label>
              <Input 
                id="recurring-note" 
                placeholder="e.g., New Year Holiday, Christmas Break" 
                value={recurringNote}
                onChange={(e) => setRecurringNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRecurringDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRecurring}>
              Add Recurring Holiday
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Recurring Holiday Dialog */}
      <Dialog open={isEditRecurringDialogOpen} onOpenChange={setIsEditRecurringDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Recurring Annual Holiday</DialogTitle>
            <DialogDescription>
              Update the recurring holiday period.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>From</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={recurringStartMonth} onValueChange={setRecurringStartMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, i) => (
                      <SelectItem key={i} value={String(i + 1)}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={recurringStartDay} onValueChange={setRecurringStartDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDaysForMonth(recurringStartMonth).map((day) => (
                      <SelectItem key={day} value={String(day)}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>To</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={recurringEndMonth} onValueChange={setRecurringEndMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, i) => (
                      <SelectItem key={i} value={String(i + 1)}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={recurringEndDay} onValueChange={setRecurringEndDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDaysForMonth(recurringEndMonth).map((day) => (
                      <SelectItem key={day} value={String(day)}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-recurring-note">Note (Optional)</Label>
              <Input 
                id="edit-recurring-note" 
                placeholder="e.g., New Year Holiday, Christmas Break" 
                value={recurringNote}
                onChange={(e) => setRecurringNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRecurringDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRecurring}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
