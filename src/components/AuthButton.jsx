import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User } from 'lucide-react';
import AuthModal from './AuthModal';
import clsx from 'clsx';

export default function AuthButton() {
  const { user, isAnonymous, signOut } = useAuth();
  const { isDark } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowMenu(false);
  };

  return (
    <>
      {isAnonymous ? (
        // Show "Convert Account" button for anonymous users
        <button
          onClick={() => setShowModal(true)}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isDark
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          <User className="w-4 h-4" />
          Guardar Dados
        </button>
      ) : (
        // Show profile dropdown for authenticated users
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <User className="w-4 h-4" />
            Conta
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className={clsx(
              'absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50',
              isDark ? 'bg-gray-700' : 'bg-white'
            )}>
              <div className={clsx(
                'px-4 py-3 border-b',
                isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
              )}>
                <p className="text-xs opacity-75">Conectado como</p>
                <p className="font-medium truncate">{user?.email || 'Utilizador'}</p>
              </div>

              <button
                onClick={handleSignOut}
                className={clsx(
                  'w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                  isDark
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <LogOut className="w-4 h-4" />
                Terminar Sessão
              </button>
            </div>
          )}
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
