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
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);

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

                {/* Hide Product Options Toggle */}
                <div>
                  <Switch
                    size="md"
                    label={
                      <div>
                        <Text fw={500} size="sm">
                          إخفاء خيارات المنتج الافتراضية
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          إخفاء قسم خيارات المنتج (salla-product-options) في
                          المنتج المستهدف عند وجود عروض باقات نشطة عليه
                        </Text>
                      </div>
                    }
                    checked={settings.hide_product_options}
                    onChange={(event) =>
                      handleToggleChange(
                        "hide_product_options",
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
                      onClick={() => setShowOptionsModal(true)}
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
                      <strong>ملاحظة:</strong> هذا الخيار يخفي قسم خيارات المنتج
                      الافتراضي (salla-product-options) الموجود داخل النموذج
                      (product-form) في صفحة المنتج المستهدف فقط عند وجود عروض
                      باقات عليه. هذا يمنع الارتباك ويوجه العميل لاختيار
                      الخيارات من نافذة الباقة.
                    </Text>
                  </Alert>
                </div>

                <Divider />

                {/* Hide Quantity Input Toggle */}
                <div>
                  <Switch
                    size="md"
                    label={
                      <div>
                        <Text fw={500} size="sm">
                          إخفاء حقل الكمية الافتراضي
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          إخفاء قسم الكمية (parent section of
                          salla-quantity-input) في المنتج المستهدف عند وجود عروض
                          باقات نشطة عليه
                        </Text>
                      </div>
                    }
                    checked={settings.hide_quantity_input}
                    onChange={(event) =>
                      handleToggleChange(
                        "hide_quantity_input",
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
                      onClick={() => setShowQuantityModal(true)}
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
                      <strong>ملاحظة:</strong> هذا الخيار يخفي قسم الكمية
                      الافتراضي الموجود داخل النموذج (product-form) في صفحة
                      المنتج المستهدف فقط عند وجود عروض باقات عليه. يتم اختيار
                      الكمية من خلال نافذة الباقة.
                    </Text>
                  </Alert>
                </div>

                <Divider />

                {/* Hide Price Section Toggle */}
                <div>
                  <Switch
                    size="md"
                    label={
                      <div>
                        <Text fw={500} size="sm">
                          إخفاء قسم السعر الافتراضي
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          إخفاء قسم السعر (price-wrapper وعناصر السعر) الموجود
                          داخل النموذج (product-form) في المنتج المستهدف عند
                          وجود عروض باقات نشطة عليه
                        </Text>
                      </div>
                    }
                    checked={settings.hide_price_section}
                    onChange={(event) =>
                      handleToggleChange(
                        "hide_price_section",
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
                      onClick={() => setShowPriceModal(true)}
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
                      <strong>ملاحظة:</strong> هذا الخيار يخفي قسم السعر
                      الافتراضي (price-wrapper, total-price, before-price)
                      الموجود داخل النموذج (product-form) في صفحة المنتج
                      المستهدف فقط عند وجود عروض باقات عليه. يتم عرض السعر من
                      خلال نافذة الباقة بدلاً من ذلك.
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

        {/* Hide Product Options Demo Modal */}
        <Modal
          opened={showOptionsModal}
          onClose={() => setShowOptionsModal(false)}
          title="مثال: قسم خيارات المنتج الافتراضي"
          size="lg"
          centered
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              هذا هو قسم خيارات المنتج (salla-product-options) الذي سيتم إخفاؤه
              عند تفعيل الخيار:
            </Text>
            <Image
              src="/salla-options.png"
              alt="Salla Product Options"
              radius="md"
              fit="contain"
            />
            <Alert color="yellow" variant="light">
              <Text size="xs">
                سيتم إخفاء قسم خيارات المنتج الافتراضي في صفحة المنتج المستهدف
                فقط عند وجود عروض باقات نشطة عليه. سيختار العميل الخيارات من
                نافذة الباقة بدلاً من ذلك.
              </Text>
            </Alert>
          </Stack>
        </Modal>

        {/* Hide Quantity Input Demo Modal */}
        <Modal
          opened={showQuantityModal}
          onClose={() => setShowQuantityModal(false)}
          title="مثال: قسم الكمية الافتراضي"
          size="lg"
          centered
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              هذا هو قسم الكمية (parent section of salla-quantity-input) الذي
              سيتم إخفاؤه عند تفعيل الخيار:
            </Text>
            <Image
              src="/salla-qta.png"
              alt="Salla Quantity Input"
              radius="md"
              fit="contain"
            />
            <Alert color="yellow" variant="light">
              <Text size="xs">
                سيتم إخفاء قسم الكمية الافتراضي في صفحة المنتج المستهدف فقط عند
                وجود عروض باقات نشطة عليه. يتم اختيار الكمية من خلال نافذة
                الباقة بدلاً من ذلك.
              </Text>
            </Alert>
          </Stack>
        </Modal>

        {/* Hide Price Section Demo Modal */}
        <Modal
          opened={showPriceModal}
          onClose={() => setShowPriceModal(false)}
          title="مثال: قسم السعر الافتراضي"
          size="lg"
          centered
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              هذا هو قسم السعر (price-wrapper, total-price, before-price) الذي
              سيتم إخفاؤه عند تفعيل الخيار:
            </Text>
            <Image
              src="/salla-price.png"
              alt="Salla Price Section"
              radius="md"
              fit="contain"
            />
            <Alert color="yellow" variant="light">
              <Text size="xs">
                سيتم إخفاء قسم السعر الافتراضي الموجود داخل النموذج
                (product-form) في صفحة المنتج المستهدف فقط عند وجود عروض باقات
                نشطة عليه. يتم عرض السعر من خلال نافذة الباقة بدلاً من ذلك.
              </Text>
            </Alert>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
}
