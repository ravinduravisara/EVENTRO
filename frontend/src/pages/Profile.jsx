import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState(user);

  useEffect(() => {
    setProfileUser(user);
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;

    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setProfileUser(data);

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          localStorage.setItem('user', JSON.stringify({ ...parsedUser, ...data }));
        }
      } catch {
        setProfileUser(user);
      }
    };

    fetchProfile();
  }, [user]);

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg">Please login to view your profile.</p>
      </div>
    );
  }

  const fullName = [profileUser?.firstName, profileUser?.lastName].filter(Boolean).join(' ').trim() || profileUser?.name || 'User';
  const avatarLetter = fullName.charAt(0).toUpperCase();

  const avatarSrc = useMemo(() => {
    const rawAvatar = profileUser?.avatar || profileUser?.avatarUrl || profileUser?.photo || profileUser?.image || '';
    if (!rawAvatar || typeof rawAvatar !== 'string') return '';
    if (rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://') || rawAvatar.startsWith('data:')) {
      return rawAvatar;
    }
    if (rawAvatar.startsWith('/')) return rawAvatar;
    return `/${rawAvatar}`;
  }, [profileUser]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-violet-50 via-fuchsia-50 to-rose-50 py-20 px-4">
      <div className="pointer-events-none absolute -top-28 -left-20 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-pink-200/50 blur-3xl"></div>

      <div className="relative max-w-3xl mx-auto rounded-[28px] bg-gradient-to-r from-violet-200/70 via-fuchsia-200/70 to-rose-200/70 p-[1px] shadow-2xl">
        <div className="rounded-[27px] bg-white/95 backdrop-blur p-12 md:p-14">
          <div className="h-1.5 w-32 mx-auto rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 mb-12"></div>

          <div className="flex flex-col items-center gap-8">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="User profile"
                className="w-44 h-44 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-violet-100"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-44 h-44 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500 text-white text-6xl font-bold flex items-center justify-center border-4 border-white shadow-xl ring-4 ring-violet-100">
                {avatarLetter}
              </div>
            )}

            <h1 className="text-5xl md:text-6xl font-extrabold text-center tracking-tight text-gray-900">{fullName}</h1>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Button variant="secondary" className="px-7 py-3 rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform duration-200">
                Edit Profile
              </Button>
              <Button
                variant="primary"
                className="px-7 py-3 rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform duration-200"
                onClick={() => navigate('')}
              >
                Add Event
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
