import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  LoadingOverlay,
  ColorInput,
  Switch,
  Rating,
  Modal,
  Loader,
  Avatar,
  Checkbox,
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
  IconEdit,
  IconPalette,
  IconStar,
  IconRefresh,
  IconUserCircle,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import useBundleStore from "../stores/useBundleStore";
import axios from "axios";

export default function EditBundlePage() {
  const navigate = useNavigate();
  const { bundleId } = useParams();
  const {
    updateBundle,
    getBundleDetails,
    fetchProducts,
    generateOffers,
    refetchProductReviews,
    updateProductReview,
    currentBundle,
    products,
    loading,
  } = useBundleStore();
  const [active, setActive] = useState(0);
  const [productSearch, setProductSearch] = useState("");
  const [offerSearch, setOfferSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isReactivating, setIsReactivating] = useState(false);
  const [isRefetchingReviews, setIsRefetchingReviews] = useState(false);
  const [productReviews, setProductReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedReviewData, setEditedReviewData] = useState({
    customerName: "",
    rating: 5,
    content: "",
  });
  const [savingReview, setSavingReview] = useState(false);
  const [showAddManualReview, setShowAddManualReview] = useState(false);
  const [newManualReview, setNewManualReview] = useState({
    customerName: "",
    customerAvatar: "",
    rating: 5,
    content: "",
    timeAgo: "قبل يومين",
  });

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
      cta_button_bg_color: "#0066ff",
      cta_button_text_color: "#ffffff",
      checkout_button_text: "إتمام الطلب — {total_price}",
      checkout_button_bg_color: "#0066ff",
      checkout_button_text_color: "#ffffff",
      selected_review_ids: [],
      review_limit: 20,
      review_fetch_limit: 20,
      manual_reviews: [],
      bundles: [
        {
          tier: 1,
          buy_quantity: 1,
          tier_title: "باقة البداية",
          tier_summary_text: "",
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
    const loadBundleData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([getBundleDetails(bundleId), fetchProducts()]);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        notifications.show({
          title: "خطأ في تحميل البيانات",
          message: error.message || "حدث خطأ أثناء تحميل بيانات الباقة",
          color: "red",
          icon: <IconX size="1rem" />,
        });
        navigate("/dashboard/bundles");
      } finally {
        setIsLoading(false);
      }
    };

    if (bundleId) {
      loadBundleData();
    }
  }, [bundleId, getBundleDetails, fetchProducts, navigate]);

  useEffect(() => {
    // Populate form when bundle data is loaded
    if (currentBundle && !isLoading) {
      // Create properly formatted bundles data
      const formattedBundles =
        currentBundle.bundles && currentBundle.bundles.length > 0
          ? currentBundle.bundles.map((bundle) => ({
              tier: bundle.tier,
              buy_quantity: bundle.buy_quantity,
              tier_title: bundle.tier_title || `العرض ${bundle.tier}`,
              tier_summary_text: bundle.tier_summary_text || "",
              tier_highlight_text: bundle.tier_highlight_text || "",
              tier_bg_color: bundle.tier_bg_color || "#f8f9fa",
              tier_text_color: bundle.tier_text_color || "#212529",
              tier_highlight_bg_color:
                bundle.tier_highlight_bg_color || "#ffc107",
              tier_highlight_text_color:
                bundle.tier_highlight_text_color || "#000000",
              is_default: bundle.is_default || false,
              offers:
                bundle.offers && bundle.offers.length > 0
                  ? bundle.offers.map((offer) => ({
                      product_id: offer.product_id || "",
                      product_name: offer.product_name || "",
                      quantity: offer.quantity || 1,
                      discount_type: offer.discount_type || "free",
                      discount_amount: offer.discount_amount || 100,
                      offer_type: offer.offer_type || "gift",
                      arabic_message: offer.arabic_message || "عرض خاص",
                    }))
                  : [
                      {
                        product_id: "",
                        product_name: "",
                        quantity: 1,
                        discount_type: "free",
                        discount_amount: 100,
                        offer_type: "gift",
                        arabic_message: "عرض خاص",
                      },
                    ],
            }))
          : [
              {
                tier: 1,
                buy_quantity: 1,
                tier_title: "باقة البداية",
                tier_summary_text: "",
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
            ];

      const formData = {
        name: currentBundle.name || "",
        description: currentBundle.description || "",
        target_product_id: currentBundle.target_product_id || "",
        target_product_name: currentBundle.target_product_name || "",
        start_date: currentBundle.start_date
          ? new Date(currentBundle.start_date)
          : new Date(),
        expiry_date: currentBundle.expiry_date
          ? new Date(currentBundle.expiry_date)
          : null,
        modal_title: currentBundle.modal_title || "اختر باقتك",
        modal_subtitle: currentBundle.modal_subtitle || "",
        cta_button_text: currentBundle.cta_button_text || "اختر الباقة",
        cta_button_bg_color: currentBundle.cta_button_bg_color || "#0066ff",
        cta_button_text_color: currentBundle.cta_button_text_color || "#ffffff",
        checkout_button_text:
          currentBundle.checkout_button_text || "إتمام الطلب — {total_price}",
        checkout_button_bg_color:
          currentBundle.checkout_button_bg_color || "#0066ff",
        checkout_button_text_color:
          currentBundle.checkout_button_text_color || "#ffffff",
        selected_review_ids: currentBundle.selected_review_ids || [],
        review_limit: currentBundle.review_limit || 20,
        review_fetch_limit: currentBundle.review_fetch_limit || 20,
        manual_reviews: currentBundle.manual_reviews || [],
        bundles: formattedBundles,
      };

      form.setValues(formData);
      form.resetDirty(formData);
    }
  }, [currentBundle, isLoading]);

  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (product.sku &&
          product.sku.toLowerCase().includes(productSearch.toLowerCase()))
    )
    .sort((a, b) => {
      // Sort selected product first
      const aSelected = form.values.target_product_id === String(a.id);
      const bSelected = form.values.target_product_id === String(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.name.localeCompare(b.name);
    });

  const filteredOfferProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(offerSearch.toLowerCase()) ||
      (product.sku &&
        product.sku.toLowerCase().includes(offerSearch.toLowerCase()))
  );

  // Function to get sorted offer products for a specific offer
  const getSortedOfferProducts = (selectedProductId) => {
    return filteredOfferProducts.sort((a, b) => {
      // Sort selected product first
      const aSelected = selectedProductId === String(a.id);
      const bSelected = selectedProductId === String(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.name.localeCompare(b.name);
    });
  };

  const addTier = () => {
    const tierNum = form.values.bundles.length + 1;
    const tierColors = [
      {
        bg: "#f8f9fa",
        text: "#212529",
        highlightBg: "#17a2b8",
        highlightText: "#ffffff",
      },
      {
        bg: "#e3f2fd",
        text: "#1565c0",
        highlightBg: "#1976d2",
        highlightText: "#ffffff",
      },
      {
        bg: "#f3e5f5",
        text: "#6a1b9a",
        highlightBg: "#7b1fa2",
        highlightText: "#ffffff",
      },
      {
        bg: "#fff3e0",
        text: "#e65100",
        highlightBg: "#f57c00",
        highlightText: "#ffffff",
      },
      {
        bg: "#e8f5e9",
        text: "#2e7d32",
        highlightBg: "#388e3c",
        highlightText: "#ffffff",
      },
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
      tier_summary_text: "",
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
        updated_by: "dashboard",
      };

      console.log("Submitting bundle data:", bundleData);
      console.log("Description:", bundleData.description);
      console.log("Bundles:", bundleData.bundles);

      await updateBundle(bundleId, bundleData);

      notifications.show({
        title: "تم تحديث الباقة بنجاح",
        message: `تم حفظ التعديلات على الباقة "${values.name}" بنجاح`,
        color: "green",
        icon: <IconCheck size="1rem" />,
      });

      navigate("/dashboard/bundles");
    } catch (error) {
      notifications.show({
        title: "خطأ في تحديث الباقة",
        message: error.message || "حدث خطأ أثناء تحديث الباقة",
        color: "red",
        icon: <IconX size="1rem" />,
      });
    }
  };

  const handleReactivate = async () => {
    try {
      setIsReactivating(true);

      const result = await generateOffers(bundleId);

      notifications.show({
        title: "تم إعادة تفعيل الباقة بنجاح",
        message: `تم إنشاء ${result.offers_created} عروض بنجاح`,
        color: "green",
        icon: <IconCheck size="1rem" />,
        autoClose: 5000,
      });

      // Refresh bundle details
      await getBundleDetails(bundleId);
    } catch (error) {
      notifications.show({
        title: "خطأ في إعادة التفعيل",
        message: error.message || "حدث خطأ أثناء إعادة تفعيل الباقة",
        color: "red",
        icon: <IconX size="1rem" />,
      });
    } finally {
      setIsReactivating(false);
    }
  };

  const handleRefetchReviews = async () => {
    try {
      setIsRefetchingReviews(true);

      const result = await refetchProductReviews(bundleId);

      notifications.show({
        title: "تم تحديث التقييمات بنجاح",
        message:
          result.message ||
          `تم تحديث ${result.data.reviews_count} تقييم للمنتج`,
        color: "green",
        icon: <IconCheck size="1rem" />,
        autoClose: 5000,
      });

      // Fetch reviews after successful update
      await fetchProductReviews();
    } catch (error) {
      notifications.show({
        title: "خطأ في تحديث التقييمات",
        message: error.message || "حدث خطأ أثناء تحديث التقييمات",
        color: "red",
        icon: <IconX size="1rem" />,
      });
    } finally {
      setIsRefetchingReviews(false);
    }
  };

  const fetchProductReviews = async () => {
    if (!currentBundle?.target_product_id) return;

    try {
      setLoadingReviews(true);
      const productId = currentBundle.target_product_id
        .toString()
        .replace(/^p/, "");

      const fetchLimit = form.values.review_fetch_limit || 20;
      const response = await axios.get(
        `/products/${productId}/reviews?limit=${fetchLimit}`
      );

      if (response.data.success) {
        const fetchedReviews = response.data.data || [];
        const manualReviews = form.values.manual_reviews || [];

        // Merge manual reviews (with isManual flag) with fetched reviews
        const allReviews = [
          ...manualReviews.map((r) => ({ ...r, isManual: true })),
          ...fetchedReviews,
        ];

        setProductReviews(allReviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Fetch reviews when bundle is loaded
  useEffect(() => {
    if (currentBundle && active === 3) {
      fetchProductReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBundle, active]);

  const nextStep = () => {
    if (active === 0) {
      const errors = form.validate();
      if (errors.hasErrors) return;
    }
    setActive((current) => (current < 3 ? current + 1 : current));
  };

  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  // Show loading while fetching bundle data
  if (isLoading) {
    return (
      <Container size="xl">
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <LoadingOverlay visible={true} />
          <div style={{ height: "400px" }}>
            <Text ta="center" c="dimmed">
              جاري تحميل بيانات الباقة...
            </Text>
          </div>
        </Card>
      </Container>
    );
  }

  // Show error if bundle not found
  if (!isLoading && !currentBundle) {
    return (
      <Container size="xl">
        <Alert color="red" title="خطأ">
          الباقة المطلوبة غير موجودة أو لا يمكن الوصول إليها
        </Alert>
      </Container>
    );
  }

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
            تعديل الباقة: {currentBundle?.name || form.values.name || "..."}
          </Title>
          <Text className="text-gray-600">
            قم بتعديل إعدادات الباقة والهدايا المجانية لتحسين الأداء
          </Text>
          {currentBundle && (
            <Text size="sm" c="dimmed">
              المنتج المستهدف:{" "}
              {currentBundle.target_product_name ||
                currentBundle.target_product_id}
              | العروض: {currentBundle.bundles?.length || 0}
            </Text>
          )}
        </div>

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
                description="مراجعة نهائية وحفظ التعديلات"
                icon={<IconEdit size="1.1rem" />}
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
                    <Text size="sm" fw={500} mb="xs">
                      المنتج المستهدف <span className="text-red-500">*</span>
                    </Text>

                    {!form.values.target_product_id ? (
                      <>
                        <TextInput
                          placeholder="البحث في المنتجات..."
                          leftSection={<IconSearch size="0.9rem" />}
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          mb="sm"
                        />

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
                                className="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                                onClick={() => {
                                  form.setFieldValue(
                                    "target_product_id",
                                    String(product.id)
                                  );
                                  form.setFieldValue(
                                    "target_product_name",
                                    product.name
                                  );
                                  setProductSearch("");
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
                                        {product.price}{" "}
                                        {product.currency || "SAR"}
                                      </Text>
                                    </Group>
                                  </div>
                                </Group>
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    ) : (
                      <Paper
                        p="md"
                        withBorder
                        className="bg-blue-50 border-blue-200"
                      >
                        <Group justify="space-between">
                          <Group gap="sm">
                            {products.find(
                              (p) =>
                                String(p.id) === form.values.target_product_id
                            )?.image && (
                              <Image
                                src={
                                  products.find(
                                    (p) =>
                                      String(p.id) ===
                                      form.values.target_product_id
                                  )?.image
                                }
                                alt={form.values.target_product_name}
                                w={45}
                                h={45}
                                radius="sm"
                              />
                            )}
                            <div>
                              <Text size="sm" fw={500}>
                                {form.values.target_product_name}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {
                                  products.find(
                                    (p) =>
                                      String(p.id) ===
                                      form.values.target_product_id
                                  )?.price
                                }{" "}
                                {products.find(
                                  (p) =>
                                    String(p.id) ===
                                    form.values.target_product_id
                                )?.currency || "SAR"}
                              </Text>
                            </div>
                          </Group>
                          <ActionIcon
                            color="red"
                            variant="light"
                            onClick={() => {
                              form.setFieldValue("target_product_id", "");
                              form.setFieldValue("target_product_name", "");
                            }}
                          >
                            <IconX size="1rem" />
                          </ActionIcon>
                        </Group>
                      </Paper>
                    )}

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
                      <Grid.Col span={12}>
                        <Textarea
                          label="وصف العرض (اختياري)"
                          placeholder="مثال: زجاجة × 2 — حقيبة 1000مل مجاناً — كتاب مجاناً"
                          description="يظهر في نسخة الجوال . إذا تركته فارغاً سيتم إنشاء وصف تلقائي"
                          autosize
                          minRows={2}
                          maxRows={3}
                          {...form.getInputProps(
                            `bundles.${tierIndex}.tier_summary_text`
                          )}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <TextInput
                          label="نص التميز (اختياري)"
                          placeholder="مثال: وفر أكثر، أفضل قيمة"
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

                    <Grid>
                      <Grid.Col span={6}>
                        <ColorInput
                          label="لون خلفية العرض"
                          description="لون الخلفية للبطاقة في الواجهة"
                          placeholder="اختر اللون"
                          format="hex"
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

                            {!offer.product_id ? (
                              <>
                                <TextInput
                                  placeholder="البحث في المنتجات..."
                                  leftSection={<IconSearch size="0.8rem" />}
                                  value={offerSearch}
                                  onChange={(e) =>
                                    setOfferSearch(e.target.value)
                                  }
                                  size="sm"
                                  mb="xs"
                                />

                                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                                  {getSortedOfferProducts(offer.product_id).map(
                                    (product) => (
                                      <div
                                        key={product.id}
                                        className="p-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                                        onClick={() => {
                                          form.setFieldValue(
                                            `bundles.${tierIndex}.offers.${offerIndex}.product_id`,
                                            String(product.id)
                                          );
                                          form.setFieldValue(
                                            `bundles.${tierIndex}.offers.${offerIndex}.product_name`,
                                            product.name
                                          );
                                          setOfferSearch("");
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
                                              {product.price}{" "}
                                              {product.currency || "SAR"}
                                            </Text>
                                          </div>
                                        </Group>
                                      </div>
                                    )
                                  )}
                                </div>
                              </>
                            ) : (
                              <Paper
                                p="sm"
                                withBorder
                                className="bg-green-50 border-green-200"
                              >
                                <Group justify="space-between">
                                  <Group gap="xs">
                                    {products.find(
                                      (p) => String(p.id) === offer.product_id
                                    )?.image && (
                                      <Image
                                        src={
                                          products.find(
                                            (p) =>
                                              String(p.id) === offer.product_id
                                          )?.image
                                        }
                                        alt={offer.product_name}
                                        w={35}
                                        h={35}
                                        radius="sm"
                                      />
                                    )}
                                    <div>
                                      <Text size="sm" fw={500}>
                                        {offer.product_name}
                                      </Text>
                                      <Text size="xs" c="dimmed">
                                        {
                                          products.find(
                                            (p) =>
                                              String(p.id) === offer.product_id
                                          )?.price
                                        }{" "}
                                        {products.find(
                                          (p) =>
                                            String(p.id) === offer.product_id
                                        )?.currency || "SAR"}
                                      </Text>
                                    </div>
                                  </Group>
                                  <ActionIcon
                                    color="red"
                                    variant="light"
                                    size="sm"
                                    onClick={() => {
                                      form.setFieldValue(
                                        `bundles.${tierIndex}.offers.${offerIndex}.product_id`,
                                        ""
                                      );
                                      form.setFieldValue(
                                        `bundles.${tierIndex}.offers.${offerIndex}.product_name`,
                                        ""
                                      );
                                    }}
                                  >
                                    <IconX size="0.9rem" />
                                  </ActionIcon>
                                </Group>
                              </Paper>
                            )}
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

                <Grid>
                  <Grid.Col span={12}>
                    <TextInput
                      label="عنوان النافذة المنبثقة"
                      placeholder="مثال: اختر باقتك المفضلة"
                      description="العنوان الذي سيظهر في أعلى نافذة اختيار الباقات"
                      {...form.getInputProps("modal_title")}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <TextInput
                      label="العنوان الفرعي للباقات (اختياري)"
                      placeholder="مثال: اختيارات أفضل قيمة — وفر أكثر"
                      description="نص توضيحي يظهر أسفل عنوان 'باقاتنا' (اتركه فارغاً لإخفائه)"
                      {...form.getInputProps("modal_subtitle")}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="نص زر الاختيار"
                      placeholder="مثال: اختر الباقة"
                      description="النص الذي سيظهر على زر الاختيار لكل باقة"
                      {...form.getInputProps("cta_button_text")}
                    />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <ColorInput
                      label="لون خلفية الزر"
                      description="لون الخلفية لزر الاختيار"
                      placeholder="اختر اللون"
                      format="hex"
                      {...form.getInputProps("cta_button_bg_color")}
                    />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <ColorInput
                      label="لون نص الزر"
                      description="لون النص داخل الزر"
                      placeholder="اختر اللون"
                      format="hex"
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
                      {...form.getInputProps("checkout_button_text")}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <ColorInput
                      label="لون خلفية زر إتمام الطلب"
                      description="لون خلفية الزر"
                      placeholder="اختر اللون"
                      format="hex"
                      {...form.getInputProps("checkout_button_bg_color")}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <ColorInput
                      label="لون نص زر إتمام الطلب"
                      description="لون النص داخل الزر"
                      placeholder="اختر اللون"
                      format="hex"
                      {...form.getInputProps("checkout_button_text_color")}
                    />
                  </Grid.Col>
                </Grid>

                {currentBundle.status === "active" && (
                  <Alert color="blue" variant="light">
                    <Text size="sm">
                      الباقة نشطة حالياً. ستحتاج لإعادة تفعيل الباقة من صفحة
                      إدارة الباقات لتطبيق التعديلات على العروض في سلة.
                    </Text>
                  </Alert>
                )}
              </Stack>
            )}

            {/* Step 4: Review and Save */}
            {active === 3 && (
              <Stack gap="md">
                <Title order={3} className="text-gray-700">
                  مراجعة التعديلات
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
                    <Group justify="space-between">
                      <Text fw={500}>الحالة الحالية:</Text>
                      <Badge
                        color={
                          currentBundle.status === "active"
                            ? "green"
                            : currentBundle.status === "draft"
                            ? "blue"
                            : "gray"
                        }
                      >
                        {currentBundle.status === "active"
                          ? "نشطة"
                          : currentBundle.status === "draft"
                          ? "مسودة"
                          : "غير نشطة"}
                      </Badge>
                    </Group>
                  </Stack>
                </Paper>

                {form.values.bundles.map((tier, index) => {
                  // Find target product from products list
                  const targetProduct = products.find(
                    (p) =>
                      String(p.id) === String(form.values.target_product_id)
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
                                  (p) =>
                                    String(p.id) === String(offer.product_id)
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

            {/* Product Reviews Section - Show in Step 4 */}
            {active === 3 && productReviews.length > 0 && (
              <Paper p="md" withBorder mt="xl">
                <Group justify="space-between" mb="md">
                  <Group gap="xs">
                    <IconStar size="1.2rem" style={{ color: "#fbbf24" }} />
                    <Title order={4}>
                      تقييمات المنتج ({productReviews.length})
                    </Title>
                  </Group>
                  <Group gap="sm">
                    <Button
                      size="xs"
                      variant={
                        form.values.selected_review_ids.length === 0
                          ? "filled"
                          : "light"
                      }
                      onClick={() => {
                        form.setFieldValue("selected_review_ids", []);
                      }}
                    >
                      عرض الكل
                    </Button>
                    <Button
                      size="xs"
                      variant={
                        form.values.selected_review_ids.length > 0
                          ? "filled"
                          : "light"
                      }
                      onClick={() => {
                        const allIds = productReviews.map((r) => r.id);
                        form.setFieldValue("selected_review_ids", allIds);
                      }}
                    >
                      تحديد الكل
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={fetchProductReviews}
                      loading={loadingReviews}
                      leftSection={<IconRefresh size="0.9rem" />}
                    >
                      تحديث
                    </Button>
                  </Group>
                </Group>

                <Group mb="md" gap="md" align="flex-start">
                  <NumberInput
                    label="حد الجلب"
                    description="عدد التقييمات المجلوبة من سلة"
                    value={form.values.review_fetch_limit}
                    onChange={(value) =>
                      form.setFieldValue("review_fetch_limit", value)
                    }
                    min={1}
                    max={100}
                    style={{ width: 200 }}
                    leftSection={<IconRefresh size="1rem" />}
                  />
                  <NumberInput
                    label="حد العرض"
                    description="عدد التقييمات المعروضة في المودال"
                    value={form.values.review_limit}
                    onChange={(value) =>
                      form.setFieldValue("review_limit", value)
                    }
                    min={1}
                    max={100}
                    style={{ width: 200 }}
                    leftSection={<IconStar size="1rem" />}
                  />
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={600} mb={4}>
                      الملخص
                    </Text>
                    <Text size="xs" c="dimmed">
                      {form.values.manual_reviews.length} يدوي •{" "}
                      {productReviews.filter((r) => !r.isManual).length} من سلة
                    </Text>
                    <Text size="xs" c="dimmed">
                      {form.values.selected_review_ids.length === 0
                        ? `سيتم عرض آخر ${form.values.review_limit} تقييم`
                        : `${Math.min(
                            form.values.selected_review_ids.length,
                            form.values.review_limit
                          )} تقييم محدد`}
                    </Text>
                  </div>
                </Group>

                <Button
                  leftSection={<IconPlus size="1rem" />}
                  variant="light"
                  size="sm"
                  mb="md"
                  onClick={() => setShowAddManualReview(!showAddManualReview)}
                >
                  {showAddManualReview ? "إلغاء" : "إضافة تقييم يدوي"}
                </Button>

                {showAddManualReview && (
                  <Paper p="md" withBorder mb="md" bg="blue.0">
                    <Stack gap="sm">
                      <Text size="sm" fw={600}>
                        تقييم يدوي جديد (محفوظ منفصل)
                      </Text>
                      <TextInput
                        label="اسم العميل"
                        value={newManualReview.customerName}
                        onChange={(e) =>
                          setNewManualReview({
                            ...newManualReview,
                            customerName: e.target.value,
                          })
                        }
                        required
                      />
                      <Group grow>
                        <TextInput
                          label="التاريخ النسبي"
                          value={newManualReview.timeAgo}
                          onChange={(e) =>
                            setNewManualReview({
                              ...newManualReview,
                              timeAgo: e.target.value,
                            })
                          }
                          placeholder="قبل يومين"
                        />
                        <div>
                          <Text size="sm" mb={4}>
                            التقييم
                          </Text>
                          <Rating
                            value={newManualReview.rating}
                            onChange={(value) =>
                              setNewManualReview({
                                ...newManualReview,
                                rating: value,
                              })
                            }
                          />
                        </div>
                      </Group>
                      <Textarea
                        label="المحتوى"
                        value={newManualReview.content}
                        onChange={(e) =>
                          setNewManualReview({
                            ...newManualReview,
                            content: e.target.value,
                          })
                        }
                        minRows={3}
                        required
                      />
                      <Button
                        onClick={() => {
                          if (
                            !newManualReview.customerName ||
                            !newManualReview.content
                          ) {
                            notifications.show({
                              title: "خطأ",
                              message: "الرجاء ملء جميع الحقول",
                              color: "red",
                            });
                            return;
                          }

                          const manualReview = {
                            id: Date.now(), // Unique ID
                            ...newManualReview,
                            customerAvatar:
                              newManualReview.customerAvatar ||
                              "https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png",
                            createdAt: new Date().toISOString(),
                            isManual: true,
                          };

                          form.setFieldValue("manual_reviews", [
                            ...form.values.manual_reviews,
                            manualReview,
                          ]);

                          setProductReviews([manualReview, ...productReviews]);

                          setNewManualReview({
                            customerName: "",
                            customerAvatar: "",
                            rating: 5,
                            content: "",
                            timeAgo: "قبل يومين",
                          });

                          setShowAddManualReview(false);

                          notifications.show({
                            title: "تم الإضافة",
                            message: "تم إضافة التقييم اليدوي بنجاح",
                            color: "green",
                          });
                        }}
                        fullWidth
                      >
                        إضافة التقييم
                      </Button>
                    </Stack>
                  </Paper>
                )}

                <Text size="sm" c="dimmed" mb="md">
                  {form.values.selected_review_ids.length === 0
                    ? "يتم عرض جميع التقييمات (مرتبة حسب الأحدث)"
                    : "اضغط على التقييمات لتحديدها/إلغاء تحديدها"}
                </Text>

                <Grid>
                  {productReviews.map((review, index) => (
                    <Grid.Col
                      key={review.id || index}
                      span={{ base: 12, md: 6 }}
                    >
                      <Card
                        withBorder
                        padding="md"
                        style={{
                          background:
                            form.values.selected_review_ids.length > 0 &&
                            form.values.selected_review_ids.includes(review.id)
                              ? "linear-gradient(135deg, #e7f5ff 0%, #d0ebff 100%)"
                              : "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
                          transition: "all 0.2s",
                          cursor: "pointer",
                          border:
                            form.values.selected_review_ids.length > 0 &&
                            form.values.selected_review_ids.includes(review.id)
                              ? "2px solid #228be6"
                              : undefined,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0,0,0,0.12)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "";
                          e.currentTarget.style.boxShadow = "";
                        }}
                        onClick={() => {
                          const currentIds = form.values.selected_review_ids;
                          if (currentIds.length === 0) {
                            // If in "show all" mode, switch to selection mode
                            form.setFieldValue("selected_review_ids", [
                              review.id,
                            ]);
                          } else if (currentIds.includes(review.id)) {
                            // Remove from selection
                            form.setFieldValue(
                              "selected_review_ids",
                              currentIds.filter((id) => id !== review.id)
                            );
                          } else {
                            // Add to selection
                            form.setFieldValue("selected_review_ids", [
                              ...currentIds,
                              review.id,
                            ]);
                          }
                        }}
                      >
                        <Stack gap="xs">
                          <Group justify="space-between" wrap="nowrap">
                            <Group gap="xs">
                              {form.values.selected_review_ids.length > 0 && (
                                <Checkbox
                                  checked={form.values.selected_review_ids.includes(
                                    review.id
                                  )}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                />
                              )}
                              {review.customerAvatar ? (
                                <Avatar
                                  src={review.customerAvatar}
                                  size="md"
                                  radius="xl"
                                />
                              ) : (
                                <Avatar size="md" radius="xl">
                                  <IconUserCircle size="1.5rem" />
                                </Avatar>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <Text size="sm" fw={600} truncate>
                                  {review.customerName || "عميل"}
                                </Text>
                                <Rating
                                  value={review.rating || 5}
                                  size="xs"
                                  readOnly
                                />
                              </div>
                            </Group>
                            <Group gap="xs">
                              {review.isManual && (
                                <Badge size="xs" color="blue" variant="light">
                                  يدوي
                                </Badge>
                              )}
                              {review.isManual ? (
                                <ActionIcon
                                  size="sm"
                                  variant="light"
                                  color="red"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const updatedManual =
                                      form.values.manual_reviews.filter(
                                        (r) => r.id !== review.id
                                      );
                                    form.setFieldValue(
                                      "manual_reviews",
                                      updatedManual
                                    );
                                    setProductReviews(
                                      productReviews.filter(
                                        (r) => r.id !== review.id
                                      )
                                    );
                                    notifications.show({
                                      title: "تم الحذف",
                                      message: "تم حذف التقييم اليدوي",
                                      color: "orange",
                                    });
                                  }}
                                >
                                  <IconTrash size="0.9rem" />
                                </ActionIcon>
                              ) : (
                                <ActionIcon
                                  size="sm"
                                  variant="light"
                                  color="blue"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingReview(review);
                                  }}
                                >
                                  <IconEdit size="0.9rem" />
                                </ActionIcon>
                              )}
                            </Group>
                          </Group>

                          <Text
                            size="sm"
                            c="dimmed"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              lineHeight: 1.5,
                            }}
                          >
                            {review.content || "لا يوجد محتوى"}
                          </Text>

                          {review.timeAgo && (
                            <Text size="xs" c="dimmed">
                              {review.timeAgo}
                            </Text>
                          )}
                        </Stack>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              </Paper>
            )}

            {loadingReviews && active === 3 && (
              <Paper p="xl" withBorder mt="xl">
                <Group justify="center">
                  <Loader size="sm" />
                  <Text size="sm" c="dimmed">
                    جاري تحميل التقييمات...
                  </Text>
                </Group>
              </Paper>
            )}

            {/* Edit Review Modal */}
            <Modal
              opened={editingReview !== null}
              onClose={() => {
                setEditingReview(null);
                setIsEditMode(false);
              }}
              title={
                <Group gap="xs">
                  <IconStar style={{ color: "#fbbf24" }} />
                  <Text fw={600}>
                    {isEditMode ? "تحرير التقييم" : "عرض التقييم"}
                  </Text>
                </Group>
              }
              size="lg"
            >
              {editingReview && (
                <Stack gap="md">
                  {!isEditMode ? (
                    <>
                      <Group gap="xs">
                        {editingReview.customerAvatar ? (
                          <Avatar
                            src={editingReview.customerAvatar}
                            size="lg"
                            radius="xl"
                          />
                        ) : (
                          <Avatar size="lg" radius="xl">
                            <IconUserCircle size="2rem" />
                          </Avatar>
                        )}
                        <div>
                          <Text fw={600}>
                            {editingReview.customerName || "عميل"}
                          </Text>
                          <Rating value={editingReview.rating || 5} readOnly />
                        </div>
                      </Group>

                      <Divider />

                      <div>
                        <Text size="sm" fw={500} mb="xs">
                          محتوى التقييم:
                        </Text>
                        <Paper p="md" withBorder bg="gray.0">
                          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                            {editingReview.content || "لا يوجد محتوى"}
                          </Text>
                        </Paper>
                      </div>

                      {editingReview.timeAgo && (
                        <Group gap="xs">
                          <Text size="sm" fw={500}>
                            التاريخ:
                          </Text>
                          <Text size="sm" c="dimmed">
                            {editingReview.timeAgo}
                          </Text>
                        </Group>
                      )}

                      <Alert color="blue" icon={<IconStar />}>
                        هذه التقييمات مخزنة في قاعدة البيانات ويتم عرضها في
                        نافذة الباقة. يمكنك تعديل اسم العميل، التقييم، أو
                        المحتوى.
                      </Alert>

                      <Group justify="apart">
                        <Button
                          variant="light"
                          onClick={() => {
                            setIsEditMode(true);
                            setEditedReviewData({
                              customerName: editingReview.customerName || "",
                              rating: editingReview.rating || 5,
                              content: editingReview.content || "",
                            });
                          }}
                          leftSection={<IconEdit size="1rem" />}
                        >
                          تعديل
                        </Button>
                        <Button
                          onClick={() => setEditingReview(null)}
                          leftSection={<IconCheck size="1rem" />}
                        >
                          إغلاق
                        </Button>
                      </Group>
                    </>
                  ) : (
                    <>
                      <TextInput
                        label="اسم العميل"
                        placeholder="اسم العميل"
                        value={editedReviewData.customerName}
                        onChange={(e) =>
                          setEditedReviewData({
                            ...editedReviewData,
                            customerName: e.target.value,
                          })
                        }
                        dir="rtl"
                        style={{ textAlign: "right" }}
                      />

                      <div>
                        <Text size="sm" fw={500} mb="xs">
                          التقييم
                        </Text>
                        <Rating
                          value={editedReviewData.rating}
                          onChange={(value) =>
                            setEditedReviewData({
                              ...editedReviewData,
                              rating: value,
                            })
                          }
                        />
                      </div>

                      <Textarea
                        label="محتوى التقييم"
                        placeholder="اكتب محتوى التقييم..."
                        value={editedReviewData.content}
                        onChange={(e) =>
                          setEditedReviewData({
                            ...editedReviewData,
                            content: e.target.value,
                          })
                        }
                        autosize
                        minRows={4}
                        maxRows={8}
                        dir="rtl"
                        style={{ textAlign: "right" }}
                      />

                      <Group justify="apart">
                        <Button
                          variant="light"
                          onClick={() => setIsEditMode(false)}
                        >
                          إلغاء
                        </Button>
                        <Button
                          loading={savingReview}
                          onClick={async () => {
                            try {
                              setSavingReview(true);
                              const result = await updateProductReview(
                                form.values.target_product_id,
                                editingReview.id,
                                editedReviewData
                              );

                              if (result.success) {
                                // Update local state
                                setProductReviews((prev) =>
                                  prev.map((r) =>
                                    r.id === editingReview.id
                                      ? {
                                          ...r,
                                          ...editedReviewData,
                                        }
                                      : r
                                  )
                                );

                                notifications.show({
                                  title: "تم التحديث بنجاح",
                                  message: "تم تحديث التقييم بنجاح",
                                  color: "green",
                                });

                                setEditingReview(null);
                                setIsEditMode(false);
                              } else {
                                notifications.show({
                                  title: "خطأ في التحديث",
                                  message:
                                    result.message ||
                                    "حدث خطأ أثناء تحديث التقييم",
                                  color: "red",
                                });
                              }
                            } catch (error) {
                              notifications.show({
                                title: "خطأ في التحديث",
                                message:
                                  error.message ||
                                  "حدث خطأ أثناء تحديث التقييم",
                                color: "red",
                              });
                            } finally {
                              setSavingReview(false);
                            }
                          }}
                          leftSection={<IconCheck size="1rem" />}
                        >
                          حفظ التعديلات
                        </Button>
                      </Group>
                    </>
                  )}
                </Stack>
              )}
            </Modal>

            {/* Navigation Buttons */}
            <Group justify="space-between" mt="xl">
              <Button
                type="button"
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
                <Button type="button" onClick={nextStep}>
                  <Group gap="xs">
                    <span>التالي</span>
                    <IconArrowLeft size="1rem" />
                  </Group>
                </Button>
              ) : (
                <Group gap="sm">
                  {currentBundle && currentBundle.status === "inactive" && (
                    <Button
                      type="button"
                      variant="light"
                      color="green"
                      onClick={handleReactivate}
                      loading={isReactivating}
                      leftSection={<IconRefresh size="1rem" />}
                    >
                      إعادة تفعيل العروض
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="light"
                    color="blue"
                    onClick={handleRefetchReviews}
                    loading={isRefetchingReviews}
                    leftSection={<IconStar size="1rem" />}
                  >
                    تحديث تقييمات المنتج
                  </Button>
                  <Button
                    type="submit"
                    loading={loading.updating}
                    leftSection={<IconEdit size="1rem" />}
                  >
                    حفظ التعديلات
                  </Button>
                </Group>
              )}
            </Group>
          </Card>
        </form>
      </Stack>
    </Container>
  );
}
