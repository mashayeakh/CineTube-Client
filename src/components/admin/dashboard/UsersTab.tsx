import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/states/empty-state";
import { Users } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
}

interface UsersTabProps {
  users: UserItem[];
  totalUsers: number;
  formatNumber: (v: number) => string;
  getStatusVariant: (status: string) => any;
}

export function UsersTab({
  users,
  totalUsers,
  formatNumber,
  getStatusVariant,
}: UsersTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">User Management</h3>
            <p className="text-sm text-slate-500">
              Manage and monitor all {formatNumber(totalUsers)} registered platform users
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1 font-mono text-xs">
            PAGE 1 / {Math.ceil(totalUsers / 6) || 1}
          </Badge>
        </div>

        <Separator className="my-6 opacity-50" />

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500">
                <th className="py-4 pl-6 pr-4 font-bold uppercase tracking-wider text-[10px]">User Details</th>
                <th className="py-4 pr-4 font-bold uppercase tracking-wider text-[10px]">Email Address</th>
                <th className="py-4 pr-4 font-bold uppercase tracking-wider text-[10px]">Role</th>
                <th className="py-4 pr-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                <th className="py-4 pr-6 font-bold uppercase tracking-wider text-[10px]">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td className="py-12 px-6" colSpan={5}>
                    <EmptyState
                      icon={Users}
                      title="No users found"
                      description="The system couldn't find any registered users matching the current criteria."
                    />
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="group transition-colors hover:bg-slate-50/80"
                  >
                    <td className="py-4 pl-6 pr-4 font-semibold text-slate-800">
                      {user.name}
                    </td>
                    <td className="py-4 pr-4 text-slate-600 font-medium">
                      {user.email}
                    </td>
                    <td className="py-4 pr-4">
                      <Badge 
                        variant="secondary" 
                        className="bg-slate-100 text-slate-700 border-none group-hover:bg-white"
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-4 pr-4">
                      <Badge 
                        variant={getStatusVariant(user.status)}
                        className="shadow-sm"
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-4 pr-6 text-slate-500 text-xs">
                      {user.joinedAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {users.length > 0 && (
            <div className="mt-6 flex justify-center">
                 <p className="text-xs text-slate-400 font-medium italic">Showing the 6 most recently joined users</p>
            </div>
        )}
      </section>
    </div>
  );
}
