import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  Group,
  Button,
  TextInput,
  Select,
  NumberInput,
  Grid,
  ActionIcon,
  Alert,
  Stepper,
  Paper,
  Image,
  Badge,
  Divider,
  Textarea,
  ColorInput,
  Switch,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconPlus,
  IconTrash,
  IconPackage,
  IconGift,
  IconCalendar,
  IconCheck,
  IconX,
  IconSearch,
  IconArrowLeft,
  IconArrowRight,
  IconPalette,
  IconStar,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import useBundleStore from "../stores/useBundleStore";
import { usePlanFeatures } from "../hooks/usePlanFeatures";
import UpgradePrompt from "../components/common/UpgradePrompt";
import CreateBundleTour from "../components/tour/CreateBundleTour";

export default function CreateBundlePage() {
  const navigate = useNavigate();
  const { createBundle, fetchProducts, products, loading } = useBundleStore();
  const { features } = usePlanFeatures();
  const [active, setActive] = useState(0);
  const [productSearch, setProductSearch] = useState("");
  const [offerSearch, setOfferSearch] = useState("");

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      target_product_id: "",
      target_product_name: "",
      start_date: new Date(),
      expiry_date: null,
      modal_title: "اختر باقتك",
      modal_subtitle: "",
      cta_button_text: "اختر الباقة",
      cta_button_bg_color: "#000",
      cta_button_text_color: "#ffffff",
      checkout_button_text: "إتمام الطلب — {total_price}",
      checkout_button_bg_color: "#000",
      checkout_button_text_color: "#ffffff",
      bundles: [
        {
          tier: 1,
          buy_quantity: 1,
          tier_title: "باقة البداية",
          tier_highlight_text: "",
          tier_bg_color: "#f8f9fa",
          tier_text_color: "#212529",
          tier_highlight_bg_color: "#ffc107",
          tier_highlight_text_color: "#000000",
          is_default: true,
          offers: [
            {
              product_id: "",
              product_name: "",
              quantity: 1,
              discount_type: "free",
              discount_amount: 100,
              offer_type: "gift",
              arabic_message: "اشترِ واحد واحصل على عرض خاص",
            },
          ],
        },
      ],
    },
    validate: {
      name: (value) =>
        value.length < 3 ? "اسم الباقة يجب أن يكون 3 أحرف على الأقل" : null,
      target_product_id: (value) =>
        !value ? "يجب اختيار المنتج المستهدف" : null,
      start_date: (value) => (!value ? "يجب تحديد تاريخ البدء" : null),
    },
  });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (product.sku &&
        product.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const filteredOfferProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(offerSearch.toLowerCase()) ||
      (product.sku &&
        product.sku.toLowerCase().includes(offerSearch.toLowerCase()))
  );

  const addTier = () => {
    const tierNum = form.values.bundles.length + 1;
    const tierColors = [
      {
        bg: "#f8f9fa",
        text: "#212529",
        highlightBg: "#17a2b8",
        highlightText: "#ffffff",
      }, // Light gray
      {
        bg: "#e3f2fd",
        text: "#1565c0",
        highlightBg: "#1976d2",
        highlightText: "#ffffff",
      }, // Light blue
      {
        bg: "#f3e5f5",
        text: "#6a1b9a",
        highlightBg: "#7b1fa2",
        highlightText: "#ffffff",
      }, // Light purple
      {
        bg: "#fff3e0",
        text: "#e65100",
        highlightBg: "#f57c00",
        highlightText: "#ffffff",
      }, // Light orange
      {
        bg: "#e8f5e9",
        text: "#2e7d32",
        highlightBg: "#388e3c",
        highlightText: "#ffffff",
      }, // Light green
    ];
    const colorScheme = tierColors[(tierNum - 1) % tierColors.length];

    const newTier = {
      tier: tierNum,
      buy_quantity: tierNum,
      tier_title:
        tierNum === 2
          ? "باقة الأصدقاء"
          : tierNum === 3
          ? "باقة العائلة"
          : `العرض ${tierNum}`,
      tier_highlight_text:
        tierNum === 2 ? "وفر أكثر" : tierNum === 3 ? "أفضل قيمة" : "",
      tier_bg_color: colorScheme.bg,
      tier_text_color: colorScheme.text,
      tier_highlight_bg_color: colorScheme.highlightBg,
      tier_highlight_text_color: colorScheme.highlightText,
      is_default: false,
      offers: [
        {
          product_id: "",
          product_name: "",
          quantity: 1,
          discount_type: "free",
          discount_amount: 100,
          offer_type: "gift",
          arabic_message: `اشترِ ${tierNum} واحصل على عرض خاص`,
        },
      ],
    };
    form.setFieldValue("bundles", [...form.values.bundles, newTier]);
  };

  const removeTier = (tierIndex) => {
    if (form.values.bundles.length > 1) {
      const updatedBundles = form.values.bundles.filter(
        (_, index) => index !== tierIndex
      );
      // Re-number tiers
      const renumberedBundles = updatedBundles.map((bundle, index) => ({
        ...bundle,
        tier: index + 1,
      }));
      form.setFieldValue("bundles", renumberedBundles);
    }
  };

  const addOffer = (tierIndex) => {
    const newOffer = {
      product_id: "",
      product_name: "",
      quantity: 1,
      discount_type: "free",
      discount_amount: 100,
      offer_type: "gift",
      arabic_message: "عرض خاص",
    };
    form.setFieldValue(`bundles.${tierIndex}.offers`, [
      ...form.values.bundles[tierIndex].offers,
      newOffer,
    ]);
  };

  const removeOffer = (tierIndex, offerIndex) => {
    if (form.values.bundles[tierIndex].offers.length > 1) {
      const updatedOffers = form.values.bundles[tierIndex].offers.filter(
        (_, index) => index !== offerIndex
      );
      form.setFieldValue(`bundles.${tierIndex}.offers`, updatedOffers);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const bundleData = {
        ...values,
        created_by: "dashboard",
      };

      await createBundle(bundleData);

      notifications.show({
        title: "تم إنشاء الباقة بنجاح",
        message: "تم حفظ الباقة كمسودة. يمكنك تفعيلها من صفحة إدارة الباقات",
        color: "green",
        icon: <IconCheck size="1rem" />,
      });

      navigate("/dashboard/bundles");
    } catch (error) {
      notifications.show({
        title: "خطأ في إنشاء الباقة",
        message: error.message || "حدث خطأ أثناء إنشاء الباقة",
        color: "red",
        icon: <IconX size="1rem" />,
      });
    }
  };

  const nextStep = () => {
    if (active === 0) {
      const errors = form.validate();
      if (errors.hasErrors) return;
    }
    setActive((current) => (current < 3 ? current + 1 : current));
  };

  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const { canCreateBundle } = usePlanFeatures();
  const bundleCount = useBundleStore.getState().bundles?.length || 0;
  const canCreate = canCreateBundle(bundleCount);

  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Group gap="md" mb="sm">
            <Button
              variant="light"
              leftSection={<IconArrowRight size="1rem" />}
              onClick={() => navigate("/dashboard/bundles")}
            >
              العودة للباقات
            </Button>
          </Group>
          <Title order={1} className="text-gray-800 mb-2">
            إنشاء باقة جديدة
          </Title>
          <Text className="text-gray-600">
            أنشئ باقة مخصصة مع هدايا مجانية لزيادة المبيعات وقيمة الطلب الواحد
          </Text>
        </div>

        {!canCreate && <UpgradePrompt featureName="إنشاء باقات إضافية" />}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            {/* Stepper */}
            <Stepper active={active} onStepClick={setActive} mb="xl">
              <Stepper.Step
                label="المعلومات الأساسية"
                description="اسم الباقة والمنتج المستهدف"
                icon={<IconPackage size="1.1rem" />}
              />
              <Stepper.Step
                label="إعداد العروض"
                description="تحديد عروضالباقة والهدايا"
                icon={<IconGift size="1.1rem" />}
              />
              <Stepper.Step
                label="التواريخ والإعدادات"
                description="تواريخ التفعيل والانتهاء"
                icon={<IconCalendar size="1.1rem" />}
              />
              <Stepper.Step
                label="المراجعة والحفظ"
                description="مراجعة نهائية وحفظ الباقة"
                icon={<IconCheck size="1.1rem" />}
              />
            </Stepper>

            {/* Step 1: Basic Information */}
            {active === 0 && (
              <Stack gap="md">
                <Title order={3} className="text-gray-700">
                  المعلومات الأساسية
                </Title>

                <Grid>
                  <Grid.Col span={12}>
                    <TextInput
                      data-tour="bundle-name"
                      label="اسم الباقة"
                      placeholder="مثال: باقة الصيف المميزة"
                      required
                      {...form.getInputProps("name")}
                    />
                  </Grid.Col>

                  <Grid.Col span={12}>
                    <Textarea
                      label="وصف الباقة (اختياري)"
                      placeholder="وصف مختصر للباقة..."
                      {...form.getInputProps("description")}
                    />
                  </Grid.Col>

                  <Grid.Col span={12}>
                    <div data-tour="target-product">
                      <Text size="sm" fw={500} mb="xs">
                        المنتج المستهدف <span className="text-red-500">*</span>
                      </Text>
                      <TextInput
                        placeholder="البحث في المنتجات..."
                        leftSection={<IconSearch size="0.9rem" />}
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        mb="sm"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                      {loading.products ? (
                        <div className="p-4 text-center text-gray-500">
                          جاري تحميل المنتجات...
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          لا توجد منتجات
                        </div>
                      ) : (
                        filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                              form.values.target_product_id === product.id
                                ? "bg-blue-50"
                                : ""
                            }`}
                            onClick={() => {
                              form.setFieldValue(
                                "target_product_id",
                                product.id
                              );
                              form.setFieldValue(
                                "target_product_name",
                                product.name
                              );
                            }}
                          >
                            <Group gap="sm">
                              {product.image && (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  w={40}
                                  h={40}
                                  radius="sm"
                                />
                              )}
                              <div className="flex-1">
                                <Text size="sm" fw={500}>
                                  {product.name}
                                </Text>
                                <Group gap="xs">
                                  {product.sku && (
                                    <Badge size="xs" variant="light">
                                      SKU: {product.sku}
                                    </Badge>
                                  )}
                                  <Text size="xs" c="dimmed">
                                    {product.price} {product.currency}
                                  </Text>
                                </Group>
                              </div>
                              {form.values.target_product_id === product.id && (
                                <IconCheck
                                  size="1rem"
                                  className="text-blue-600"
                                />
                              )}
                            </Group>
                          </div>
                        ))
                      )}
                    </div>
                    {form.errors.target_product_id && (
                      <Text size="xs" c="red" mt="xs">
                        {form.errors.target_product_id}
                      </Text>
                    )}
                  </Grid.Col>
                </Grid>
              </Stack>
            )}

            {/* Step 2: Bundle Tiers Configuration */}
            {active === 1 && (
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={3} className="text-gray-700">
                    إعداد عروضالباقة
                  </Title>
                  <Button
                    leftSection={<IconPlus size="0.9rem" />}
                    variant="light"
                    onClick={addTier}
                    disabled={form.values.bundles.length >= 5}
                  >
                    إضافة عرض
                  </Button>
                </Group>

                {form.values.bundles.map((tier, tierIndex) => (
                  <Paper
                    key={tierIndex}
                    p="md"
                    withBorder
                    style={{ backgroundColor: tier.tier_bg_color || "#f8f9fa" }}
                    data-tour={tierIndex === 0 ? "free-items" : undefined}
                  >
                    <Group justify="space-between" mb="md">
                      <Group gap="sm">
                        <Title
                          order={4}
                          style={{ color: tier.tier_text_color || "#212529" }}
                        >
                          {tier.tier_title || `العرض ${tier.tier}`}
                        </Title>
                        {tier.tier_highlight_text && (
                          <Badge
                            size="lg"
                            style={{
                              backgroundColor:
                                tier.tier_highlight_bg_color || "#ffc107",
                              color:
                                tier.tier_highlight_text_color || "#000000",
                            }}
                          >
                            {tier.tier_highlight_text}
                          </Badge>
                        )}
                        {tier.is_default && (
                          <Badge
                            size="sm"
                            color="green"
                            leftSection={<IconStar size="0.8rem" />}
                          >
                            افتراضي
                          </Badge>
                        )}
                      </Group>
                      {form.values.bundles.length > 1 && (
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => removeTier(tierIndex)}
                        >
                          <IconTrash size="1rem" />
                        </ActionIcon>
                      )}
                    </Group>

                    <Grid>
                      <Grid.Col span={6}>
                        <TextInput
                          label="عنوان العرض"
                          placeholder="مثال: باقة البداية"
                          leftSection={<IconPackage size="0.9rem" />}
                          {...form.getInputProps(
                            `bundles.${tierIndex}.tier_title`
                          )}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <NumberInput
                          label="كمية الشراء المطلوبة"
                          placeholder="1"
                          min={1}
                          max={10}
                          {...form.getInputProps(
                            `bundles.${tierIndex}.buy_quantity`
                          )}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <TextInput
                          label="نص التميز (اختياري)"
                          placeholder="مثال: وفر أكثر، أفضل قيمة"
                          disabled={!features.advancedBundleStyling}
                          {...form.getInputProps(
                            `bundles.${tierIndex}.tier_highlight_text`
                          )}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Switch
                          label="جعل هذا العرض افتراضياً"
                          description="سيتم تحديد هذا العرض مسبقاً في الواجهة"
                          checked={tier.is_default}
                          onChange={(event) => {
                            // Uncheck all other tiers
                            const updatedBundles = form.values.bundles.map(
                              (b, idx) => ({
                                ...b,
                                is_default:
                                  idx === tierIndex
                                    ? event.currentTarget.checked
                                    : false,
                              })
                            );
                            form.setFieldValue("bundles", updatedBundles);
                          }}
                        />
                      </Grid.Col>
                    </Grid>

                    <Divider
                      my="md"
                      label={
                        <Group gap="xs">
                          <IconPalette size="1rem" /> ألوان العرض
                        </Group>
                      }
                      labelPosition="center"
                    />

                    {!features.advancedBundleStyling && (
                      <UpgradePrompt featureName="تخصيص ألوان العرض" compact />
                    )}

                    <Grid>
                      <Grid.Col span={6}>
                        <ColorInput
                          label="لون خلفية العرض"
                          description="لون الخلفية للبطاقة في الواجهة"
                          placeholder="اختر اللون"
                          format="hex"
                          disabled={!features.advancedBundleStyling}
                          {...form.getInputProps(
                            `bundles.${tierIndex}.tier_bg_color`
                          )}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <ColorInput
                          label="لون نص العرض"
                          description="لون النصوص داخل البطاقة"
                          placeholder="اختر اللون"
                          format="hex"
                          disabled={!features.advancedBundleStyling}
                          {...form.getInputProps(
                            `bundles.${tierIndex}.tier_text_color`
                          )}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <ColorInput
                          label="لون خلفية شارة التميز"
                          description="لون خلفية الشارة (مثل: أفضل قيمة)"
                          placeholder="اختر اللون"
                          format="hex"
                          disabled={!features.advancedBundleStyling}
                          {...form.getInputProps(
                            `bundles.${tierIndex}.tier_highlight_bg_color`
                          )}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <ColorInput
                          label="لون نص شارة التميز"
                          description="لون نص الشارة"
                          placeholder="اختر اللون"
                          format="hex"
                          disabled={!features.advancedBundleStyling}
                          {...form.getInputProps(
                            `bundles.${tierIndex}.tier_highlight_text_color`
                          )}
                        />
                      </Grid.Col>
                    </Grid>

                    <Divider my="md" />

                    <Group justify="space-between" mb="sm">
                      <Text fw={500}>منتجات الخصم او هدايا العرض</Text>
                      <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconPlus size="0.8rem" />}
                        onClick={() => addOffer(tierIndex)}
                      >
                        إضافة منتج
                      </Button>
                    </Group>

                    {tier.offers.map((offer, offerIndex) => (
                      <Card key={offerIndex} p="sm" withBorder mb="sm">
                        <Group justify="space-between" mb="sm">
                          <Text size="sm" fw={500}>
                            العرض {offerIndex + 1}
                          </Text>
                          {tier.offers.length > 1 && (
                            <ActionIcon
                              size="sm"
                              color="red"
                              variant="light"
                              onClick={() => removeOffer(tierIndex, offerIndex)}
                            >
                              <IconTrash size="0.8rem" />
                            </ActionIcon>
                          )}
                        </Group>

                        <Stack gap="sm">
                          <div>
                            <Text size="sm" fw={500} mb="xs">
                              اختيار المنتج (العرض)
                            </Text>
                            <TextInput
                              placeholder="البحث في المنتجات..."
                              leftSection={<IconSearch size="0.8rem" />}
                              value={offerSearch}
                              onChange={(e) => setOfferSearch(e.target.value)}
                              size="sm"
                              mb="xs"
                            />

                            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                              {filteredOfferProducts.map((product) => (
                                <div
                                  key={product.id}
                                  className={`p-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                                    offer.product_id === product.id
                                      ? "bg-green-50"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    form.setFieldValue(
                                      `bundles.${tierIndex}.offers.${offerIndex}.product_id`,
                                      product.id
                                    );
                                    form.setFieldValue(
                                      `bundles.${tierIndex}.offers.${offerIndex}.product_name`,
                                      product.name
                                    );
                                  }}
                                >
                                  <Group gap="xs">
                                    {product.image && (
                                      <Image
                                        src={product.image}
                                        alt={product.name}
                                        w={30}
                                        h={30}
                                        radius="sm"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <Text size="xs" fw={500}>
                                        {product.name}
                                      </Text>
                                      <Text size="xs" c="dimmed">
                                        {product.price} {product.currency}
                                      </Text>
                                    </div>
                                    {offer.product_id === product.id && (
                                      <IconCheck
                                        size="0.8rem"
                                        className="text-green-600"
                                      />
                                    )}
                                  </Group>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Grid>
                            <Grid.Col span={6}>
                              <Select
                                label="نوع العرض"
                                size="sm"
                                data={[
                                  { value: "free", label: "مجاني (100%)" },
                                  {
                                    value: "percentage",
                                    label: "خصم بالنسبة المئوية",
                                  },
                                  {
                                    value: "fixed_amount",
                                    label: "خصم بمبلغ ثابت (ريال)",
                                  },
                                ]}
                                {...form.getInputProps(
                                  `bundles.${tierIndex}.offers.${offerIndex}.discount_type`
                                )}
                              />
                            </Grid.Col>

                            {offer.discount_type !== "free" && (
                              <Grid.Col span={6}>
                                <NumberInput
                                  label={
                                    offer.discount_type === "percentage"
                                      ? "نسبة الخصم (%)"
                                      : "مبلغ الخصم (ريال)"
                                  }
                                  min={1}
                                  max={
                                    offer.discount_type === "percentage"
                                      ? 99
                                      : 1000
                                  }
                                  size="sm"
                                  {...form.getInputProps(
                                    `bundles.${tierIndex}.offers.${offerIndex}.discount_amount`
                                  )}
                                />
                              </Grid.Col>
                            )}

                            <Grid.Col span={6}>
                              <NumberInput
                                label="الكمية"
                                min={1}
                                max={5}
                                size="sm"
                                {...form.getInputProps(
                                  `bundles.${tierIndex}.offers.${offerIndex}.quantity`
                                )}
                              />
                            </Grid.Col>
                          </Grid>
                        </Stack>
                      </Card>
                    ))}
                  </Paper>
                ))}
              </Stack>
            )}

            {/* Step 3: Dates and Settings */}
            {active === 2 && (
              <Stack gap="md">
                <Title order={3} className="text-gray-700">
                  التواريخ والإعدادات
                </Title>

                <Grid>
                  <Grid.Col span={6}>
                    <DatePickerInput
                      label="تاريخ بدء الباقة"
                      placeholder="اختر التاريخ"
                      required
                      {...form.getInputProps("start_date")}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <DatePickerInput
                      label="تاريخ انتهاء الباقة (اختياري)"
                      placeholder="اختر التاريخ"
                      {...form.getInputProps("expiry_date")}
                    />
                  </Grid.Col>
                </Grid>

                <Divider
                  my="md"
                  label={
                    <Group gap="xs">
                      <IconPalette size="1rem" /> تخصيص واجهة العرض
                    </Group>
                  }
                  labelPosition="center"
                />

                {!features.advancedBundleStyling && (
                  <UpgradePrompt featureName="تخصيص تصميم الباقات" />
                )}

                <Grid data-tour="bundle-settings">
                  <Grid.Col span={12}>
                    <TextInput
                      label="عنوان النافذة المنبثقة"
                      placeholder="مثال: اختر باقتك المفضلة"
                      description="العنوان الذي سيظهر في أعلى نافذة اختيار الباقات"
                      disabled={!features.advancedBundleStyling}
                      {...form.getInputProps("modal_title")}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <TextInput
                      label="العنوان الفرعي للباقات (اختياري)"
                      placeholder="مثال: اختيارات أفضل قيمة — وفر أكثر"
                      description="نص توضيحي يظهر أسفل عنوان 'باقاتنا' (اتركه فارغاً لإخفائه)"
                      disabled={!features.advancedBundleStyling}
                      {...form.getInputProps("modal_subtitle")}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="نص زر الاختيار"
                      placeholder="مثال: اختر الباقة"
                      description="النص الذي سيظهر على زر الاختيار لكل باقة"
                      disabled={!features.advancedBundleStyling}
                      {...form.getInputProps("cta_button_text")}
                    />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <ColorInput
                      label="لون خلفية الزر"
                      description="لون الخلفية لزر الاختيار"
                      placeholder="اختر اللون"
                      format="hex"
                      disabled={!features.advancedBundleStyling}
                      {...form.getInputProps("cta_button_bg_color")}
                    />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <ColorInput
                      label="لون نص الزر"
                      description="لون النص داخل الزر"
                      placeholder="اختر اللون"
                      format="hex"
                      disabled={!features.advancedBundleStyling}
                      {...form.getInputProps("cta_button_text_color")}
                    />
                  </Grid.Col>
                </Grid>

                <Divider label="زر إتمام الطلب" labelPosition="center" />

                <Grid>
                  <Grid.Col span={12}>
                    <TextInput
                      label="نص زر إتمام الطلب"
                      placeholder="مثال: إتمام الطلب — {total_price}"
                      description="النص الذي سيظهر على الزر في الخطوة الأخيرة. يمكنك استخدام {total_price} لإظهار السعر الإجمالي"
                      disabled={!features.advancedBundleStyling}
                      {...form.getInputProps("checkout_button_text")}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <ColorInput
                      label="لون خلفية زر إتمام الطلب"
                      description="لون خلفية الزر"
                      placeholder="اختر اللون"
                      format="hex"
                      disabled={!features.advancedBundleStyling}
                      {...form.getInputProps("checkout_button_bg_color")}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <ColorInput
                      label="لون نص زر إتمام الطلب"
                      description="لون النص داخل الزر"
                      placeholder="اختر اللون"
                      format="hex"
                      disabled={!features.advancedBundleStyling}
                      {...form.getInputProps("checkout_button_text_color")}
                    />
                  </Grid.Col>
                </Grid>

                <Alert color="blue" variant="light">
                  <Text size="sm">
                    <strong>ملاحظة:</strong> ستحفظ الباقة كمسودة أولاً. يمكنك
                    تفعيلها لاحقاً من صفحة إدارة الباقات لإنشاء العروض الخاصة في
                    سلة.
                  </Text>
                </Alert>
              </Stack>
            )}

            {/* Step 4: Review and Save */}
            {active === 3 && (
              <Stack gap="md">
                <Title order={3} className="text-gray-700">
                  مراجعة نهائية
                </Title>

                <Paper p="md" withBorder>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text fw={500}>اسم الباقة:</Text>
                      <Text>{form.values.name}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text fw={500}>المنتج المستهدف:</Text>
                      <Text>{form.values.target_product_name}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text fw={500}>عدد العروض:</Text>
                      <Text>{form.values.bundles.length}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text fw={500}>تاريخ البدء:</Text>
                      <Text>
                        {form.values.start_date instanceof Date
                          ? form.values.start_date.toLocaleDateString("ar-SA")
                          : form.values.start_date
                          ? new Date(form.values.start_date).toLocaleDateString(
                              "ar-SA"
                            )
                          : "غير محدد"}
                      </Text>
                    </Group>
                    {form.values.expiry_date && (
                      <Group justify="space-between">
                        <Text fw={500}>تاريخ الانتهاء:</Text>
                        <Text>
                          {form.values.expiry_date instanceof Date
                            ? form.values.expiry_date.toLocaleDateString(
                                "ar-SA"
                              )
                            : form.values.expiry_date
                            ? new Date(
                                form.values.expiry_date
                              ).toLocaleDateString("ar-SA")
                            : "غير محدد"}
                        </Text>
                      </Group>
                    )}
                  </Stack>
                </Paper>

                {form.values.bundles.map((tier, index) => {
                  // Find target product from products list
                  const targetProduct = products.find(
                    (p) => p.id === form.values.target_product_id
                  );

                  return (
                    <Paper
                      key={index}
                      p="md"
                      withBorder
                      style={{
                        backgroundColor: tier.tier_bg_color || "#f8f9fa",
                      }}
                    >
                      <Group justify="space-between" mb="md">
                        <Group gap="sm">
                          <Title
                            order={5}
                            style={{ color: tier.tier_text_color || "#212529" }}
                          >
                            {tier.tier_title || `العرض ${tier.tier}`}
                          </Title>
                          {tier.tier_highlight_text && (
                            <Badge
                              style={{
                                backgroundColor:
                                  tier.tier_highlight_bg_color || "#ffc107",
                                color:
                                  tier.tier_highlight_text_color || "#000000",
                              }}
                            >
                              {tier.tier_highlight_text}
                            </Badge>
                          )}
                          {tier.is_default && (
                            <Badge color="green" size="sm">
                              افتراضي
                            </Badge>
                          )}
                        </Group>
                        <Text size="sm" c="dimmed">
                          اشترِ {tier.buy_quantity} واحصل على{" "}
                          {tier.offers.length} عرض
                        </Text>
                      </Group>

                      <Stack gap="md">
                        {/* Target Product */}
                        <div>
                          <Text
                            size="sm"
                            fw={600}
                            mb="xs"
                            style={{ color: tier.tier_text_color || "#212529" }}
                          >
                            المنتج المستهدف:
                          </Text>
                          <Card withBorder padding="sm">
                            <Group gap="sm">
                              {targetProduct?.image && (
                                <Image
                                  src={targetProduct.image}
                                  alt={targetProduct.name}
                                  w={50}
                                  h={50}
                                  radius="sm"
                                />
                              )}
                              <div style={{ flex: 1 }}>
                                <Text size="sm" fw={500}>
                                  {form.values.target_product_name}
                                </Text>
                                <Group gap="xs">
                                  <Text size="xs" c="dimmed">
                                    الكمية: {tier.buy_quantity}
                                  </Text>
                                  {targetProduct?.price && (
                                    <Text size="xs" fw={500}>
                                      {targetProduct.price}{" "}
                                      {targetProduct.currency || "SAR"}
                                    </Text>
                                  )}
                                </Group>
                              </div>
                            </Group>
                          </Card>
                        </div>

                        {/* Offers/Gifts */}
                        {tier.offers.length > 0 && (
                          <div>
                            <Text
                              size="sm"
                              fw={600}
                              mb="xs"
                              style={{
                                color: tier.tier_text_color || "#212529",
                              }}
                            >
                              منتجات الخصم او هدايا العرض ({tier.offers.length}
                              ):
                            </Text>
                            <Stack gap="xs">
                              {tier.offers.map((offer, offerIndex) => {
                                const offerProduct = products.find(
                                  (p) => p.id === offer.product_id
                                );
                                const discountLabel =
                                  offer.discount_type === "free"
                                    ? "مجاناً"
                                    : offer.discount_type === "percentage"
                                    ? `خصم ${offer.discount_amount}%`
                                    : `خصم ${offer.discount_amount} ريال`;

                                return (
                                  <Card
                                    key={offerIndex}
                                    withBorder
                                    padding="sm"
                                    bg="white"
                                  >
                                    <Group gap="sm">
                                      {offerProduct?.image && (
                                        <Image
                                          src={offerProduct.image}
                                          alt={offerProduct.name}
                                          w={40}
                                          h={40}
                                          radius="sm"
                                        />
                                      )}
                                      <div style={{ flex: 1 }}>
                                        <Group gap="xs">
                                          <Text size="sm" fw={500}>
                                            {offer.product_name}
                                          </Text>
                                          <Badge
                                            size="sm"
                                            color={
                                              offer.discount_type === "free"
                                                ? "green"
                                                : "blue"
                                            }
                                          >
                                            {discountLabel}
                                          </Badge>
                                        </Group>
                                        <Group gap="xs">
                                          <Text size="xs" c="dimmed">
                                            الكمية: {offer.quantity}
                                          </Text>
                                          {offerProduct?.price && (
                                            <>
                                              <Text size="xs" c="dimmed">
                                                •
                                              </Text>
                                              <Text size="xs" c="dimmed">
                                                السعر الأصلي:{" "}
                                                {offerProduct.price}{" "}
                                                {offerProduct.currency || "SAR"}
                                              </Text>
                                            </>
                                          )}
                                        </Group>
                                      </div>
                                    </Group>
                                  </Card>
                                );
                              })}
                            </Stack>
                          </div>
                        )}
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}

            {/* Navigation Buttons */}
            <Group justify="space-between" mt="xl">
              <Button
                variant="light"
                onClick={prevStep}
                disabled={active === 0}
              >
                <Group gap="xs">
                  <IconArrowRight size="1rem" />
                  <span>السابق</span>
                </Group>
              </Button>

              {active < 3 ? (
                <Button onClick={nextStep}>
                  <Group gap="xs">
                    <span>التالي</span>
                    <IconArrowLeft size="1rem" />
                  </Group>
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={loading.creating}
                  leftSection={<IconCheck size="1rem" />}
                  data-tour="save-bundle"
                >
                  حفظ الباقة
                </Button>
              )}
            </Group>
          </Card>
        </form>
      </Stack>
      <CreateBundleTour />
    </Container>
  );
}
