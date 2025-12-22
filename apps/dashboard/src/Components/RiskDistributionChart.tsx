import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

const data = [
    { name: "Low Risk", value: 10 },
    { name: "Medium Risk", value: 5 },
    { name: "High Risk", value: 3 },
];

const COLORS = ["#22c55e", "#facc15", "#ef4444"];

export function RiskDistributionChart() {
    return (
        <div className="bg-[#0F1629] rounded-lg p-5 h-[280px]">
            <p className="text-sm uppercase tracking-wide opacity-70 mb-4">
                Risk Distribution
            </p>

            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                    >
                        {data.map((_, index) => (
                            <Cell key={index} fill={COLORS[index]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
