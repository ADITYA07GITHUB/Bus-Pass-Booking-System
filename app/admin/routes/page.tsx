"use client";
// app/admin/routes/page.tsx

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useRoutes } from "@/hooks";
import { fetchRoutes, createRoute, updateRoute, deleteRoute } from "@/store/slices/routeSlice";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Route } from "@/types";
import { cn } from "@/lib/utils";

const routeSchema = z.object({
  source: z.string().min(2, "Source is required"),
  destination: z.string().min(2, "Destination is required"),
  fare: z.coerce.number().min(1, "Fare must be at least ₹1"),
  distance: z.coerce.number().optional(),
  duration: z.string().optional(),
});

type RouteForm = z.infer<typeof routeSchema>;

export default function AdminRoutesPage() {
  const dispatch = useAppDispatch();
  const { routes, isLoading } = useRoutes();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editRoute, setEditRoute] = useState<Route | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RouteForm>({
    resolver: zodResolver(routeSchema),
  });

  useEffect(() => { dispatch(fetchRoutes()); }, [dispatch]);

  const openCreate = () => {
    setEditRoute(null);
    reset({ source: "", destination: "", fare: 0 });
    setIsDialogOpen(true);
  };

  const openEdit = (route: Route) => {
    setEditRoute(route);
    reset({ source: route.source, destination: route.destination, fare: route.fare, distance: route.distance, duration: route.duration });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: RouteForm) => {
    setIsSubmitting(true);
    try {
      if (editRoute) {
        await dispatch(updateRoute({ id: editRoute._id, ...data })).unwrap();
        toast({ title: "Route Updated" });
      } else {
        await dispatch(createRoute(data)).unwrap();
        toast({ title: "Route Created" });
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: String(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteRoute(id)).unwrap();
      toast({ title: "Route Deleted" });
      setDeleteTarget(null);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: String(err) });
    }
  };

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Routes & Pricing</h1>
          <p className="page-subtitle">Manage bus routes and fare pricing</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />Add Route
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card text-center">
          <p className="text-2xl font-bold">{routes.length}</p>
          <p className="text-sm text-muted-foreground">Total Routes</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-emerald-600">{routes.filter(r => r.isActive).length}</p>
          <p className="text-sm text-muted-foreground">Active Routes</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-amber-600">{routes.filter(r => !r.isActive).length}</p>
          <p className="text-sm text-muted-foreground">Inactive Routes</p>
        </div>
      </div>

      {/* Routes Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Route</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Distance</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Duration</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Fare / Trip</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="border-b border-border">
                      {[1, 2, 3, 4, 5, 6].map((j) => (
                        <td key={j} className="p-4"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : routes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                      No routes found. Add your first route.
                    </td>
                  </tr>
                ) : (
                  routes.map((route) => (
                    <tr key={route._id} className="table-row-hover border-b border-border">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                          <div>
                            <span className="font-medium text-sm">{route.source}</span>
                            <span className="text-muted-foreground text-sm"> → </span>
                            <span className="font-medium text-sm">{route.destination}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{route.distance ? `${route.distance} km` : "—"}</td>
                      <td className="p-4 text-sm text-muted-foreground">{route.duration || "—"}</td>
                      <td className="p-4 text-sm font-semibold text-primary">{formatCurrency(route.fare)}</td>
                      <td className="p-4">
                        <button
                          onClick={() => dispatch(updateRoute({ id: route._id, isActive: !route.isActive }))}
                          className={cn(
                            "status-badge cursor-pointer transition-colors",
                            route.isActive ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          )}
                        >
                          {route.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(route)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteTarget(route._id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editRoute ? "Edit Route" : "Add New Route"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Source</Label>
                <Input {...register("source")} />
                {errors.source && <p className="text-xs text-destructive">{errors.source.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Destination</Label>
                <Input {...register("destination")} />
                {errors.destination && <p className="text-xs text-destructive">{errors.destination.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Fare per Trip (₹)</Label>
                <Input type="number" {...register("fare")} />
                {errors.fare && <p className="text-xs text-destructive">{errors.fare.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Distance (km) <span className="text-muted-foreground text-xs">optional</span></Label>
                <Input type="number" {...register("distance")} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Duration <span className="text-muted-foreground text-xs">optional</span></Label>
                <Input {...register("duration")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editRoute ? "Update Route" : "Create Route"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Route</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this route? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteTarget!)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
