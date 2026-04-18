"use client";
// app/dashboard/passes/[id]/page.tsx

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, RotateCcw, QrCode, MapPin, Calendar, CreditCard, AlertCircle } from "lucide-react";
import { useAppDispatch, usePasses, useAuth } from "@/hooks";
import { fetchPassById } from "@/store/slices/passSlice";
import { formatDate, formatCurrency, getStatusColor, isPassExpired } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function PassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const { currentPass, isLoading } = usePasses();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    dispatch(fetchPassById(id));
  }, [dispatch, id]);

  const handleDownload = () => {
    if (!currentPass?.qrCode) return;
    const link = document.createElement("a");
    link.href = currentPass.qrCode;
    link.download = `bus-pass-${currentPass.passNumber}.png`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!currentPass) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Pass not found</p>
        <Link href="/dashboard/passes"><Button variant="outline" className="mt-4">Back to Passes</Button></Link>
      </div>
    );
  }

  const route = typeof currentPass.routeId === "object" ? currentPass.routeId : null;
  const expired = isPassExpired(currentPass.validTo);

  return (
    <div>
      {/* Back button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to passes
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pass Card Visual */}
          <div className="pass-card">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Bus Pass</p>
                  <p className="text-white font-mono text-lg font-bold">{currentPass.passNumber}</p>
                </div>
                <span className={`status-badge ${getStatusColor(currentPass.status)} bg-white/10 border-white/20 text-white`}>
                  {currentPass.status.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1">
                  <p className="text-blue-200 text-xs uppercase mb-1">From</p>
                  <p className="text-white font-semibold">{route?.source || "N/A"}</p>
                </div>
                <div className="w-8 h-px bg-blue-300/50 flex-1 relative">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-300" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-blue-200 text-xs uppercase mb-1">To</p>
                  <p className="text-white font-semibold">{route?.destination || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-blue-200 text-xs uppercase mb-1">Holder</p>
                  <p className="text-white font-medium text-sm">{user?.name}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs uppercase mb-1">Valid Till</p>
                  <p className="text-white font-medium text-sm">{formatDate(currentPass.validTo)}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs uppercase mb-1">Type</p>
                  <p className="text-white font-medium text-sm capitalize">{currentPass.passType}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pass Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: CreditCard, label: "Pass Number", value: currentPass.passNumber },
                  { icon: MapPin, label: "Route", value: route ? `${route.source} → ${route.destination}` : "N/A" },
                  { icon: Calendar, label: "Valid From", value: formatDate(currentPass.validFrom) },
                  { icon: Calendar, label: "Valid To", value: formatDate(currentPass.validTo) },
                  { icon: CreditCard, label: "Pass Type", value: currentPass.passType.charAt(0).toUpperCase() + currentPass.passType.slice(1) },
                  { icon: CreditCard, label: "Total Fare", value: formatCurrency(currentPass.fare) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {currentPass.status === "rejected" && currentPass.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-600">{currentPass.rejectionReason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {currentPass.status === "approved" && currentPass.qrCode && (
              <Button onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />Download QR Pass
              </Button>
            )}
            {(currentPass.status === "approved" && expired) || currentPass.status === "expired" ? (
              <Link href="/dashboard/renew">
                <Button variant="outline" className="gap-2">
                  <RotateCcw className="w-4 h-4" />Renew Pass
                </Button>
              </Link>
            ) : null}
          </div>
        </div>

        {/* QR Code Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <QrCode className="w-4 h-4" />QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {currentPass.status === "approved" && currentPass.qrCode ? (
                <>
                  <div className="qr-container">
                    <img src={currentPass.qrCode} alt="Pass QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Show this QR code to the conductor when boarding
                  </p>
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleDownload}>
                    <Download className="w-3.5 h-3.5" />Save QR Code
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">QR Code Pending</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentPass.status === "pending"
                        ? "QR code will be generated once your application is approved"
                        : "QR code is not available for this pass"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader><CardTitle className="text-base">Status Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "Application Submitted", date: currentPass.createdAt, done: true },
                  { label: "Under Review", date: null, done: currentPass.status !== "pending" },
                  { label: currentPass.status === "rejected" ? "Rejected" : "Approved", date: currentPass.approvedAt || null, done: currentPass.status === "approved" || currentPass.status === "rejected" },
                  { label: "QR Code Generated", date: null, done: !!currentPass.qrCode },
                ].map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${step.done ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                      {step.done && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                      {step.date && <p className="text-xs text-muted-foreground">{formatDate(step.date)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
