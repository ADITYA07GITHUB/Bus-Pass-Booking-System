"use client";
// app/admin/passes/[id]/page.tsx

import { useEffect, use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, User, MapPin, Calendar, CreditCard, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { updatePassStatus } from "@/store/slices/adminSlice";
import { formatDate, formatCurrency, getStatusColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { BusPass } from "@/types";

export default function AdminPassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const [pass, setPass] = useState<BusPass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch(`/api/admin/passes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { setPass(d.data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, [id]);

  const handleApprove = async () => {
    if (!pass) return;
    setActionLoading(true);
    try {
      await dispatch(updatePassStatus({ passId: pass._id, status: "approved" })).unwrap();
      toast({ title: "Pass Approved", description: "QR code has been generated." });
      router.push("/admin/passes");
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: String(err) });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!pass) return;
    setActionLoading(true);
    try {
      await dispatch(updatePassStatus({ passId: pass._id, status: "rejected", rejectionReason })).unwrap();
      toast({ title: "Pass Rejected" });
      router.push("/admin/passes");
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: String(err) });
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pass) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Pass not found</p>
        <Link href="/admin/passes"><Button variant="outline" className="mt-4">Back to Passes</Button></Link>
      </div>
    );
  }

  const user = typeof pass.userId === "object" ? pass.userId : null;
  const route = typeof pass.routeId === "object" ? pass.routeId : null;

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to Applications
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title">Pass Application</h1>
          <p className="font-mono text-sm text-muted-foreground">{pass.passNumber}</p>
        </div>
        <span className={`status-badge text-sm px-3 py-1.5 ${getStatusColor(pass.status)}`}>
          {pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applicant Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />Applicant Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                {(user as { name?: string })?.name?.charAt(0) ?? "?"}
              </div>
              <div>
                <p className="font-semibold">{(user as { name?: string })?.name ?? "Unknown"}</p>
                <p className="text-sm text-muted-foreground">{(user as { email?: string })?.email ?? "—"}</p>
              </div>
            </div>
            {[
              { label: "Phone", value: (user as { phone?: string })?.phone ?? "—" },
              { label: "Address", value: (user as { address?: string })?.address ?? "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pass Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />Pass Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: MapPin, label: "Route", value: route ? `${route.source} → ${route.destination}` : "N/A" },
                { icon: CreditCard, label: "Pass Type", value: pass.passType.charAt(0).toUpperCase() + pass.passType.slice(1) },
                { icon: Calendar, label: "Applied On", value: formatDate(pass.createdAt) },
                { icon: Calendar, label: "Valid From", value: formatDate(pass.validFrom) },
                { icon: Calendar, label: "Valid To", value: formatDate(pass.validTo) },
                { icon: CreditCard, label: "Total Fare", value: formatCurrency(pass.fare) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {pass.status === "rejected" && pass.rejectionReason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-600">{pass.rejectionReason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {pass.status === "pending" && (
        <div className="flex gap-3 mt-6">
          <Button onClick={handleApprove} disabled={actionLoading} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Approve Pass
          </Button>
          <Button variant="outline" onClick={() => setRejectOpen(true)} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
            <XCircle className="w-4 h-4" />Reject Pass
          </Button>
        </div>
      )}

      {/* QR Code (if approved) */}
      {pass.status === "approved" && pass.qrCode && (
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-base">Generated QR Code</CardTitle></CardHeader>
          <CardContent>
            <div className="qr-container inline-block">
              <img src={pass.qrCode} alt="Pass QR Code" className="w-40 h-40" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Application</DialogTitle></DialogHeader>
          <Textarea
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
