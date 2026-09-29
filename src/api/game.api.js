import axiosClient from './axiosClient';

export const gameApi = {
  getGames: () => axiosClient.get('/games'),
  createGame: (data) => axiosClient.post('/games', data),
  joinSession: (gameId) => axiosClient.post(`/games/${gameId}/join`),
  submitScore: (data) => axiosClient.post('/games/score', data),
  getLeaderboard: () => axiosClient.get('/games/leaderboard')
};
