import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, BarChart3, ShieldCheck, Building2, MapPin } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";

export default function DashboardPage() {
  return (
    <AdminLayout>
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Manage Users */}
        <Link to="/admin/users" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="mt-2">Manage Users</CardTitle>
              <CardDescription>
                View, edit, or remove user accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Keep your user database organized and secure.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Manage NGOs */}
        <Link to="/admin/ngos" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              <CardTitle className="mt-2">Manage NGOs</CardTitle>
              <CardDescription>
                Manage Non-Governmental Organizations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Register, verify, and manage NGO partnerships.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Manage Municipalities */}
        <Link to="/admin/municipalities" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <CardTitle className="mt-2">Manage Municipalities</CardTitle>
              <CardDescription>
                Manage Municipal Organizations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Register and manage municipal partnerships.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Analytics */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <CardTitle className="mt-2">Analytics</CardTitle>
            <CardDescription>
              Track incident reports and resolutions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Monitor trends in dog-bite cases, sterilizations, and cleanups.
            </p>
          </CardContent>
        </Card>

        {/* Safety Compliance */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <CardTitle className="mt-2">Safety Compliance</CardTitle>
            <CardDescription>Review field staff activities.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Ensure sterilization and vaccination tasks are done on time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </AdminLayout>
  );
}
