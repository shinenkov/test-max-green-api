import { useState } from 'react';
import { Form, Input, Button, Typography, App } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import { checkAccount } from 'api/greenApi';
import { useAuth } from 'hooks/useAuth';
import { isKnownNotExist, addNotExistPhone } from 'utils/checkAccountCache';
import type { Chat } from 'types/chat';
import './styles.css';

const { Title, Text } = Typography;

interface FormValues {
  phoneNumber: string;
}

interface CreateChatFormProps {
  existingChats: Chat[];
  onCreated: (chat: Chat) => void;
  onSelectExisting: (chatId: string) => void;
  onCancel?: () => void;
}

export function CreateChatForm({
  existingChats,
  onCreated,
  onSelectExisting,
  onCancel,
}: CreateChatFormProps) {
  const { state } = useAuth();
  const { idInstance, apiTokenInstance } = state;
  const { message } = App.useApp();

  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values: FormValues): Promise<void> => {
    const phoneNumber = values.phoneNumber;

    const existing = existingChats.find((chat) => chat.phoneNumber === phoneNumber);
    if (existing) {
      message.info('Этот чат уже создан');
      onSelectExisting(existing.id);
      form.resetFields();
      return;
    }

    if (isKnownNotExist(phoneNumber)) {
      message.warning('Этот номер уже проверялся и не зарегистрирован в MAX');
      return;
    }

    setLoading(true);
    try {
      const response = await checkAccount({ idInstance, apiTokenInstance }, phoneNumber);

      if (!response.exist) {
        addNotExistPhone(phoneNumber);
        message.warning(
          'Этот номер не зарегистрирован в MAX. Проверьте правильность ввода.'
        );
        return;
      }

      const chat: Chat = {
        id: response.chatId,
        phoneNumber,
        unread: 0,
      };

      onCreated(chat);
      form.resetFields();
    } catch (err) {
      console.error('CheckAccount failed:', err);
      message.error('Не удалось проверить номер. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-chat-form">
      <Title level={3}>Новый чат</Title>
      <Text type="secondary">Введите номер телефона в международном формате без "+"</Text>

      <Form<FormValues>
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
        requiredMark={false}
        className="create-chat-form__form"
      >
        <Form.Item
          label="Номер телефона"
          name="phoneNumber"
          rules={[
            { required: true, message: 'Введите номер телефона' },
            {
              pattern: /^7\d{10}$/,
              message: 'Формат: 79991234567 (11 цифр, начиная с 7)',
            },
          ]}
          normalize={(value?: string) => (value ? value.replace(/[\s\-()+]/g, '') : '')}
        >
          <Input
            prefix={<PhoneOutlined />}
            placeholder="79991234567"
            inputMode="numeric"
            rootClassName="max-input"
            variant="borderless"
            disabled={loading}
          />
        </Form.Item>

        <Form.Item>
          <div className="create-chat-form__actions">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              rootClassName="max-button"
            >
              Создать чат
            </Button>
            {onCancel && (
              <Button
                onClick={onCancel}
                size="large"
                rootClassName="max-button"
                block
                disabled={loading}
              >
                Отмена
              </Button>
            )}
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}
