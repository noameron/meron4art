import { useCallback, useEffect, useRef, useState } from 'react';
import { icons } from '@sanity/icons';
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Select,
  Spinner,
  Stack,
  Text,
  TextInput,
  useToast,
} from '@sanity/ui';
import { useClient } from 'sanity';
import { apiVersion } from '../env';
import { CATEGORIES } from '../schemaTypes/portfolioItem';
import type { Category } from '../lib/types';

const UploadIcon = icons.upload;
const TrashIcon = icons.trash;

interface PendingItem {
  key: string;
  file: File;
  previewUrl: string;
  category: Category;
  artistNameEn: string;
  artistNameHe: string;
}

let nextKey = 0;

function PendingCard({
  item,
  disabled,
  onChange,
  onRemove,
}: {
  item: PendingItem;
  disabled: boolean;
  onChange: (patch: Partial<PendingItem>) => void;
  onRemove: () => void;
}) {
  return (
    <Card padding={3} radius={2} shadow={1}>
      <Stack space={3}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Studio tool, not a Next page */}
        <img
          src={item.previewUrl}
          alt=""
          style={{
            width: '100%',
            height: 160,
            objectFit: 'cover',
            borderRadius: 4,
          }}
        />
        <Text size={1} muted textOverflow="ellipsis">
          {item.file.name}
        </Text>
        <Select
          value={item.category}
          disabled={disabled}
          onChange={(event) =>
            onChange({ category: event.currentTarget.value as Category })
          }
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.title}
            </option>
          ))}
        </Select>
        <TextInput
          placeholder="Artist name (English)"
          value={item.artistNameEn}
          disabled={disabled}
          onChange={(event) =>
            onChange({ artistNameEn: event.currentTarget.value })
          }
        />
        <TextInput
          placeholder="Artist name (Hebrew)"
          value={item.artistNameHe}
          disabled={disabled}
          onChange={(event) =>
            onChange({ artistNameHe: event.currentTarget.value })
          }
        />
        <Button
          text="Remove"
          icon={TrashIcon}
          mode="ghost"
          tone="critical"
          disabled={disabled}
          onClick={onRemove}
        />
      </Stack>
    </Card>
  );
}

export function BulkUploadTool() {
  const client = useClient({ apiVersion });
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  // tracks every object URL not yet revoked, so a stray navigation away
  // from the tool doesn't leak blob URLs for images that were never
  // removed or published
  const urlsRef = useRef<Set<string>>(new Set());
  const [items, setItems] = useState<PendingItem[]>([]);
  const [publishing, setPublishing] = useState(false);

  const revoke = useCallback((url: string) => {
    URL.revokeObjectURL(url);
    urlsRef.current.delete(url);
  }, []);

  useEffect(() => {
    return () => {
      // intentionally reads .current at cleanup time, not effect-setup
      // time — urlsRef is a mutable accumulator, not a DOM node ref
      // eslint-disable-next-line react-hooks/exhaustive-deps
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const added: PendingItem[] = Array.from(fileList).map((file) => {
      const previewUrl = URL.createObjectURL(file);
      urlsRef.current.add(previewUrl);
      return {
        key: `pending-${nextKey++}`,
        file,
        previewUrl,
        category: CATEGORIES[0].value,
        artistNameEn: '',
        artistNameHe: '',
      };
    });
    setItems((prev) => [...prev, ...added]);
  }, []);

  const removeItem = useCallback(
    (key: string) => {
      setItems((prev) => {
        const target = prev.find((i) => i.key === key);
        if (target) revoke(target.previewUrl);
        return prev.filter((i) => i.key !== key);
      });
    },
    [revoke],
  );

  const updateItem = useCallback((key: string, patch: Partial<PendingItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, ...patch } : i)),
    );
  }, []);

  const publishAll = useCallback(async () => {
    // localizedString requires both languages once one is set, so catch a
    // lopsided artist name here instead of creating an invalid document
    const incomplete = items.find(
      (i) =>
        Boolean(i.artistNameEn.trim()) !== Boolean(i.artistNameHe.trim()),
    );
    if (incomplete) {
      toast.push({
        status: 'warning',
        title: `"${incomplete.file.name}" needs both English and Hebrew artist name, or neither`,
      });
      return;
    }

    setPublishing(true);
    try {
      const uploaded = await Promise.all(
        items.map((item) =>
          client.assets.upload('image', item.file, {
            filename: item.file.name,
          }),
        ),
      );

      const tx = client.transaction();
      items.forEach((item, index) => {
        tx.create({
          _type: 'portfolioItem',
          image: {
            _type: 'image',
            asset: { _type: 'reference', _ref: uploaded[index]._id },
          },
          category: item.category,
          ...(item.artistNameEn.trim()
            ? {
                artistName: {
                  _type: 'localizedString',
                  en: item.artistNameEn.trim(),
                  he: item.artistNameHe.trim(),
                },
              }
            : {}),
          displayOrder: 100,
        });
      });
      await tx.commit();

      toast.push({
        status: 'success',
        title: `Published ${items.length} portfolio item${items.length === 1 ? '' : 's'}`,
      });
      items.forEach((item) => revoke(item.previewUrl));
      setItems([]);
    } catch {
      toast.push({
        status: 'error',
        title: 'Failed to publish — nothing was saved. Try again.',
      });
    } finally {
      setPublishing(false);
    }
  }, [client, items, revoke, toast]);

  return (
    <Box padding={4}>
      <Stack space={4}>
        <Flex align="center" gap={3}>
          <Button
            text="Add Files"
            icon={UploadIcon}
            tone="primary"
            disabled={publishing}
            onClick={() => inputRef.current?.click()}
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => {
              handleFiles(event.target.files);
              event.target.value = '';
            }}
          />
          {items.length > 0 && (
            <Button
              text={
                publishing ? 'Publishing…' : `Publish All (${items.length})`
              }
              tone="positive"
              disabled={publishing}
              onClick={publishAll}
            />
          )}
          {publishing && <Spinner />}
        </Flex>

        {items.length === 0 ? (
          <Text muted size={1}>
            Choose one or more image files to start a batch. Nothing is saved
            until you publish.
          </Text>
        ) : (
          <Grid columns={[1, 2, 3]} gap={3}>
            {items.map((item) => (
              <PendingCard
                key={item.key}
                item={item}
                disabled={publishing}
                onChange={(patch) => updateItem(item.key, patch)}
                onRemove={() => removeItem(item.key)}
              />
            ))}
          </Grid>
        )}
      </Stack>
    </Box>
  );
}
