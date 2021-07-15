import { KEYCLOAK_URL } from './env';

const keycloakConfig = {
    realm: 'KidsFirst',
    'confidential-port': 0,
    'bearer-only': true,
    'auth-server-url': KEYCLOAK_URL,
    'ssl-required': 'external',
    resource: 'kf-api-portal-reports',
};

export default keycloakConfig;