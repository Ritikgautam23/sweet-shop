import { Layout } from '@/components/layout/Layout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function Login() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-md mx-auto bg-card rounded-lg border border-border p-8">
          <LoginForm />
        </div>
      </div>
    </Layout>
  );
}
