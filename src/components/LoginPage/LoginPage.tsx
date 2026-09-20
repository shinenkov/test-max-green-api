import { useState } from 'react';
import { Form, Input, Button, Typography, Card, Alert, Divider, Flex } from 'antd';
import { App } from 'antd';
import { UserOutlined, KeyOutlined, LinkOutlined } from '@ant-design/icons';
import { useAuth } from 'hooks/useAuth';
import { setSettings } from 'api/greenApi';
import type { AuthCredentials } from 'types/chat';

const { Title, Text, Link } = Typography;

interface LoginFormValues {
  idInstance: string;
  apiTokenInstance: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleFinish = async (values: LoginFormValues): Promise<void> => {
    setLoading(true);
    setAuthError(null);

    try {
      const credentials: AuthCredentials = {
        idInstance: values.idInstance.trim(),
        apiTokenInstance: values.apiTokenInstance.trim(),
      };
      const res = await setSettings(credentials);
      if (res.saveSettings) {
        login(credentials);
        message.success('Вы вошли в аккаунт');
      }
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage =
        err instanceof Error && err.message.includes('401')
          ? 'Неверный idInstance или apiTokenInstance'
          : 'Не удалось подключиться к GREEN-API. Проверьте данные и попробуйте снова.';
      setAuthError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card
        className="login-card"
        styles={{
          body: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'center',
            position: 'relative',
          },
        }}
      >
        <Flex orientation="vertical" gap={12}>
          <Title level={3} style={{ marginTop: '72px' }}>
            MAX Chat
          </Title>
          <Text type="secondary" color="var(--text-h)">
            Войдите с учётными данными из личного кабинета GREEN-API
          </Text>
          {authError ? (
            <Alert
              type="error"
              title={authError}
              showIcon
              closable={{ onClose: () => setAuthError(null) }}
            />
          ) : (
            <div style={{ height: 40 }}></div>
          )}
        </Flex>

        <Form<LoginFormValues>
          name="login"
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
          requiredMark={false}
          style={{ maxWidth: '360px', width: '100%' }}
        >
          <div className="animation" />
          <Form.Item
            label="idInstance"
            name="idInstance"
            rules={[
              { required: true, message: 'Введите idInstance' },
              { pattern: /^\d+$/, message: 'Только цифры' },
              { min: 5, message: 'Слишком короткий id' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Вставьте инстанс"
              inputMode="numeric"
              autoFocus
              rootClassName="max-input"
              variant="borderless"
            />
          </Form.Item>

          <Form.Item
            label="apiTokenInstance"
            name="apiTokenInstance"
            rules={[
              { required: true, message: 'Введите apiTokenInstance' },
              { min: 20, message: 'Токен слишком короткий' },
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined />}
              placeholder="Вставьте токен"
              rootClassName="max-input"
              variant="borderless"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              rootClassName="max-button"
            >
              Войти
            </Button>
          </Form.Item>
        </Form>
        <Flex style={{ width: '100%' }} orientation="vertical">
          <Divider plain>
            <Text type="secondary">Где взять данные?</Text>
          </Divider>

          <Link
            href="https://console.green-api.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkOutlined /> Личный кабинет GREEN-API
          </Link>
        </Flex>
      </Card>
    </div>
  );
}
