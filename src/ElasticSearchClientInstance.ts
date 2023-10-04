/* eslint-disable no-console */
import { Client } from '@elastic/elasticsearch';
import { ES_HOST, ES_PWD, ES_USER } from './env';

class EsInstance {
    private instance: Client;

    constructor() {
        if (!this.instance) {
            if (ES_USER && ES_PWD) {
                console.debug('Using basic auth');
                this.instance = new Client({ node: ES_HOST, auth: { username: ES_USER, password: ES_PWD } });
            } else {
                console.debug('Not using basic auth');
                this.instance = new Client({ node: ES_HOST });
            }
        }
    }

    getInstance() {
        return this.instance;
    }
}

const singletonEsInstance = new EsInstance();

Object.freeze(singletonEsInstance);

export default singletonEsInstance;
