import React, { useState, useEffect } from 'react';
import { gameApi } from '../api/game.api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { Gamepad2, Plus } from 'lucide-react';

export const AdminGamesManagement = () => {
  const [gamesData, setGamesData] = useState({ enabled: true, games: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'SINGLEPLAYER',
    maxPlayers: 4
  });
  const [formError, setFormError] = useState(null);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const res = await gameApi.getGames();
      if (res.success && res.data) {
        setGamesData(res.data);
      }
    } catch (err) {
      console.error('Error loading games:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await gameApi.createGame(formData);
      setIsModalOpen(false);
      fetchGames();
    } catch (err) {
      setFormError(err.message || 'Failed to create game');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Gamepad2 className="w-5 h-5 text-amber-400" />
            <span>Games Module Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Isolated feature module. Core presence system functions independently of games status.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-semibold text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Game</span>
        </button>
      </div>

      {/* Module Status Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-300">Games Module Status</div>
            <div className="text-xs text-slate-400 font-mono">GAMES_MODULE_ENABLED = {String(gamesData.enabled)}</div>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          FEATURE ACTIVE
        </span>
      </div>

      {/* Games List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full">
            <LoadingSpinner label="Loading configured games..." />
          </div>
        ) : gamesData.games.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400 glass-panel rounded-2xl">
            No games configured. Add one above.
          </div>
        ) : (
          gamesData.games.map((g) => (
            <div key={g._id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                  {g.type}
                </span>
                <span className="text-xs text-slate-400">Max: {g.maxPlayers} Players</span>
              </div>
              <h3 className="font-bold text-slate-100 text-sm">{g.title}</h3>
              <p className="text-xs text-slate-400">{g.description || 'Friend group minigame'}</p>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Game">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Game Title</label>
            <input
              type="text"
              required
              placeholder="Trivia Challenge"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              placeholder="Quick 5-question trivia game for friends"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Game Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
              >
                <option value="SINGLEPLAYER">Single Player</option>
                <option value="MULTIPLAYER">Multiplayer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Players</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/20"
            >
              Create Game
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
