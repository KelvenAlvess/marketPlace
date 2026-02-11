import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Usamos Link e useNavigate agora
import { useAuth } from '../context/AuthContext';

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // O login geralmente retorna um objeto ou lança erro.
    // Ajuste conforme seu AuthContext.
    // Assumindo que seu login retorna { success: true/false, error: string }
    try {
      const result = await login(loginData.email, loginData.password);

      // Se o seu context não retorna objeto e apenas lança erro no falha,
      // o 'await' passará direto e você pode navegar.
      if (result && result.success === false) {
        setError(result.error || 'Falha ao entrar');
      } else {
        navigate('/'); // Redireciona para Home no sucesso
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">

          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="font-medium text-red-600 hover:text-red-500 transition-colors">
                Crie uma conta grátis
              </Link>
            </p>
          </div>

          {/* Error Message */}
          {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                    placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Conta
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={registerData.roles.includes('BUYER')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRegisterData({ ...registerData, roles: [...registerData.roles, 'BUYER'] });
                        } else {
                          setRegisterData({ ...registerData, roles: registerData.roles.filter(r => r !== 'BUYER') });
                        }
                      }}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Comprador - Comprar produtos</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={registerData.roles.includes('SELLER')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRegisterData({ ...registerData, roles: [...registerData.roles, 'SELLER'] });
                        } else {
                          setRegisterData({ ...registerData, roles: registerData.roles.filter(r => r !== 'SELLER') });
                        }
                      }}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Vendedor - Vender produtos</span>
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500">Selecione pelo menos uma opção</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                    placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-70"
              >
                {loading ? (
                    <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </span>
                ) : 'Entrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}

export default Login;