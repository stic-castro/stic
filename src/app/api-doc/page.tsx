import { ApiReference } from '../../components/ApiReference';
import { swaggerSpec } from '../../lib/swagger';

export default function ApiDoc() {
  return <ApiReference spec={swaggerSpec} />;
}
