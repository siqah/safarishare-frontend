import React, { useEffect, useState } from 'react';

interface Ride {
    id: string;
    pickup: string;
    dropoff: string;
    time: string;
    fare: number;
    status: 'pending' | 'ongoing' | 'completed';
}

const mockRides: Ride[] = [
    { id: 'R-1001', pickup: 'Downtown', dropoff: 'Airport', time: '08:30', fare: 24.5, status: 'completed' },
    { id: 'R-1002', pickup: 'Mall', dropoff: 'Stadium', time: '09:15', fare: 13.2, status: 'completed' },
    { id: 'R-1003', pickup: 'University', dropoff: 'Library', time: '10:05', fare: 7.8, status: 'pending' }
];

const cardStyle: React.CSSProperties = {
    background: '#fff',
    padding: '16px',
    borderRadius: 8,
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    flex: 1,
    minWidth: 160,
    margin: '8px'
};

const DriverDashboard: React.FC = () => {
    const [online, setOnline] = useState(false);
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        const t = setTimeout(() => {
            setRides(mockRides);
            setLoading(false);
        }, 400);
        return () => clearTimeout(t);
    }, []);

    const earningsToday = rides
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + r.fare, 0);

    const nextRide = rides.find(r => r.status === 'pending');

    return (
        <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24, background: '#f5f7fb', minHeight: '100vh' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ margin: 0, fontSize: 24 }}>Driver Dashboard</h1>
                <button
                    onClick={() => setOnline(o => !o)}
                    style={{
                        background: online ? '#d9534f' : '#198754',
                        color: '#fff',
                        padding: '10px 18px',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    {online ? 'Go Offline' : 'Go Online'}
                </button>
            </header>

            <section style={{ display: 'flex', flexWrap: 'wrap', margin: '-8px 0 16px' }}>
                <div style={cardStyle}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Status</div>
                        <div style={{ fontSize: 20, fontWeight: 600, color: online ? '#198754' : '#555' }}>
                            {online ? 'Online' : 'Offline'}
                        </div>
                </div>
                <div style={cardStyle}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Completed Rides</div>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>{rides.filter(r => r.status === 'completed').length}</div>
                </div>
                <div style={cardStyle}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Earnings (Today)</div>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>${earningsToday.toFixed(2)}</div>
                </div>
                <div style={cardStyle}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Pending</div>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>{rides.filter(r => r.status === 'pending').length}</div>
                </div>
            </section>

            <section style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                <h2 style={{ marginTop: 0, fontSize: 18 }}>Next Ride</h2>
                {loading && <div>Loading...</div>}
                {!loading && !nextRide && <div>No pending rides.</div>}
                {!loading && nextRide && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div><strong>ID:</strong> {nextRide.id}</div>
                        <div><strong>Pickup:</strong> {nextRide.pickup}</div>
                        <div><strong>Dropoff:</strong> {nextRide.dropoff}</div>
                        <div><strong>Time:</strong> {nextRide.time}</div>
                        <div><strong>Fare:</strong> ${nextRide.fare.toFixed(2)}</div>
                        <button
                            style={{
                                marginTop: 8,
                                alignSelf: 'flex-start',
                                background: '#0d6efd',
                                color: '#fff',
                                padding: '8px 14px',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer'
                            }}
                            onClick={() =>
                                setRides(rs =>
                                    rs.map(r => r.id === nextRide.id ? { ...r, status: 'ongoing' } : r)
                                )
                            }
                        >
                            Accept Ride
                        </button>
                    </div>
                )}
            </section>

            <section style={{ marginTop: 24 }}>
                <h2 style={{ fontSize: 18 }}>Recent Rides</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ background: '#f0f2f5', textAlign: 'left' }}>
                                <th style={thTd}>ID</th>
                                <th style={thTd}>Pickup</th>
                                <th style={thTd}>Dropoff</th>
                                <th style={thTd}>Time</th>
                                <th style={thTd}>Fare</th>
                                <th style={thTd}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rides.map(r => (
                                <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={thTd}>{r.id}</td>
                                    <td style={thTd}>{r.pickup}</td>
                                    <td style={thTd}>{r.dropoff}</td>
                                    <td style={thTd}>{r.time}</td>
                                    <td style={thTd}>${r.fare.toFixed(2)}</td>
                                    <td style={{ ...thTd, color: statusColor(r.status), fontWeight: 600 }}>
                                        {r.status}
                                    </td>
                                </tr>
                            ))}
                            {!rides.length && !loading && (
                                <tr>
                                    <td colSpan={6} style={{ padding: 16, textAlign: 'center', opacity: 0.6 }}>No rides</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

const thTd: React.CSSProperties = { padding: '10px 12px', whiteSpace: 'nowrap' };

function statusColor(status: Ride['status']): string {
    switch (status) {
        case 'pending': return '#fd7e14';
        case 'ongoing': return '#0d6efd';
        case 'completed': return '#198754';
        default: return '#555';
    }
}

export default DriverDashboard;