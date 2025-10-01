import { useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  Switch,
  Group,
  Alert,
  Divider,
  LoadingOverlay,
  Image,
  Modal,
  Button,
} from "@mantine/core";
import { useState } from "react";
import {
  IconSettings,
  IconCheck,
  IconX,
  IconInfoCircle,
  IconEyeOff,
  IconPhoto,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import useSettingsStore from "../stores/useSettingsStore";

export default function SettingsPage() {
  const { settings, loading, error, fetchSettings, toggleSetting } =
    useSettingsStore();
  const [showButtonsModal, setShowButtonsModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  useEffect(() => {
    fetchSettings().catch((error) => {
      notifications.show({
        title: "خطأ في تحميل الإعدادات",
        message: error.message || "حدث خطأ أثناء تحميل الإعدادات",
        color: "red",
        icon: <IconX size="1rem" />,
      });
    });
  }, [fetchSettings]);

  const handleToggleChange = async (field) => {
    // Show loading notification
    const notificationId = `update-${field}`;
    notifications.show({
      id: notificationId,
      loading: true,
      title: "جاري الحفظ...",
      message: "جاري تحديث الإعدادات...",
      autoClose: false,
      withCloseButton: false,
    });

    try {
      await toggleSetting(field);

      notifications.update({
        id: notificationId,
        loading: false,
        title: "تم الحفظ بنجاح",
        message: "تم تحديث الإعدادات بنجاح",
        color: "green",
        icon: <IconCheck size="1rem" />,
        autoClose: 3000,
      });
    } catch (error) {
      notifications.update({
        id: notificationId,
        loading: false,
        title: "خطأ في الحفظ",
        message: error.message || "حدث خطأ أثناء تحديث الإعدادات",
        color: "red",
        icon: <IconX size="1rem" />,
        autoClose: 5000,
      });
    }
  };

  return (
    <Container size="lg" px={0}>
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Group gap="sm" mb="xs">
            <IconSettings size="2rem" className="text-blue-600" />
            <Title order={1} className="text-gray-800">
              الإعدادات
            </Title>
          </Group>
          <Text className="text-gray-600">
            إدارة إعدادات التطبيق والتحكم في سلوك الباقات
          </Text>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert color="red" variant="light" icon={<IconX size="1rem" />}>
            {error}
          </Alert>
        )}

        {/* Settings Card */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <LoadingOverlay visible={loading.fetching} />

          <Stack gap="xl">
            {/* Display Settings Section */}
            <div>
              <Group gap="xs" mb="md">
                <IconEyeOff size="1.2rem" className="text-gray-700" />
                <Title order={3} className="text-gray-800">
                  إعدادات العرض
                </Title>
              </Group>

              <Stack gap="md">
                {/* Hide Default Buttons Toggle */}
                <div>
                  <Switch
                    size="md"
                    label={
                      <div>
                        <Text fw={500} size="sm">
                          إخفاء أزرار سلة الافتراضية
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          إخفاء أزرار "إضافة للسلة" و "اشتر الآن" الافتراضية من
                          سلة في صفحات المنتجات التي تحتوي على باقات نشطة
                        </Text>
                      </div>
                    }
                    checked={settings.hide_default_buttons}
                    onChange={(event) =>
                      handleToggleChange(
                        "hide_default_buttons",
                        event.currentTarget.checked
                      )
                    }
                    disabled={loading.updating}
                  />

                  <Group mt="md">
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={<IconPhoto size="0.9rem" />}
                      onClick={() => setShowButtonsModal(true)}
                    >
                      عرض مثال توضيحي
                    </Button>
                  </Group>

                  <Alert
                    icon={<IconInfoCircle size="1rem" />}
                    color="blue"
                    variant="light"
                    mt="md"
                  >
                    <Text size="sm">
                      <strong>ملاحظة:</strong> عند تفعيل هذا الخيار، سيتم إخفاء
                      أزرار سلة الافتراضية في صفحات المنتجات التي لديها باقات
                      نشطة فقط. سيظهر بدلاً منها زر الباقة الخاص بك. هذا يساعد
                      على تجنب الارتباك ويشجع العملاء على اختيار الباقات.
                    </Text>
                  </Alert>
                </div>

                <Divider />

                {/* Hide Salla Offer Modal Toggle */}
                <div>
                  <Switch
                    size="md"
                    label={
                      <div>
                        <Text fw={500} size="sm">
                          إخفاء نافذة عروض سلة الافتراضية
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          إخفاء النافذة المنبثقة الافتراضية من سلة التي تظهر عند
                          وجود عروض خاصة على المنتج
                        </Text>
                      </div>
                    }
                    checked={settings.hide_salla_offer_modal}
                    onChange={(event) =>
                      handleToggleChange(
                        "hide_salla_offer_modal",
                        event.currentTarget.checked
                      )
                    }
                    disabled={loading.updating}
                  />

                  <Group mt="md">
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={<IconPhoto size="0.9rem" />}
                      onClick={() => setShowOfferModal(true)}
                    >
                      عرض مثال توضيحي
                    </Button>
                  </Group>

                  <Alert
                    icon={<IconInfoCircle size="1rem" />}
                    color="blue"
                    variant="light"
                    mt="md"
                  >
                    <Text size="sm">
                      <strong>ملاحظة:</strong> هذا الخيار يخفي النافذة المنبثقة
                      الافتراضية من سلة (s-offer-modal-type-products) فقط.
                      النوافذ الأخرى من سلة ستعمل بشكل طبيعي.
                    </Text>
                  </Alert>
                </div>

                <Divider />
              </Stack>
            </div>
          </Stack>
        </Card>

        {/* Hide Buttons Demo Modal */}
        <Modal
          opened={showButtonsModal}
          onClose={() => setShowButtonsModal(false)}
          title="مثال: أزرار سلة الافتراضية"
          size="lg"
          centered
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              هذه هي الأزرار الافتراضية من سلة التي سيتم إخفاؤها عند تفعيل
              الخيار:
            </Text>
            <Image
              src="/salla-buy-buttons.png"
              alt="Salla Default Buy Buttons"
              radius="md"
              fit="contain"
            />
            <Alert color="yellow" variant="light">
              <Text size="xs">
                سيتم إخفاء أزرار "إضافة للسلة" و "اشتر الآن" في المنتجات التي
                لديها باقات نشطة فقط. سيظهر بدلاً منها زر الباقة الخاص بك.
              </Text>
            </Alert>
          </Stack>
        </Modal>

        {/* Hide Offer Modal Demo */}
        <Modal
          opened={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          title="مثال: نافذة عروض سلة الافتراضية"
          size="lg"
          centered
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              هذه هي النافذة المنبثقة الافتراضية من سلة التي سيتم إخفاؤها عند
              تفعيل الخيار:
            </Text>
            <Image
              src="/salla-model.png"
              alt="Salla Default Offer Modal"
              radius="md"
              fit="contain"
            />
            <Alert color="yellow" variant="light">
              <Text size="xs">
                سيتم إخفاء هذه النافذة فقط (s-offer-modal-type-products).
                النوافذ الأخرى من سلة ستبقى تعمل بشكل طبيعي.
              </Text>
            </Alert>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
}
