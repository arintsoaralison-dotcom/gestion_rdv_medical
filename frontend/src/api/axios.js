import axios from "axios";

// En production (Render), l'adresse vient de la variable VITE_API_URL.
// En local, on garde l'adresse habituelle.
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si le token d'accès a expiré (401), on tente un rafraîchissement automatique
// une seule fois avant de renvoyer la requête d'origine.
let rafraichissementEnCours = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requeteOriginale = error.config;
    const refreshToken = sessionStorage.getItem("refresh_token");

    const estErreur401 = error.response?.status === 401;
    const estRouteAuth = requeteOriginale?.url?.includes("comptes/login");

    if (estErreur401 && refreshToken && !requeteOriginale._dejaTente && !estRouteAuth) {
      requeteOriginale._dejaTente = true;
      try {
        if (!rafraichissementEnCours) {
          rafraichissementEnCours = axios
            .post(`${API_URL}comptes/login/refresh/`, { refresh: refreshToken })
            .finally(() => {
              rafraichissementEnCours = null;
            });
        }
        const res = await rafraichissementEnCours;
        sessionStorage.setItem("access_token", res.data.access);
        requeteOriginale.headers.Authorization = `Bearer ${res.data.access}`;
        return api(requeteOriginale);
      } catch {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;