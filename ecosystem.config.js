module.exports = {
    apps: [
        {
            name: "nextjs-app",
            script: "node_modules/next/dist/bin/next",
            args: "start",
            instances: "max", // or set a number like 2
            exec_mode: "cluster", // enables load balancing
            autorestart: true,
            watch: false,
            max_memory_restart: "500M",

            env: {
                NODE_ENV: "development",
                PORT: 3000,
            },

            env_production: {
                NODE_ENV: "production",
                PORT: 3000,
            },
        },
    ],
};
