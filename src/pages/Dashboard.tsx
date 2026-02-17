import { useMemo } from "react";
import { Users, CalendarClock, Calendar, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatsCard } from "@/components/ui/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientStatusBadge } from "@/components/patients/PatientStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/useDashboardData";
import { TodayAppointmentsWidget } from "@/components/dashboard/TodayAppointmentsWidget";

export default function Dashboard() {
  const {
    patients,
    todayAppointments,
    weekAppointments,
    isLoading,
    clinicName,
    refetch,
  } = useDashboardData();

  // Calculate stats
  const stats = useMemo(() => {
    const totalPatients = patients.filter(p => p.status !== "archived").length;
    const pendingToday = todayAppointments.filter(a => a.status === "pending").length;
    const todayCount = todayAppointments.length;
    const completedThisWeek = weekAppointments.filter(a => a.status === "completed").length;

    return {
      totalPatients,
      pendingToday,
      todayCount,
      completedThisWeek,
    };
  }, [patients, todayAppointments, weekAppointments]);

  // Get upcoming appointments (today, confirmed or pending, sorted by time)
  const upcomingAppointments = useMemo(() => {
    return todayAppointments
      .filter(a => a.status === "pending" || a.status === "confirmed")
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
      .slice(0, 5);
  }, [todayAppointments]);

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Dashboard"
          description="Loading clinic overview..."
        />
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description={`Welcome to ${clinicName}. Here's your clinic overview.`}
      />

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Patients"
          value={stats.totalPatients.toString()}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="Pending Today"
          value={stats.pendingToday.toString()}
          icon={<CalendarClock className="h-5 w-5" />}
        />
        <StatsCard
          title="Today's Appointments"
          value={stats.todayCount.toString()}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatsCard
          title="Completed This Week"
          value={stats.completedThisWeek.toString()}
          icon={<CheckCircle className="h-5 w-5" />}
        />
      </div>

      {/* Visit Management Widget - Full Width */}
      <div className="mb-6">
        <TodayAppointmentsWidget
          appointments={todayAppointments}
          isLoading={isLoading}
          onStatusChange={refetch}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Appointments (Quick View) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingAppointments.length === 0 ? (
              <div className="px-6 py-8 text-center text-muted-foreground">
                No upcoming appointments for today.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div>
                      <p className="font-medium">{appointment.patient?.full_name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.service?.name || "Unknown Service"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatTime(appointment.start_time)}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.period_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Patients</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {patients.length === 0 ? (
              <div className="px-6 py-8 text-center text-muted-foreground">
                No patients registered yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {patients
                  .filter(p => p.status !== "archived")
                  .slice(0, 5)
                  .map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between px-6 py-4"
                    >
                      <div>
                        <p className="font-medium">{patient.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {patient.patient_type === "adult" ? patient.phone : `Child • ${patient.guardian?.full_name || "—"}`}
                        </p>
                      </div>
                      <PatientStatusBadge status={patient.status} />
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
