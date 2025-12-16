'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGroups, useUpdateGroup, useDeleteGroup } from '@/hooks/useGroups';
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

const COLORS = [
  { name: 'slate', value: '#64748b', label: 'Slate' },
  { name: 'blue', value: '#3b82f6', label: 'Blue' },
  { name: 'red', value: '#ef4444', label: 'Red' },
  { name: 'green', value: '#10b981', label: 'Green' },
  { name: 'purple', value: '#8b5cf6', label: 'Purple' },
  { name: 'orange', value: '#f97316', label: 'Orange' },
];

export default function GroupSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const spaceId = params.spaceId as string;
  const groupId = params.groupId as string;

  const { data: groups, isLoading: isLoadingGroups } = useGroups(spaceId);
  const updateMutation = useUpdateGroup();
  const deleteMutation = useDeleteGroup();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const group = groups?.find((g) => g.id === groupId);

  const [formData, setFormData] = useState({
    name: group?.name || '',
    color: group?.color || '#3b82f6',
  });

  if (isLoadingGroups) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (!group) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Group not found</p>
        </div>
      </PageContainer>
    );
  }

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: groupId,
        data: formData,
      });
      toast.success('Group settings saved');
    } catch (error) {
      toast.error('Error saving settings');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({ id: groupId, spaceId });
      toast.success('Group deleted');
      router.push(`/workspaces/${workspaceId}/spaces/${spaceId}`);
    } catch (error) {
      toast.error('Error deleting group');
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={`${group.name} Settings`}
        description="Manage and customize your group"
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="space-y-4 bg-background border rounded-lg p-6">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Group name"
              />
            </div>

            <div className="space-y-3">
              <Label>Color</Label>
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
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Danger Zone */}
        <TabsContent value="danger" className="space-y-6">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">
                Delete Group
              </h3>
              <p className="text-sm text-red-800 dark:text-red-400">
                This action cannot be undone. The group and all its contents will be permanently deleted.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteMutation.isPending}
            >
              Delete Group
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this group?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The group "{group.name}" and all its
              lists and tasks will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
