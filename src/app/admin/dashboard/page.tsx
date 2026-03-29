"use client"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function AdminDashboardPage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/admin/dashboard">
                                        Admin Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Overview</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="aspect-video rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-sm text-orange-300 font-semibold">Active Users</p>
                                <p className="text-2xl font-bold text-orange-400">2,543</p>
                            </div>
                        </div>
                        <div className="aspect-video rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-sm text-blue-300 font-semibold">Total Movies</p>
                                <p className="text-2xl font-bold text-blue-400">1,284</p>
                            </div>
                        </div>
                        <div className="aspect-video rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-sm text-purple-300 font-semibold">Revenue</p>
                                <p className="text-2xl font-bold text-purple-400">$45,231</p>
                            </div>
                        </div>
                    </div>
                    <div className="min-h-screen flex-1 rounded-xl bg-slate-950/50 border border-white/10 p-6">
                        <h2 className="text-xl font-semibold mb-4">Content Overview</h2>
                        <p className="text-slate-400">Your admin dashboard is ready. Add your analytics and management tools here.</p>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}