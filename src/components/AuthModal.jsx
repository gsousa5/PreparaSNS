import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { X, Mail, Lock } from 'lucide-react';
import clsx from 'clsx';

export default function AuthModal({ isOpen, onClose }) {
  const { signUpWithEmail, signInWithEmail, error: authError } = useAuth();
  const { isDark } = useTheme();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setMessage('');

      if (isSignUp) {
        const { error } = await signUpWithEmail(data.email, data.password);
        if (error) throw error;
        setMessage('Conta criada com sucesso! Verifique seu email.');
        reset();
        setTimeout(onClose, 2000);
      } else {
        const { error } = await signInWithEmail(data.email, data.password);
        if (error) throw error;
        setMessage('Login bem-sucedido!');
        reset();
        setTimeout(onClose, 1500);
      }
    } catch (err) {
      setMessage(err.message || 'Erro ao processar pedido');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={clsx(
        'w-full max-w-md rounded-3xl shadow-2xl p-8 transition-all',
        isDark ? 'bg-gray-800' : 'bg-white'
      )}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <h2 className={clsx('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900')}>
          {isSignUp ? 'Criar Conta' : 'Entrar'}
        </h2>
        <p className={clsx('text-sm mb-6', isDark ? 'text-gray-400' : 'text-gray-600')}>
          {isSignUp
            ? 'Guarde seu progresso na nuvem'
            : 'Aceda à sua conta'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className={clsx('block text-sm font-medium mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
              Email
            </label>
            <div className="relative">
              <Mail className={clsx('absolute left-3 top-3 w-5 h-5', isDark ? 'text-gray-500' : 'text-gray-400')} />
              <input
                {...register('email', {
                  required: 'Email obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                type="email"
                placeholder="seu@email.com"
                className={clsx(
                  'w-full pl-10 pr-4 py-2 rounded-lg border transition-colors',
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400',
                  errors.email && 'border-danger-red'
                )}
              />
            </div>
            {errors.email && <p className="text-danger-red text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className={clsx('block text-sm font-medium mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
              Palavra-passe
            </label>
            <div className="relative">
              <Lock className={clsx('absolute left-3 top-3 w-5 h-5', isDark ? 'text-gray-500' : 'text-gray-400')} />
              <input
                {...register('password', {
                  required: 'Palavra-passe obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Mínimo 6 caracteres'
                  }
                })}
                type="password"
                placeholder="••••••••"
                className={clsx(
                  'w-full pl-10 pr-4 py-2 rounded-lg border transition-colors',
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400',
                  errors.password && 'border-danger-red'
                )}
              />
            </div>
            {errors.password && <p className="text-danger-red text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* Error message */}
          {authError && (
            <p className="text-danger-red text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {authError}
            </p>
          )}

          {/* Success message */}
          {message && (
            <p className="text-success-green text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              {message}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={clsx(
              'w-full py-3 px-4 rounded-lg font-semibold transition-colors',
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:opacity-90',
              'bg-primary-blue text-white'
            )}
          >
            {isLoading ? 'Processando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        {/* Toggle signup/signin */}
        <div className="mt-6 text-center">
          <p className={clsx('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
            {isSignUp ? 'Já tem conta?' : 'Sem conta?'}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                reset();
                setMessage('');
              }}
              className="ml-2 text-primary-blue font-semibold hover:underline"
            >
              {isSignUp ? 'Entrar' : 'Criar Conta'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
