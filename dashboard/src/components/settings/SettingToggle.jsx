import { Switch, Text, Group, Button, Alert, Divider } from "@mantine/core";
import { IconPhoto, IconInfoCircle } from "@tabler/icons-react";

/**
 * Reusable setting toggle component with optional demo button and info alert
 */
export default function SettingToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
  onShowDemo,
  infoText,
  withDivider = true,
}) {
  return (
    <div>
      <Switch
        size="md"
        label={
          <div>
            <Text fw={500} size="sm">
              {label}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              {description}
            </Text>
          </div>
        }
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />

      {onShowDemo && (
        <Group mt="md">
          <Button
            variant="light"
            size="xs"
            leftSection={<IconPhoto size="0.9rem" />}
            onClick={onShowDemo}
          >
            عرض مثال توضيحي
          </Button>
        </Group>
      )}

      {infoText && (
        <Alert
          icon={<IconInfoCircle size="1rem" />}
          color="blue"
          variant="light"
          mt="md"
        >
          <Text size="sm">
            <strong>ملاحظة:</strong> {infoText}
          </Text>
        </Alert>
      )}

      {withDivider && <Divider mt="md" />}
    </div>
  );
}
