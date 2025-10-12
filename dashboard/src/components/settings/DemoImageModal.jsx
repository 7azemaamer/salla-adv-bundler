import { Modal, Stack, Text, Image, Alert } from "@mantine/core";

/**
 * Reusable demo image modal component
 */
export default function DemoImageModal({
  opened,
  onClose,
  title,
  description,
  imageSrc,
  imageAlt,
  warningText,
}) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} size="lg" centered>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {description}
        </Text>
        <Image src={imageSrc} alt={imageAlt} radius="md" fit="contain" />
        <Alert color="yellow" variant="light">
          <Text size="xs">{warningText}</Text>
        </Alert>
      </Stack>
    </Modal>
  );
}
