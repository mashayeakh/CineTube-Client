import { redirect } from "next/navigation";

export default function AdminViewBookingsRedirectPage() {
    redirect("/admin/movie-management/view-movies");
}
