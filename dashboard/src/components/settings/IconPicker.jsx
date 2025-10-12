import { useState } from "react";
import { Stack, Button, Group, Text, Tooltip } from "@mantine/core";
import {
  IconTruckDelivery,
  IconPackage,
  IconGift,
  IconDiscount,
  IconRocket,
  IconCheck,
} from "@tabler/icons-react";

const SHIPPING_ICONS = [
  {
    id: "truck",
    icon: IconTruckDelivery,
    label: "شاحنة توصيل",
    svgPath:
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg>',
  },
  {
    id: "package",
    icon: IconPackage,
    label: "طرد",
    svgPath:
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>',
  },
  {
    id: "gift",
    icon: IconGift,
    label: "هدية",
    svgPath:
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"></rect><rect x="3" y="12" width="18" height="9" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>',
  },
  {
    id: "rocket",
    icon: IconRocket,
    label: "صاروخ (توصيل سريع)",
    svgPath:
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>',
  },
  {
    id: "discount",
    icon: IconDiscount,
    label: "خصم",
    svgPath:
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="15" x2="15" y2="9"></line><circle cx="9.5" cy="9.5" r=".5" fill="currentColor"></circle><circle cx="14.5" cy="14.5" r=".5" fill="currentColor"></circle><circle cx="12" cy="12" r="10"></circle></svg>',
  },
  {
    id: "check",
    icon: IconCheck,
    label: "علامة صح",
    svgPath:
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>',
  },
];

/**
 * Icon picker component for selecting shipping icons
 */
export default function IconPicker({ value, onChange, label, description }) {
  const [selectedIcon, setSelectedIcon] = useState(
    value || SHIPPING_ICONS[0].svgPath
  );

  const handleIconSelect = (iconData) => {
    setSelectedIcon(iconData.svgPath);
    onChange?.(iconData.svgPath);
  };

  // Find currently selected icon
  const currentIcon = SHIPPING_ICONS.find((i) => i.svgPath === selectedIcon);

  return (
    <Stack gap="xs">
      {label && (
        <Text size="sm" fw={500}>
          {label}
        </Text>
      )}
      {description && (
        <Text size="xs" c="dimmed">
          {description}
        </Text>
      )}

      <Group gap="xs">
        {SHIPPING_ICONS.map((iconData) => {
          const IconComponent = iconData.icon;
          const isSelected = iconData.svgPath === selectedIcon;

          return (
            <Tooltip key={iconData.id} label={iconData.label} withArrow>
              <Button
                variant={isSelected ? "filled" : "light"}
                color={isSelected ? "blue" : "gray"}
                size="md"
                onClick={() => handleIconSelect(iconData)}
                style={{
                  padding: "8px 12px",
                  height: "auto",
                }}
              >
                <IconComponent size={20} stroke={1.5} />
              </Button>
            </Tooltip>
          );
        })}
      </Group>

      {/* Preview */}
      {currentIcon && (
        <div
          style={{
            marginTop: "8px",
            padding: "12px",
            border: "1px solid var(--mantine-color-gray-3)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "var(--mantine-color-gray-0)",
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: currentIcon.svgPath }} />
          <Text size="sm" c="dimmed">
            معاينة: {currentIcon.label}
          </Text>
        </div>
      )}
    </Stack>
  );
}
