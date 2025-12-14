import { Layout } from '@/components/layout/Layout';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function Register() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-md mx-auto bg-card rounded-lg border border-border p-8">
          <RegisterForm />
        </div>
      </div>
    </Layout>
  );
}
