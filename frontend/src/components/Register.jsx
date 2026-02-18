import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth(); // Usando register do contexto
    const navigate = useNavigate();

    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        cpf: '',
        phone: '',
        address: '',
        role: 'BUYER'
    });

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // Validações
        if (registerData.password !== registerData.confirmPassword) {
            setError('As senhas não coincidem');
            window.scrollTo(0, 0);
            return;
        }

        if (registerData.password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres');
            window.scrollTo(0, 0);
            return;
        }

        const cleanCpf = registerData.cpf.replace(/\D/g, '');
        if (cleanCpf.length !== 11) {
            setError('CPF deve ter 11 dígitos');
            window.scrollTo(0, 0);
            return;
        }

        const cleanPhone = registerData.phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            setError('Telefone inválido');
            window.scrollTo(0, 0);
            return;
        }

        setLoading(true);

        try {
            const result = await register({
                name: registerData.name,
                email: registerData.email,
                password: registerData.password,
                cpf: cleanCpf,
                phone: cleanPhone,
                address: registerData.address,
                role: registerData.role
            });

            if (result && result.success === false) {
                setError(result.error);
                window.scrollTo(0, 0);
            } else {
                // Sucesso no registro
                navigate('/'); // Ou navigate('/login') se quiser que ele logue depois
            }
        } catch (err) {
            console.error(err);
            setError('Erro ao criar conta. Tente novamente.');
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">

                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Crie sua conta
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Já possui uma conta?{' '}
                        <Link to="/login" className="font-medium text-red-600 hover:text-red-500 transition-colors">
                            Faça login aqui
                        </Link>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <form onSubmit={handleRegister} className="mt-8 space-y-4">

                    {/* Nome */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <input
                            type="text"
                            required
                            value={registerData.name}
                            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="João Silva"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="seu@email.com"
                        />
                    </div>

                    {/* Grid CPF e Telefone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                            <input
                                type="text"
                                required
                                value={registerData.cpf}
                                onChange={(e) => setRegisterData({ ...registerData, cpf: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="000.000.000-00"
                                maxLength="14"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                            <input
                                type="text"
                                required
                                value={registerData.phone}
                                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="(11) 99999-9999"
                                maxLength="15"
                            />
                        </div>
                    </div>

                    {/* Endereço */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                        <input
                            type="text"
                            required
                            value={registerData.address}
                            onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Rua, número, bairro"
                        />
                    </div>

                    {/* Tipo de Conta */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Conta</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div
                                onClick={() => setRegisterData({ ...registerData, role: 'BUYER' })}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    registerData.role === 'BUYER'
                                        ? 'border-red-600 bg-red-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="role"
                                        checked={registerData.role === 'BUYER'}
                                        onChange={() => {}}
                                        className="mr-3 text-red-600 focus:ring-red-500"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-900">Comprador</div>
                                    </div>
                                </div>
                            </div>

                            <div
                                onClick={() => setRegisterData({ ...registerData, role: 'SELLER' })}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    registerData.role === 'SELLER'
                                        ? 'border-red-600 bg-red-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="role"
                                        checked={registerData.role === 'SELLER'}
                                        onChange={() => {}}
                                        className="mr-3 text-red-600 focus:ring-red-500"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-900">Vendedor</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Senhas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                        <input
                            type="password"
                            required
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                        <input
                            type="password"
                            required
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Digite a senha novamente"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-md font-medium transition-colors disabled:opacity-50 mt-6"
                    >
                        {loading ? 'Criando conta...' : 'Criar Conta'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;