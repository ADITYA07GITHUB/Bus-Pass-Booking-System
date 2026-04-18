"use client";
// app/dashboard/renew/page.tsx

import { useEffect, useState } from "react";
import Link from "next/link";
import { RotateCcw, AlertCircle, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { useAppDispatch, usePasses } from "@/hooks";
import { fetchMyPasses, renewPass } from "@/store/slices/passSlice";
import { formatDate, formatCurrency, isPassExpired, getStatusColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { BusPass } from "@/types";

export default function RenewPassPage() {
  const dispatch = useAppDispatch();
  const { passes, isLoading } = usePasses();
  const { toast } = useToast();
  const router = useRouter();
  const [renewingId, setRenewingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMyPasses({ limit: 50 }));
  }, [dispatch]);

  // Only show passes eligible for renewal
  const renewablePasses = passes.filter(
    (p) => p.status === "approved" || p.status === "expired" || isPassExpired(p.validTo)
  );

  const handleRenew = async (passId: string) => {
    setRenewingId(passId);
    try {
      const result = await dispatch(renewPass(passId)).unwrap();
      toast({ title: "Renewal Submitted!", description: "Your renewal application is under review." });
      router.push(`/dashboard/passes/${result.data._id}`);
    } catch (err) {
      toast({ variant: "destructive", title: "Renewal Failed", description: String(err) });
    } finally {
      setRenewingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Renew Bus Pass</h1>
        <p className="page-subtitle">Select a pass to renew below</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-5 flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-9 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : renewablePasses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center gap-4">
            <AlertCircle className="w-12 h-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg mb-1">No passes to renew</h3>
              <p className="text-sm text-muted-foreground">
                You don&apos;t have any approved or expired passes eligible for renewal.
              </p>
            </div>
            <Link href="/dashboard/apply">
              <Button className="gap-2">
                <ArrowRight className="w-4 h-4" />Apply for a New Pass
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {renewablePasses.map((pass) => {
            const route = typeof pass.routeId === "object" ? pass.routeId : null;
            const expired = isPassExpired(pass.validTo);

            return (
              <Card key={pass._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <RotateCcw className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {route ? `${route.source} → ${route.destination}` : "Route N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {pass.passNumber} • <span className="capitalize">{pass.passType}</span> pass •{" "}
                          {formatCurrency(pass.fare)}
                        </p>
                        <p className="text-xs mt-1">
                          <span className="text-muted-foreground">Valid till: </span>
                          <span className={expired ? "text-red-600 font-medium" : "text-foreground"}>
                            {formatDate(pass.validTo)}
                            {expired && " (Expired)"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`status-badge ${getStatusColor(expired ? "expired" : pass.status)}`}>
                        {expired ? "Expired" : pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}
                      </span>
                      <Button
                        onClick={() => handleRenew(pass._id)}
                        disabled={renewingId === pass._id}
                        size="sm"
                        className="gap-2"
                      >
                        {renewingId === pass._id ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" />Renewing...</>
                        ) : (
                          <><RotateCcw className="w-3.5 h-3.5" />Renew</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
