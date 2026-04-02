import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
    Ban,
    Bell,
    Download,
    Home,
    RefreshCw,
    Search,
    ShieldCheck,
} from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Badge } from "@/components/ui/badge";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import {
    getAdminDashboardUsers,
    updateAdminDashboardUserRole,
    updateAdminDashboardUserStatus,
    type AdminServiceResponse,
} from "@/service/admin-dashboard.services";

type UnknownRecord = Record<string, unknown>;

type UserManagementRow = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAtDisplay: string;
    createdAtRaw: string;
};

type PageSearchParams = {
    q?: string;
    role?: string;
    status?: string;
    from?: string;
    to?: string;
};

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeKey(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findValue(source: unknown, keys: string[], depth = 0): unknown {
    if (!isRecord(source) || depth > 3) {
        return undefined;
    }

    const targetKeys = new Set(keys.map(normalizeKey));

    for (const [key, value] of Object.entries(source)) {
        if (targetKeys.has(normalizeKey(key))) {
            return value;
        }
    }

    for (const value of Object.values(source)) {
        if (isRecord(value)) {
            const nestedValue = findValue(value, keys, depth + 1);

            if (nestedValue !== undefined) {
                return nestedValue;
            }
        }
    }

    return undefined;
}

function parseString(value: unknown, fallback = "") {
    if (typeof value === "string") {
        return value.trim() || fallback;
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    return fallback;
}

function parseBoolean(value: unknown, fallback = false) {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        const normalized = value.toLowerCase();

        if (["true", "yes", "1", "active", "blocked", "banned"].includes(normalized)) {
            return true;
        }

        if (["false", "no", "0", "inactive", "unblocked"].includes(normalized)) {
            return false;
        }
    }

    return fallback;
}

function extractArray(source: unknown, keys: string[] = []) {
    if (Array.isArray(source)) {
        return source;
    }

    const keyedValue = findValue(source, keys);

    if (Array.isArray(keyedValue)) {
        return keyedValue;
    }

    if (isRecord(source)) {
        for (const value of Object.values(source)) {
            if (Array.isArray(value)) {
                return value;
            }
        }
    }

    return [] as unknown[];
}

function formatNumber(value: number) {
    return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "N/A";
    }

    return new Intl.DateTimeFormat("en-US").format(date);
}

function normalizeRole(role: string) {
    return role.trim().toUpperCase() || "USER";
}

function normalizeStatus(status: string, isBlocked = false) {
    if (isBlocked) {
        return "BANNED";
    }

    const normalized = status.trim().toUpperCase();

    if (normalized.includes("BAN") || normalized.includes("BLOCK")) {
        return "BANNED";
    }

    if (normalized.includes("INACTIVE")) {
        return "INACTIVE";
    }

    return "ACTIVE";
}

function getSuccessData<TData>(result: PromiseSettledResult<AdminServiceResponse<TData>>, fallback: TData) {
    return result.status === "fulfilled" ? result.value.data : fallback;
}

function getStatusBadge(status: string) {
    if (status === "ACTIVE") {
        return "default" as const;
    }

    if (status === "INACTIVE") {
        return "secondary" as const;
    }

    return "destructive" as const;
}

function getRoleBadge(role: string) {
    if (role === "ADMIN") {
        return "default" as const;
    }

    if (role === "TUTOR") {
        return "secondary" as const;
    }

    return "outline" as const;
}

function normalizeUsers(source: unknown): UserManagementRow[] {
    return extractArray(source, ["users", "items", "rows", "records"])
        .map((item, index) => {
            const email = parseString(findValue(item, ["email", "userEmail", "contactEmail"]), "no-email@example.com");
            const createdAtRaw = parseString(findValue(item, ["createdAt", "joinedAt", "updatedAt"]), "");
            const rawRole = parseString(findValue(item, ["role", "userRole"]), "USER");
            const rawStatus = parseString(findValue(item, ["status", "accountStatus", "state"]), "ACTIVE");
            const isBlocked = parseBoolean(findValue(item, ["isBlocked", "blocked", "banned"]), false);

            return {
                id: parseString(findValue(item, ["_id", "id", "userId"]), `user-${index + 1}`),
                name: parseString(findValue(item, ["name", "fullName", "username"]), email.split("@")[0] || "Unnamed user"),
                email,
                role: normalizeRole(rawRole),
                status: normalizeStatus(rawStatus, isBlocked),
                createdAtDisplay: formatDate(createdAtRaw),
                createdAtRaw,
            };
        })
        .sort((a, b) => new Date(b.createdAtRaw).getTime() - new Date(a.createdAtRaw).getTime());
}

function toCsv(rows: UserManagementRow[]) {
    const header = ["Name", "Email", "Role", "Status", "Created"];
    const csvRows = rows.map((row) => [row.name, row.email, row.role, row.status, row.createdAtDisplay]);
    const allRows = [header, ...csvRows];

    return allRows
        .map((columns) =>
            columns
                .map((column) => `"${String(column).replace(/"/g, '""')}"`)
                .join(",")
        )
        .join("\n");
}

async function updateUserRoleAction(formData: FormData) {
    "use server";

    const userId = String(formData.get("userId") ?? "");
    const role = String(formData.get("role") ?? "").trim().toUpperCase();

    if (!userId || !role) {
        return;
    }

    try {
        await updateAdminDashboardUserRole(userId, {
            role,
            userRole: role,
        });
    } catch (error) {
        console.error("Failed to update user role:", error);
    }

    revalidatePath("/admin/user-management");
}

async function toggleUserStatusAction(formData: FormData) {
    "use server";

    const userId = String(formData.get("userId") ?? "");
    const currentStatus = String(formData.get("currentStatus") ?? "ACTIVE").trim().toUpperCase();
    const nextStatus = currentStatus === "BANNED" ? "ACTIVE" : "BANNED";

    if (!userId) {
        return;
    }

    try {
        await updateAdminDashboardUserStatus(userId, {
            status: nextStatus,
            isBlocked: nextStatus === "BANNED",
            blocked: nextStatus === "BANNED",
            active: nextStatus === "ACTIVE",
        });
    } catch (error) {
        console.error("Failed to update user status:", error);
    }

    revalidatePath("/admin/user-management");
}

export default async function AdminUserManagementPage({
    searchParams,
}: {
    searchParams: Promise<PageSearchParams>;
}) {
    const params = await searchParams;
    const query = (params.q ?? "").trim().toLowerCase();
    const roleFilter = (params.role ?? "ALL").toUpperCase();
    const statusFilter = (params.status ?? "ALL").toUpperCase();
    const fromDate = params.from ? new Date(params.from) : null;
    const toDate = params.to ? new Date(params.to) : null;

    const usersResult = await Promise.allSettled([getAdminDashboardUsers()]);
    const usersSource = getSuccessData(usersResult[0], [] as unknown[]);
    const users = normalizeUsers(usersSource);

    const filteredUsers = users.filter((user) => {
        const searchMatched =
            !query ||
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query);
        const roleMatched = roleFilter === "ALL" || user.role === roleFilter;
        const statusMatched = statusFilter === "ALL" || user.status === statusFilter;

        const createdTime = new Date(user.createdAtRaw).getTime();
        const fromMatched = !fromDate || Number.isNaN(fromDate.getTime()) || createdTime >= fromDate.getTime();
        const toMatched = !toDate || Number.isNaN(toDate.getTime()) || createdTime <= toDate.getTime();

        return searchMatched && roleMatched && statusMatched && fromMatched && toMatched;
    });

    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.status === "ACTIVE").length;
    const inactiveUsers = users.filter((user) => user.status === "INACTIVE").length;
    const bannedUsers = users.filter((user) => user.status === "BANNED").length;
    const adminUsers = users.filter((user) => user.role === "ADMIN").length;
    const regularUsers = users.filter((user) => user.role !== "ADMIN").length;

    const csvUri = `data:text/csv;charset=utf-8,${encodeURIComponent(toCsv(filteredUsers))}`;

    const metricCards = [
        { label: "Total Users", value: totalUsers, tone: "text-slate-900" },
        { label: "Active", value: activeUsers, tone: "text-emerald-600" },
        { label: "Inactive", value: inactiveUsers, tone: "text-slate-600" },
        { label: "Banned", value: bannedUsers, tone: "text-rose-600" },
        { label: "Admins", value: adminUsers, tone: "text-blue-600" },
        { label: "Regular Users", value: regularUsers, tone: "text-violet-600" },
    ];

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                <AdminSidebar activePath="/admin/user-management" />

                <div className="min-w-0">
                    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">User Management</p>
                            <p className="text-xs text-slate-500">Manage and monitor all user accounts</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500 md:flex">
                                <Search className="size-4" />
                                Search
                            </div>
                            {/* <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-700" type="button">
                                <Bell className="size-4" />
                            </button> */}
                            <Link href="/admin/dashboard" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-700">
                                <Home className="size-4" />
                            </Link>
                        </div>
                    </header>

                    <main className="p-4 sm:p-6">
                        <div className="mx-auto max-w-7xl space-y-5">
                            <section className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-5xl font-semibold tracking-tight text-slate-900">User Management</h1>
                                    <p className="mt-2 text-lg text-slate-600">Manage and monitor all user accounts</p>
                                </div>

                                <a
                                    href={csvUri}
                                    download="admin-users.csv"
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    <Download className="size-4" />
                                    Export CSV
                                </a>
                            </section>

                            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                                {metricCards.map((card) => (
                                    <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <p className="text-sm text-slate-500">{card.label}</p>
                                        <p className={`mt-2 text-5xl font-semibold tracking-tight ${card.tone}`}>{formatNumber(card.value)}</p>
                                    </article>
                                ))}
                            </section>

                            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Filters</h2>
                                    <Link href="/admin/user-management" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                                        <RefreshCw className="size-4" />
                                        Reset Filters
                                    </Link>
                                </div>

                                <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
                                        <Search className="size-4 text-slate-400" />
                                        <input
                                            name="q"
                                            defaultValue={params.q ?? ""}
                                            placeholder="Search users..."
                                            className="h-10 w-full bg-transparent text-sm outline-none"
                                        />
                                    </div>

                                    <select name="role" defaultValue={roleFilter} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm">
                                        <option value="ALL">All Roles</option>
                                        <option value="ADMIN">Admin</option>
                                        <option value="USER">User</option>
                                        <option value="PREMIUM_USER">Premium User</option>
                                        <option value="STUDENT">Student</option>
                                        <option value="TUTOR">Tutor</option>
                                    </select>

                                    <select name="status" defaultValue={statusFilter} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm">
                                        <option value="ALL">All Status</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="BANNED">Banned</option>
                                    </select>

                                    <input
                                        type="date"
                                        name="from"
                                        defaultValue={params.from ?? ""}
                                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                                    />

                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            name="to"
                                            defaultValue={params.to ?? ""}
                                            className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                                        />
                                        <PendingSubmitButton pendingText="Applying..." className="h-10 rounded-lg border border-slate-300 bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800">
                                            Apply
                                        </PendingSubmitButton>
                                    </div>
                                </form>
                            </section>

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-210 text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-600">
                                            <tr>
                                                <th className="w-10 px-4 py-3">
                                                    <input type="checkbox" aria-label="Select all users" className="size-4 rounded border-slate-300" />
                                                </th>
                                                <th className="px-4 py-3 font-semibold">Name</th>
                                                <th className="px-4 py-3 font-semibold">Email</th>
                                                <th className="px-4 py-3 font-semibold">Role</th>
                                                <th className="px-4 py-3 font-semibold">Status</th>
                                                <th className="px-4 py-3 font-semibold">Created</th>
                                                <th className="px-4 py-3 font-semibold">Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-10 text-center">
                                                        <p className="text-sm font-semibold text-slate-800">No users match your filter</p>
                                                        <p className="mt-1 text-sm text-slate-500">Try clearing filters or adjusting the search query.</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map((user) => (
                                                    <tr key={user.id} className="border-t border-slate-200 align-top">
                                                        <td className="px-4 py-3">
                                                            <input type="checkbox" aria-label={`Select ${user.name}`} className="size-4 rounded border-slate-300" />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <p className="font-semibold text-slate-900">{user.name}</p>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600">{user.email}</td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant={getRoleBadge(user.role)}>{user.role}</Badge>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant={getStatusBadge(user.status)}>
                                                                <ShieldCheck className="mr-1 size-3" />
                                                                {user.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600">{user.createdAtDisplay}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <form action={updateUserRoleAction} className="flex items-center gap-2">
                                                                    <input type="hidden" name="userId" value={user.id} />
                                                                    <select
                                                                        name="role"
                                                                        defaultValue={user.role}
                                                                        className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs"
                                                                    >
                                                                        <option value="ADMIN">ADMIN</option>
                                                                        <option value="USER">USER</option>
                                                                        <option value="PREMIUM_USER">PREMIUM_USER</option>
                                                                        <option value="STUDENT">STUDENT</option>
                                                                        <option value="TUTOR">TUTOR</option>
                                                                    </select>
                                                                    <PendingSubmitButton
                                                                        pendingText="Saving..."
                                                                        className="h-8 rounded-md border border-slate-300 px-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                                                    >
                                                                        Save
                                                                    </PendingSubmitButton>
                                                                </form>

                                                                <form action={toggleUserStatusAction}>
                                                                    <input type="hidden" name="userId" value={user.id} />
                                                                    <input type="hidden" name="currentStatus" value={user.status} />
                                                                    <PendingSubmitButton
                                                                        pendingText={user.status === "BANNED" ? "Unbanning..." : "Banning..."}
                                                                        className={`inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold ${user.status === "BANNED"
                                                                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                                            : "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                                            }`}
                                                                    >
                                                                        <Ban className="size-3" />
                                                                        {user.status === "BANNED" ? "Unban" : "Ban"}
                                                                    </PendingSubmitButton>
                                                                </form>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
