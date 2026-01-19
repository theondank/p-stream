window.__CONFIG__ = {
  // The URL for the CORS proxy, the URL must NOT end with a slash!
  // If not specified, the onboarding will not allow a "default setup". The user will have to use the extension or set up a proxy themselves
  VITE_CORS_PROXY_URL: "http://localhost:3001",

  // The READ API key to access TMDB
  VITE_TMDB_READ_API_KEY:
    "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMzlhZWMxMjE0Y2IzMjFlYjQyM2JkODRjOWMzY2EyYyIsIm5iZiI6MTc2ODc4MzI2NC4yMTUwMDAyLCJzdWIiOiI2OTZkN2RhMDIxYTg3ZmJlODFkY2I1ZDIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.B20KcQTTmln7Aw_I9L-8QALE6OOjAVaIB6iJ3bTrpbY",

  // The DMCA email displayed in the footer, null to hide the DMCA link
  VITE_DMCA_EMAIL: null,

  // Whether to disable hash-based routing, leave this as false if you don't know what this is
  VITE_NORMAL_ROUTER: true,

  // The backend URL(s) to communicate with - can be a single URL or comma-separated list (e.g., "https://server1.com,https://server2.com")
  VITE_BACKEND_URL: null,

  // A comma separated list of disallowed IDs in the case of a DMCA claim - in the format "series-<id>" and "movie-<id>"
  VITE_DISALLOWED_IDS: "",
};
