'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTaskLists, useUpdateList, useDeleteList } from '@/hooks/useTasks';
import PageContainer from '@/components/page-container';
import { PageHeader } from '@/components/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function ListSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const spaceId = params.spaceId as string;
  const listId = params.listId as string;

  const { data: lists, isLoading: isLoadingLists } = useTaskLists(spaceId);
  const updateMutation = useUpdateList();
  const deleteMutation = useDeleteList();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const list = lists?.find((l) => l.id === listId);

  const [formData, setFormData] = useState({
    name: list?.name || '',
  });

  if (isLoadingLists) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (!list) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground">List bulunamadı</p>
        </div>
      </PageContainer>
    );
  }

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: listId,
        data: formData,
      });
      toast.success('List ayarları kaydedildi');
    } catch (error) {
      toast.error('Ayarlar kaydedilirken hata oluştu');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(listId);
      toast.success('List silindi');
      router.push(
        `/workspaces/${workspaceId}/spaces/${spaceId}`
      );
    } catch (error) {
      toast.error('List silinirken hata oluştu');
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={`${list.name} Ayarları`}
        description="List'inizi yönetin ve özelleştirin"
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="danger">Tehlikeli Alan</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="space-y-4 bg-background border rounded-lg p-6">
            <div className="space-y-2">
              <Label htmlFor="list-name">List Adı</Label>
              <Input
                id="list-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="List adı"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">
                Status Şeması
              </Label>
              <p className="text-xs text-muted-foreground">
                Default: Todo, In Progress, Done
              </p>
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
                List'i Sil
              </h3>
              <p className="text-sm text-red-800 dark:text-red-400">
                Bu işlem geri alınamaz. List ve tüm içeriği kalıcı olarak
                silinecektir.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteMutation.isPending}
            >
              List'i Sil
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>List'i silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. "{list.name}" list'i ve tüm
              görevleri kalıcı olarak silinecektir.
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
