import { redirect } from "next/navigation";
export default async function AdminCreateMoviesPage() {
    redirect("/admin/movie-management/view-movies?create=1");
}
