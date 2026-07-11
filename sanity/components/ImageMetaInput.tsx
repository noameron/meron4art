import { useEffect, useState } from 'react';
import { Stack, Text } from '@sanity/ui';
import { useClient, type ObjectInputProps } from 'sanity';
import { apiVersion } from '../env';

interface AssetMeta {
  width?: number;
  height?: number;
  size?: number;
}

// 900 -> "900 B", 245760 -> "240.0 KB", 3407872 -> "3.3 MB"
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return unit === 0 ? `${value} B` : `${value.toFixed(1)} ${units[unit]}`;
}

// Wraps the default image input and shows the uploaded asset's pixel
// dimensions and file size right below it. Both values are stored on the
// asset document by Sanity at upload time (metadata.dimensions, size), so
// this only reads them back; nothing is computed from the binary here.
export function ImageMetaInput(props: ObjectInputProps) {
  const client = useClient({ apiVersion });
  const assetRef = (props.value as { asset?: { _ref?: string } } | undefined)
    ?.asset?._ref;
  const [meta, setMeta] = useState<AssetMeta | null>(null);

  useEffect(() => {
    setMeta(null);
    if (!assetRef) return;
    let cancelled = false;
    client
      .fetch<AssetMeta | null>(
        `*[_id == $ref][0]{
          size,
          "width": metadata.dimensions.width,
          "height": metadata.dimensions.height
        }`,
        { ref: assetRef },
      )
      .then((result) => {
        if (!cancelled) setMeta(result);
      })
      // the caption is a nicety; a fetch hiccup must not break the input
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [client, assetRef]);

  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      {meta?.width && meta?.height && (
        <Text size={1} muted>
          {Math.round(meta.width)} × {Math.round(meta.height)} px
          {typeof meta.size === 'number' && ` · ${formatBytes(meta.size)}`}
        </Text>
      )}
    </Stack>
  );
}
