import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { logoutUser } from '../services/api';

export default function DashboardPage() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    if (!user) return null;

    const handleLogout = async () => {
        try {
            const response = await logoutUser(user.accessToken)
            if (response) {
                logout();
                navigate('/login');
            }
        } catch (error) {
            console.error(error)
        }

    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
                    Welcome to your Dashboard
                </h2>

                <div className="text-gray-700 space-y-2 mb-6">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                </div>

                <button
                    onClick={() => {
                        handleLogout();
                    }}
                    className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition font-medium"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
