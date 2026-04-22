import ReactSwagger from '../../components/ReactSwagger';
import { swaggerSpec } from '../../lib/swagger';

export default function ApiDoc() {
  return (
    <section className="container mx-auto mt-12 bg-white rounded-lg pb-10 mb-10">
      <ReactSwagger spec={swaggerSpec} />
    </section>
  );
}
