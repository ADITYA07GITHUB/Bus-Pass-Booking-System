"use client";
// app/dashboard/apply/page.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Bus, Loader2, MapPin, Clock, IndianRupee } from "lucide-react";
import { useAppDispatch, useRoutes } from "@/hooks";
import { fetchRoutes } from "@/store/slices/routeSlice";
import { applyForPass } from "@/store/slices/passSlice";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, getFareMultiplier } from "@/lib/utils";
import { PassType, Route } from "@/types";
import { cn } from "@/lib/utils";

const applySchema = z.object({
  routeId: z.string().min(1, "Please select a route"),
  passType: z.enum(["monthly", "quarterly", "annual"] as const),
});

type ApplyForm = z.infer<typeof applySchema>;

const passTypes: { value: PassType; label: string; desc: string; discount?: string }[] = [
  { value: "monthly", label: "Monthly", desc: "30-day validity" },
  { value: "quarterly", label: "Quarterly", desc: "90-day validity", discount: "Save 10%" },
  { value: "annual", label: "Annual", desc: "365-day validity", discount: "Save 20%" },
];

export default function ApplyPassPage() {
  const dispatch = useAppDispatch();
  const { routes, isLoading: routesLoading } = useRoutes();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ApplyForm>({
    resolver: zodResolver(applySchema),
    defaultValues: { passType: "monthly" },
  });

  const watchedRoute = watch("routeId");
  const watchedType = watch("passType");

  useEffect(() => {
    dispatch(fetchRoutes());
  }, [dispatch]);

  useEffect(() => {
    if (watchedRoute) {
      const route = routes.find((r) => r._id === watchedRoute);
      setSelectedRoute(route || null);
    }
  }, [watchedRoute, routes]);

  const estimatedFare = selectedRoute
    ? selectedRoute.fare * getFareMultiplier(watchedType)
    : 0;

  const onSubmit = async (data: ApplyForm) => {
    setIsSubmitting(true);
    try {
      const result = await dispatch(applyForPass(data)).unwrap();
      toast({ title: "Application Submitted!", description: "Your pass is under review." });
      router.push(`/dashboard/passes/${result.data._id}`);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed", description: String(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Apply for Bus Pass</h1>
        <p className="page-subtitle">Fill in the details below to submit your application</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Route Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select Route</CardTitle>
                <CardDescription>Choose your regular travel route</CardDescription>
              </CardHeader>
              <CardContent>
                {routesLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading routes...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {routes.filter((r) => r.isActive).map((route) => (
                      <button
                        key={route._id}
                        type="button"
                        onClick={() => setValue("routeId", route._id, { shouldValidate: true })}
                        className={cn(
                          "flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all",
                          watchedRoute === route._id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40 hover:bg-accent/30"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-sm">{route.source}</p>
                              <p className="text-xs text-muted-foreground">↓</p>
                              <p className="font-semibold text-sm">{route.destination}</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-primary whitespace-nowrap">
                            {formatCurrency(route.fare)}
                          </span>
                        </div>
                        {route.duration && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{route.duration}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {errors.routeId && (
                  <p className="text-xs text-destructive mt-2">{errors.routeId.message}</p>
                )}
                <input type="hidden" {...register("routeId")} />
              </CardContent>
            </Card>

            {/* Pass Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select Pass Type</CardTitle>
                <CardDescription>Choose validity duration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {passTypes.map(({ value, label, desc, discount }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setValue("passType", value)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-4 rounded-xl border-2 text-center transition-all",
                        watchedType === value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <span className="font-bold text-sm">{label}</span>
                      <span className="text-xs text-muted-foreground">{desc}</span>
                      {discount && (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {discount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto" size="lg">
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
              ) : (
                <>Submit Application <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </form>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Application Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Route</span>
                <span className="font-medium text-right max-w-[160px]">
                  {selectedRoute ? `${selectedRoute.source} → ${selectedRoute.destination}` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pass Type</span>
                <span className="font-medium capitalize">{watchedType}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Daily Fare</span>
                <span className="font-medium">
                  {selectedRoute ? formatCurrency(selectedRoute.fare) : "—"}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Fare</span>
                <span className="text-xl font-bold text-primary flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  {selectedRoute ? (estimatedFare).toLocaleString("en-IN") : "—"}
                </span>
              </div>
              <div className="bg-accent/50 rounded-lg p-3 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">What happens next?</p>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>Application submitted for review</li>
                  <li>Admin approves within 24h</li>
                  <li>QR code generated for your pass</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
