export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                <p className="text-slate-500 mt-1">Overview of your store performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stat Cards */}
                {[
                    { label: "Total Revenue", value: "Rp 12.5M", change: "+12%", color: "blue" },
                    { label: "Active Orders", value: "24", change: "+4", color: "green" },
                    { label: "Total Products", value: "156", change: "+8", color: "purple" },
                    { label: "Total Customers", value: "892", change: "+15%", color: "orange" },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">{stat.value}</span>
                            <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[300px]">
                    <h3 className="font-bold text-lg text-slate-900 mb-4">Recent Activity</h3>
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                        Chart Placeholder
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[300px]">
                    <h3 className="font-bold text-lg text-slate-900 mb-4">Top Products</h3>
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                        List Placeholder
                    </div>
                </div>
            </div>
        </div>
    );
}
