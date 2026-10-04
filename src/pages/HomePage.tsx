import React, { useState } from 'react';
import { userHomeService, InviteUserDto } from '../services/users.service';
import { Home, UserPlus, Users, Send, AlertCircle, CheckCircle, Shield } from 'lucide-react';

const HomePage: React.FC = () => {
  const [homeId, setHomeId] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [showMembers, setShowMembers] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data: InviteUserDto = {
        homeId: parseInt(homeId),
        email,
        role,
      };
      await userHomeService.inviteUser(data);
      setSuccess('¡Invitación enviada exitosamente!');
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar la invitación');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMembers = async () => {
    if (!homeId) return;
    setError('');
    try {
      const data = await userHomeService.getHomeMembers(parseInt(homeId));
      setMembers(data);
      setShowMembers(true);
    } catch (err: any) {
      setError('Error al cargar los miembros del hogar');
    }
  };

  const handleUpdateRole = async (memberId: number, newRole: string) => {
    try {
      await userHomeService.updateRole(parseInt(homeId), memberId, { role: newRole });
      handleLoadMembers();
    } catch (err: any) {
      setError('Error al actualizar el rol');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Hogar</h1>
        <p className="text-gray-400 mt-1">Gestiona los miembros de tu hogar</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-200">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Home ID Input */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Home className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">ID del Hogar</h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={homeId}
              onChange={(e) => setHomeId(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ingresa el ID del hogar"
            />
            <button
              onClick={handleLoadMembers}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Cargar
            </button>
          </div>
        </div>

        {/* Invite User */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Invitar Usuario</h2>
          </div>
          <form onSubmit={handleInvite} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="email@ejemplo.com"
              required
            />
            <div className="flex gap-2">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="member">Miembro</option>
                <option value="admin">Administrador</option>
              </select>
              <button
                type="submit"
                disabled={loading || !homeId}
                className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Invitar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Members List */}
      {showMembers && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Miembros del Hogar</h2>
          </div>

          {members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                      {member.user?.name?.charAt(0).toUpperCase() || member.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {member.user?.name || member.name || 'Usuario'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {member.user?.email || member.email || ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <select
                      value={member.role || 'member'}
                      onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                      className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Miembro</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron miembros</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
