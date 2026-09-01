module.exports = {
  apps: [
    {
      name: "server.cnppromo.com",
      script: "index.js",
      cwd: "/home/cnppromo-server/htdocs/server.cnppromo.com",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
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
