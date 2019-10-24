import { version, name, description } from '../../package.json';
import * as env from '../env';

export default (req, res) => res.send({
  name,
  version,
  description,
  elasticsearch: env.ES_HOST,
});
