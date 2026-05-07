"use client";
// app/admin/users/page.tsx

import { useEffect, useState, useCallback } from "react";
import { Search, Users, UserCheck, UserX } from "lucide-react";
import { useAppDispatch, useAdmin } from "@/hooks";
import { fetchAllUsers, toggleUserStatus } from "@/store/slices/adminSlice";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const { users, isLoading, pagination } = useAdmin();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const loadUsers = useCallback(() => {
    dispatch(fetchAllUsers({ page, limit: 10, search: search || undefined }));
  }, [dispatch, page, search]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleToggle = async (userId: string) => {
    try {
      await dispatch(toggleUserStatus(userId)).unwrap();
      toast({ title: "User status updated" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: String(err) });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">View and manage registered users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold">{pagination.total}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-600">{users.filter(u => (u as { isActive?: boolean }).isActive !== false).length}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <UserX className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-red-600">{users.filter(u => (u as { isActive?: boolean }).isActive === false).length}</p>
            <p className="text-sm text-muted-foreground">Suspended</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">User</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Phone</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Role</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Joined</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-border">
                      {[1, 2, 3, 4, 5, 6].map((j) => (
                        <td key={j} className="p-4"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">No users found</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="table-row-hover border-b border-border">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{user.phone || "—"}</td>
                      <td className="p-4">
                        <span className={cn(
                          "status-badge",
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700 border-purple-200"
                            : "bg-blue-100 text-blue-700 border-blue-200"
                        )}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(user.createdAt)}</td>
                      <td className="p-4">
                        <span className={cn(
                          "status-badge",
                          (user as { isActive?: boolean }).isActive !== false
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        )}>
                          {(user as { isActive?: boolean }).isActive !== false ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.role !== "admin" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "text-xs",
                              (user as { isActive?: boolean }).isActive !== false
                                ? "text-red-600 border-red-200 hover:bg-red-50"
                                : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            )}
                            onClick={() => handleToggle(user._id)}
                          >
                            {(user as { isActive?: boolean }).isActive !== false ? "Suspend" : "Activate"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
