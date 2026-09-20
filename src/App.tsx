import { ConfigProvider, App as AntApp, theme } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { AuthProvider } from 'context/AuthProvider';
import { useAuth } from 'hooks/useAuth';
import { LoginPage } from 'components/LoginPage/LoginPage';
import { ChatPage } from 'components/ChatPage/ChatPage';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { ErrorBoundary } from './common/ErrorBoundary';
import './App.css';

function AppContent() {
  const { state } = useAuth();

  return state.isAuthenticated ? <ChatPage /> : <LoginPage />;
}

export default function App() {
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <ConfigProvider
      locale={ruRU}
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#007aff',
          borderRadius: 16,
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          Listy: {
            itemPaddingBlock: 0,
            itemPaddingInline: 0,
          },
          Form: {
            labelHeight: 22,
            verticalLabelPadding: '0 0 4px',
            itemMarginBottom: 32,
          },
        },
      }}
    >
      <AntApp>
        <ErrorBoundary>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ErrorBoundary>
      </AntApp>
    </ConfigProvider>
  );
}
