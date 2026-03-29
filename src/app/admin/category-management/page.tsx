import Link from "next/link";
import {
    Bell,
    CalendarCheck2,
    Home,
    LayoutDashboard,
    LogOut,
    Search,
    Tags,
    UserRoundCog,
} from "lucide-react";

export default function AdminCategoryManagementPage() {
    const sideNavItems = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
        { label: "Category Management", icon: Tags, href: "/admin/category-management" },
        { label: "View Bookings", icon: CalendarCheck2, href: "/admin/view-bookings" },
        { label: "User Management", icon: UserRoundCog, href: "/admin/user-management" },
        { label: "Logout", icon: LogOut },
    ];

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)]">
                <aside className="border-r border-slate-200 bg-slate-50 lg:sticky lg:top-0 lg:h-screen">
                    <div className="px-4 py-5">
                        <h2 className="text-xl font-semibold tracking-tight text-slate-800">My Dashboard</h2>
                    </div>

                    <nav className="space-y-1 px-2 pb-6">
                        {sideNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.href === "/admin/category-management";
                            const baseClasses = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${isActive
                                ? "bg-blue-50 text-blue-600"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`;

                            if (item.href) {
                                return (
                                    <Link key={item.label} href={item.href} className={baseClasses}>
                                        <Icon className="size-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            }

                            return (
                                <button key={item.label} type="button" className={baseClasses}>
                                    <Icon className="size-4" />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <div className="min-w-0">
                    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Category Management</p>
                            <p className="text-xs text-slate-500">Admin tools</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500 md:flex">
                                <Search className="size-4" />
                                Search
                            </div>
                            <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-700" type="button">
                                <Bell className="size-4" />
                            </button>
                            <Link href="/admin/dashboard" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-700">
                                <Home className="size-4" />
                            </Link>
                        </div>
                    </header>

                    <main className="p-4 sm:p-6">
                        <div className="mx-auto max-w-6xl space-y-4">
                            <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-sm text-slate-500">Admin / Category Management</p>
                                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Category Management</h1>
                                <p className="mt-2 text-sm text-slate-600">Use this page to create, edit, reorder, and remove categories.</p>
                            </header>

                            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h2 className="text-lg font-semibold text-slate-900">Starter Content Area</h2>
                                <p className="mt-2 text-sm text-slate-600">
                                    Add your category table, form modal, and action buttons here.
                                </p>

                                <div className="mt-4 flex flex-wrap gap-3">
                                    <Link
                                        href="/admin/dashboard"
                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Back to Dashboard
                                    </Link>
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
