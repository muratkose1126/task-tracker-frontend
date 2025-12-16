'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkspaces, useUpdateWorkspace, useDeleteWorkspace } from '@/hooks/useWorkspaces';
import PageContainer, { PageHeader } from '@/components/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useWorkspaces();
  const updateMutation = useUpdateWorkspace();
  const deleteMutation = useDeleteWorkspace();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const workspace = workspaces?.find((w) => w.id === workspaceId);

  const [formData, setFormData] = useState({
    name: workspace?.name || '',
    description: workspace?.description || '',
  });

  if (isLoadingWorkspaces) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (!workspace) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Workspace bulunamadı</p>
        </div>
      </PageContainer>
    );
  }

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: workspaceId,
        data: formData,
      });
      toast.success('Workspace ayarları kaydedildi');
    } catch (error) {
      toast.error('Ayarlar kaydedilirken hata oluştu');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(workspaceId);
      toast.success('Workspace silindi');
      router.push('/workspaces');
    } catch (error) {
      toast.error('Workspace silinirken hata oluştu');
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={`${workspace.name} Ayarları`}
        description="Workspace'inizi yönetin ve kişiselleştirin"
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="members">Üyeler</TabsTrigger>
          <TabsTrigger value="danger">Tehlikeli Alan</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="space-y-4 bg-background border rounded-lg p-6">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Adı</Label>
              <Input
                id="workspace-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Workspace adı"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workspace-description">Açıklama</Label>
              <Textarea
                id="workspace-description"
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Workspace açıklaması (opsiyonel)"
                rows={4}
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

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <div className="bg-background border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Workspace Üyeleri</h3>
            <p className="text-sm text-muted-foreground">
              Üye yönetimi henüz geliştirilmektedir
            </p>
          </div>
        </TabsContent>

        {/* Danger Zone */}
        <TabsContent value="danger" className="space-y-6">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">
                Workspace'i Sil
              </h3>
              <p className="text-sm text-red-800 dark:text-red-400">
                Bu işlem geri alınamaz. Workspace ve tüm içeriği kalıcı olarak
                silinecektir.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteMutation.isPending}
            >
              Workspace'i Sil
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Workspace'i silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. "{workspace.name}" workspace'i ve tüm
              space'leri, folder'ları, list'leri ve görevleri kalıcı olarak
              silinecektir.
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
