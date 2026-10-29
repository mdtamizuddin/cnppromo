module.exports = {
  apps: [
    {
      name: "server.cnppromo.com",
      script: "index.js",
      cwd: "/home/cnppromo-server/htdocs/server.cnppromo.com",
      // Server has 1 CPU, so one worker. Cluster mode is used for zero-downtime
      // `pm2 reload`. Do not raise instances without a Socket.IO adapter:
      // emits and presence only reach sockets on the same worker.
      instances: 1,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      // 4 GB box: ~1 GB left for the OS. Heap cap sits below the restart limit
      // so PM2 restarts the worker before V8 crashes with out-of-memory.
      node_args: "--max-old-space-size=2560",
      max_memory_restart: "3G",
      restart_delay: 4000,
      // Time the old worker gets to finish requests on reload (see shutdown in index.js).
      kill_timeout: 10000,
      min_uptime: "10s",
      max_restarts: 30,
      env: {
        NODE_ENV: "development",
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
