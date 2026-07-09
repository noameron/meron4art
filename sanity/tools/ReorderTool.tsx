import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { icons } from '@sanity/icons';
import {
  Box,
  Card,
  Flex,
  Spinner,
  Stack,
  Tab,
  TabList,
  Text,
  useToast,
} from '@sanity/ui';
import { useClient } from 'sanity';
import type { SanityImageSource } from '@sanity/image-url';
import { urlFor } from '../lib/image';
import { apiVersion } from '../env';
import { CATEGORIES } from '../schemaTypes/portfolioItem';
import type { Category, LocalizedString } from '../lib/types';
import { computeReorderPatches } from './computeReorder';

const DragHandleIcon = icons['drag-handle'];

interface ReorderDoc {
  _id: string;
  category: Category;
  artistName?: LocalizedString;
  displayOrder: number;
  image?: SanityImageSource;
}

const QUERY = `*[_type == "portfolioItem"]{ _id, category, artistName, displayOrder, image } | order(displayOrder asc, _createdAt desc)`;

function Row({ doc }: { doc: ReorderDoc }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: doc._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      padding={2}
      radius={2}
      shadow={isDragging ? 3 : 0}
      tone={isDragging ? 'primary' : undefined}
    >
      <Flex align="center" gap={3}>
        <Box
          {...attributes}
          {...listeners}
          style={{ cursor: 'grab', display: 'flex', touchAction: 'none' }}
        >
          <DragHandleIcon />
        </Box>
        {doc.image && (
          // eslint-disable-next-line @next/next/no-img-element -- Studio tool, not a Next page
          <img
            src={urlFor(doc.image).width(60).height(60).fit('crop').url()}
            alt=""
            width={40}
            height={40}
            style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
          />
        )}
        <Stack space={1} style={{ flex: 1 }}>
          <Text size={1} weight="medium">
            {doc.artistName?.en || '(untitled)'}
          </Text>
          <Text size={0} muted>
            displayOrder: {doc.displayOrder}
          </Text>
        </Stack>
      </Flex>
    </Card>
  );
}

export function ReorderTool() {
  const client = useClient({ apiVersion });
  const toast = useToast();
  const [category, setCategory] = useState<Category>(CATEGORIES[0].value);
  const [docs, setDocs] = useState<ReorderDoc[] | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setDocs(null);
    client.fetch<ReorderDoc[]>(QUERY).then(
      (result) => setDocs(result),
      () => {
        toast.push({
          status: 'error',
          title: 'Failed to load portfolio items',
        });
        setDocs([]);
      },
    );
  }, [client, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const categoryDocs = useMemo(
    () => (docs ?? []).filter((d) => d.category === category),
    [docs, category],
  );
  const ids = useMemo(() => categoryDocs.map((d) => d._id), [categoryDocs]);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !docs) return;
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedIds = arrayMove(ids, oldIndex, newIndex);
      const patches = computeReorderPatches(reorderedIds).filter(
        (patch) =>
          docs.find((d) => d._id === patch.id)?.displayOrder !==
          patch.displayOrder,
      );
      if (patches.length === 0) return;

      // optimistic update so the drag feels instant — re-sort by the patched
      // displayOrder so the row actually moves, not just its number
      const nextDisplayOrder = new Map(
        patches.map((p) => [p.id, p.displayOrder]),
      );
      setDocs((prev) =>
        (prev ?? [])
          .map((d) =>
            nextDisplayOrder.has(d._id)
              ? { ...d, displayOrder: nextDisplayOrder.get(d._id)! }
              : d,
          )
          .sort((a, b) => a.displayOrder - b.displayOrder),
      );

      setSaving(true);
      const tx = client.transaction();
      for (const patch of patches) {
        tx.patch(patch.id, { set: { displayOrder: patch.displayOrder } });
      }
      tx.commit()
        .catch(() => {
          toast.push({ status: 'error', title: 'Failed to save new order' });
          load();
        })
        .finally(() => setSaving(false));
    },
    [client, docs, ids, load, toast],
  );

  return (
    <Box padding={4}>
      <Stack space={4}>
        <TabList gap={2}>
          {CATEGORIES.map((c) => (
            <Tab
              key={c.value}
              id={`reorder-tab-${c.value}`}
              aria-controls={`reorder-panel-${c.value}`}
              label={c.title}
              selected={category === c.value}
              onClick={() => setCategory(c.value)}
            />
          ))}
        </TabList>

        {docs === null ? (
          <Flex justify="center" padding={5}>
            <Spinner />
          </Flex>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <Stack space={2}>
                {categoryDocs.map((doc) => (
                  <Row key={doc._id} doc={doc} />
                ))}
                {categoryDocs.length === 0 && (
                  <Text muted size={1}>
                    No items in this category yet.
                  </Text>
                )}
              </Stack>
            </SortableContext>
          </DndContext>
        )}

        {saving && (
          <Text size={1} muted>
            Saving order…
          </Text>
        )}
      </Stack>
    </Box>
  );
}
