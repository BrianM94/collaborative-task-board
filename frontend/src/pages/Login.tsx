import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.scss';

const Login: React.FC = () => {
    const { login, register, loading, error, token } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    React.useEffect(() => {
        if (token) navigate('/');
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isRegister) {
            await register({ username, password });
            setIsRegister(false);
        } else {
            await login({ username, password });
        }
    };

    return (
        <div className={styles.loginPage}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h2>{isRegister ? 'Registrarse' : 'Iniciar sesión'}</h2>
                <input
                    type="text"
                    placeholder="Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <div className={styles.error}>{error}</div>}
                <button type="submit" disabled={loading}>
                    {isRegister ? 'Registrarse' : 'Entrar'}
                </button>
                <button
                    type="button"
                    className={styles.toggle}
                    onClick={() => setIsRegister((v) => !v)}
                >
                    {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                </button>
            </form>
        </div>
    );
};

export default Login; 