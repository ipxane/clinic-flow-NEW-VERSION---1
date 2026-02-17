import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { BookingRequest } from "@/hooks/useBookingRequests";

interface PostponeBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: BookingRequest | null;
  onPostpone: (
    requestId: string,
    suggestedDate?: string,
    suggestedPeriod?: string,
    staffNotes?: string
  ) => Promise<void>;
}

const PERIODS = ["Morning", "Afternoon", "Evening", "Night"];

export function PostponeBookingDialog({
  open,
  onOpenChange,
  request,
  onPostpone,
}: PostponeBookingDialogProps) {
  const [suggestedDate, setSuggestedDate] = useState<Date | undefined>();
  const [suggestedPeriod, setSuggestedPeriod] = useState("");
  const [staffNotes, setStaffNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open && request) {
      setSuggestedDate(request.suggested_date ? new Date(request.suggested_date) : undefined);
      setSuggestedPeriod(request.suggested_period || "");
      setStaffNotes(request.staff_notes || "");
    }
  }, [open, request]);

  const handleSubmit = async () => {
    if (!request) return;

    setIsSubmitting(true);
    try {
      await onPostpone(
        request.id,
        suggestedDate ? format(suggestedDate, "yyyy-MM-dd") : undefined,
        suggestedPeriod || undefined,
        staffNotes.trim() || undefined
      );
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Postpone Booking Request</DialogTitle>
          <DialogDescription>
            Suggest an alternative date/time for {request.patient_name}'s appointment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Original Request Info */}
          <div className="bg-muted p-3 rounded-md text-sm">
            <p><span className="text-muted-foreground">Original request:</span></p>
            <p className="font-medium">
              {format(new Date(request.requested_date), "MMMM d, yyyy")} - {request.requested_period}
            </p>
            <p className="text-muted-foreground">{request.service_name}</p>
          </div>

          {/* Suggested Date */}
          <div className="space-y-2">
            <Label>Suggest Alternative Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !suggestedDate && "text-muted-foreground"
                  )}
                >
                  {suggestedDate ? format(suggestedDate, "PPP") : "Select a date (optional)"}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={suggestedDate}
                  onSelect={(date) => {
                    setSuggestedDate(date);
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Suggested Period */}
          <div className="space-y-2">
            <Label>Suggest Alternative Time</Label>
            <Select value={suggestedPeriod} onValueChange={setSuggestedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select period (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No preference</SelectItem>
                {PERIODS.map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Staff Notes */}
          <div className="space-y-2">
            <Label>Notes for Patient</Label>
            <Textarea
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              placeholder="Add a note explaining the postponement..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Postpone Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
