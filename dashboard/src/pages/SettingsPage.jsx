import { useEffect, useState } from "react";
import {
  Container,
  Card,
  Stack,
  Alert,
  LoadingOverlay,
  Tabs,
} from "@mantine/core";
import {
  IconX,
  IconCheck,
  IconEyeOff,
  IconTruck,
  IconClock,
  IconClick,
  IconStar,
  IconSettings,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import useSettingsStore from "../stores/useSettingsStore";
import SettingsHeader from "../components/settings/SettingsHeader";
import DisplaySettingsPanel from "../components/settings/DisplaySettingsPanel";
import FreeShippingSettingsPanel from "../components/settings/FreeShippingSettingsPanel";
import TimerSettingsPanel from "../components/settings/TimerSettingsPanel";
import StickyButtonSettingsPanel from "../components/settings/StickyButtonSettingsPanel";
import ReviewCountSettingsPanel from "../components/settings/ReviewCountSettingsPanel";
import SystemSettingsPanel from "../components/settings/SystemSettingsPanel";
import DemoImageModal from "../components/settings/DemoImageModal";

export default function SettingsPage() {
  const {
    settings,
    loading,
    error,
    fetchSettings,
    toggleSetting,
    updateSettings,
  } = useSettingsStore();
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

  const handleToggleChange = async (field, value) => {
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
      // If value is provided, use updateSettings directly instead of toggle
      if (value !== undefined) {
        const keys = field.split(".");
        if (keys.length === 1) {
          await updateSettings({ [field]: value });
        } else {
          const [parent, child] = keys;
          await updateSettings({
            [parent]: {
              ...settings[parent],
              [child]: value,
            },
          });
        }
      } else {
        // Use toggle for boolean fields
        await toggleSetting(field);
      }

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
        <SettingsHeader />

        {/* Error Alert */}
        {error && (
          <Alert color="red" variant="light" icon={<IconX size="1rem" />}>
            {error}
          </Alert>
        )}

        {/* Settings Card */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <LoadingOverlay visible={loading.fetching} />

          <Tabs
            defaultValue="display"
            variant="outline"
            style={{
              position: "relative",
            }}
          >
            <Tabs.List
              grow
              style={{
                position: "sticky",
                top: "70px",
                zIndex: 100,
                backgroundColor: "white",
                borderBottom: "1px solid #dee2e6",
                paddingBottom: "8px",
                marginTop: "-16px",
                paddingTop: "16px",
              }}
            >
              <Tabs.Tab
                value="display"
                leftSection={<IconEyeOff size="1rem" />}
              >
                إعدادات العرض
              </Tabs.Tab>
              <Tabs.Tab
                value="sticky-button"
                leftSection={<IconClick size="1rem" />}
              >
                الزر الثابت
              </Tabs.Tab>
              <Tabs.Tab
                value="shipping"
                leftSection={<IconTruck size="1rem" />}
              >
                لافتة الشحن المجاني
              </Tabs.Tab>
              <Tabs.Tab value="timer" leftSection={<IconClock size="1rem" />}>
                إعدادات المؤقت
              </Tabs.Tab>
              <Tabs.Tab value="reviews" leftSection={<IconStar size="1rem" />}>
                التقييمات
              </Tabs.Tab>
              <Tabs.Tab
                value="system"
                leftSection={<IconSettings size="1rem" />}
              >
                إعدادات النظام
              </Tabs.Tab>
            </Tabs.List>

            {/* Tab 1: Display Settings */}
            <Tabs.Panel value="display" pt="xl">
              <DisplaySettingsPanel
                settings={settings}
                loading={loading}
                onToggle={handleToggleChange}
                onShowButtonsModal={() => setShowButtonsModal(true)}
                onShowOfferModal={() => setShowOfferModal(true)}
                onShowOptionsModal={() => setShowOptionsModal(true)}
                onShowQuantityModal={() => setShowQuantityModal(true)}
                onShowPriceModal={() => setShowPriceModal(true)}
              />
            </Tabs.Panel>

            {/* Tab 2: Sticky Button */}
            <Tabs.Panel value="sticky-button" pt="xl">
              <StickyButtonSettingsPanel
                settings={settings}
                loading={loading}
                onToggle={handleToggleChange}
              />
            </Tabs.Panel>

            {/* Tab 3: Free Shipping Banner */}
            <Tabs.Panel value="shipping" pt="xl">
              <FreeShippingSettingsPanel
                settings={settings}
                loading={loading}
                onToggle={handleToggleChange}
              />
            </Tabs.Panel>

            {/* Tab 4: Timer Settings */}
            <Tabs.Panel value="timer" pt="xl">
              <TimerSettingsPanel
                settings={settings}
                loading={loading}
                onToggle={handleToggleChange}
              />
            </Tabs.Panel>

            {/* Tab 5: Review Count Settings */}
            <Tabs.Panel value="reviews" pt="xl">
              <ReviewCountSettingsPanel
                settings={settings}
                loading={loading}
                onToggle={handleToggleChange}
              />
            </Tabs.Panel>

            {/* Tab 6: System Settings */}
            <Tabs.Panel value="system" pt="xl">
              <SystemSettingsPanel />
            </Tabs.Panel>
          </Tabs>
        </Card>

        {/* Demo Modals */}
        <DemoImageModal
          opened={showButtonsModal}
          onClose={() => setShowButtonsModal(false)}
          title="مثال: أزرار سلة الافتراضية"
          description="هذه هي الأزرار الافتراضية من سلة التي سيتم إخفاؤها عند تفعيل الخيار:"
          imageSrc="/salla-buy-buttons.png"
          imageAlt="Salla Default Buy Buttons"
          warningText='سيتم إخفاء أزرار "إضافة للسلة" و "اشتر الآن" في المنتجات التي لديها باقات نشطة فقط. سيظهر بدلاً منها زر الباقة الخاص بك.'
        />

        <DemoImageModal
          opened={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          title="مثال: نافذة عروض سلة الافتراضية"
          description="هذه هي النافذة المنبثقة الافتراضية من سلة التي سيتم إخفاؤها عند تفعيل الخيار:"
          imageSrc="/salla-model.png"
          imageAlt="Salla Default Offer Modal"
          warningText="سيتم إخفاء هذه النافذة فقط (s-offer-modal-type-products). النوافذ الأخرى من سلة ستبقى تعمل بشكل طبيعي."
        />

        <DemoImageModal
          opened={showOptionsModal}
          onClose={() => setShowOptionsModal(false)}
          title="مثال: قسم خيارات المنتج الافتراضي"
          description="هذا هو قسم خيارات المنتج (salla-product-options) الذي سيتم إخفاؤه عند تفعيل الخيار:"
          imageSrc="/salla-options.png"
          imageAlt="Salla Product Options"
          warningText="سيتم إخفاء قسم خيارات المنتج الافتراضي في صفحة المنتج المستهدف فقط عند وجود عروض باقات نشطة عليه. سيختار العميل الخيارات من نافذة الباقة بدلاً من ذلك."
        />

        <DemoImageModal
          opened={showQuantityModal}
          onClose={() => setShowQuantityModal(false)}
          title="مثال: قسم الكمية الافتراضي"
          description="هذا هو قسم الكمية (parent section of salla-quantity-input) الذي سيتم إخفاؤه عند تفعيل الخيار:"
          imageSrc="/salla-qta.png"
          imageAlt="Salla Quantity Input"
          warningText="سيتم إخفاء قسم الكمية الافتراضي في صفحة المنتج المستهدف فقط عند وجود عروض باقات نشطة عليه. يتم اختيار الكمية من خلال نافذة الباقة بدلاً من ذلك."
        />

        <DemoImageModal
          opened={showPriceModal}
          onClose={() => setShowPriceModal(false)}
          title="مثال: قسم السعر الافتراضي"
          description="هذا هو قسم السعر (price-wrapper, total-price, before-price) الذي سيتم إخفاؤه عند تفعيل الخيار:"
          imageSrc="/salla-price.png"
          imageAlt="Salla Price Section"
          warningText="سيتم إخفاء قسم السعر الافتراضي الموجود داخل النموذج (product-form) في صفحة المنتج المستهدف فقط عند وجود عروض باقات نشطة عليه. يتم عرض السعر من خلال نافذة الباقة بدلاً من ذلك."
        />
      </Stack>
    </Container>
  );
}
