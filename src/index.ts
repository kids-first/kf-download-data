import buildApp from './app';
import { PORT, KEYCLOAK_URL } from './env';

process.on('uncaughtException', (err) => {
    console.log(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled rejection at ', promise, `reason: ${reason}`);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log(`Process ${process.pid} has been interrupted`);
    process.exit(0);
});

const keycloakConfig = {
    realm: 'KidsFirst',
    'confidential-port': 0,
    'bearer-only': true,
    'auth-server-url': KEYCLOAK_URL,
    'ssl-required': 'external',
    resource: 'kf-api-portal-reports',
};

const app = buildApp(keycloakConfig);
app.listen(PORT, () => console.log(`⚡️⚡️⚡️ Listening on port ${PORT} ⚡️⚡️⚡️`));