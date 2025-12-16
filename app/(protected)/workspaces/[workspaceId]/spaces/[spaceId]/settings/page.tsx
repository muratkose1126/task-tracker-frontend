'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSpaces, useUpdateSpace, useDeleteSpace } from '@/hooks/useSpaces';
import PageContainer from '@/components/page-container';
import { PageHeader } from '@/components/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

const COLORS = [
  { name: 'slate', value: '#64748b', label: 'Slate' },
  { name: 'blue', value: '#3b82f6', label: 'Mavi' },
  { name: 'red', value: '#ef4444', label: 'Kırmızı' },
  { name: 'green', value: '#10b981', label: 'Yeşil' },
  { name: 'purple', value: '#8b5cf6', label: 'Mor' },
  { name: 'orange', value: '#f97316', label: 'Turuncu' },
];

export default function SpaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const spaceId = params.spaceId as string;

  const { data: spaces, isLoading: isLoadingSpaces } = useSpaces(workspaceId);
  const updateMutation = useUpdateSpace();
  const deleteMutation = useDeleteSpace();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const space = spaces?.find((s) => s.id === spaceId);

  const [formData, setFormData] = useState({
    name: space?.name || '',
    color: space?.color || '#3b82f6',
    visibility: space?.visibility || 'public',
  });

  if (isLoadingSpaces) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (!space) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Space bulunamadı</p>
        </div>
      </PageContainer>
    );
  }

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: spaceId,
        data: {
          name: formData.name,
          color: formData.color,
          visibility: formData.visibility as 'public' | 'private',
        },
      });
      toast.success('Space ayarları kaydedildi');
    } catch (error) {
      toast.error('Ayarlar kaydedilirken hata oluştu');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({ id: spaceId, workspaceId });
      toast.success('Space silindi');
      router.push(`/workspaces/${workspaceId}`);
    } catch (error) {
      toast.error('Space silinirken hata oluştu');
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={`${space.name} Ayarları`}
        description="Space'inizi yönetin ve özelleştirin"
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="visibility">Görünürlük</TabsTrigger>
          <TabsTrigger value="danger">Tehlikeli Alan</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="space-y-4 bg-background border rounded-lg p-6">
            <div className="space-y-2">
              <Label htmlFor="space-name">Space Adı</Label>
              <Input
                id="space-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Space adı"
              />
            </div>

            <div className="space-y-3">
              <Label>Renk</Label>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, color: color.value }))
                    }
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      formData.color === color.value
                        ? 'border-foreground scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Değişiklikleri Kaydet'
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Visibility Tab */}
        <TabsContent value="visibility" className="space-y-6">
          <div className="space-y-4 bg-background border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="space-public" className="text-base font-medium">
                  Public Space
                </Label>
                <p className="text-sm text-muted-foreground">
                  {formData.visibility
                    ? 'Tüm workspace üyeleri bu space\'i görebilir'
                    : 'Yalnızca davet edilen üyeler bu space\'i görebilir'}
                </p>
              </div>
              <Switch
                id="space-public"
                checked={formData.visibility === 'public'}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, visibility: checked ? 'public' : 'private' }))
                }
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Değişiklikleri Kaydet'
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Danger Zone */}
        <TabsContent value="danger" className="space-y-6">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">
                Space'i Sil
              </h3>
              <p className="text-sm text-red-800 dark:text-red-400">
                Bu işlem geri alınamaz. Space ve tüm içeriği kalıcı olarak
                silinecektir.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteMutation.isPending}
            >
              Space'i Sil
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Space'i silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. "{space.name}" space'i ve tüm
              folder'ları, list'leri ve görevleri kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Siliniyor...
              </>
            ) : (
              'Sil'
            )}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
