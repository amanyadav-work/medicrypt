import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import FormField from '@/components/ui/FormField';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';

const editSchema = z.object({
  name: z.string().min(1, 'Title required'),
  desc: z.string().optional(),
  type: z.enum(['pdf', 'image']),
  file: z.any().optional(),
});

const EditReportDialog = ({ open, setOpen, initialData, onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: initialData?.title || '',
      desc: initialData?.description || '',
      type: initialData?.type || 'pdf',
      file: undefined,
    },
  });

  React.useEffect(() => {
    reset({
      name: initialData?.title || '',
      desc: initialData?.description || '',
      type: initialData?.type || 'pdf',
      file: undefined,
    });
  }, [initialData, reset]);

  const onFormSubmit = async (values) => {
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition"
          aria-label="Edit Report"
        >
          <Pencil size={18} />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Report</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <FormField
            id="name"
            label="Title"
            placeholder="Report Title"
            register={register}
            errors={errors}
            required
            disabled={loading}
          />
          <FormField
            id="desc"
            label="Description"
            placeholder="Report Description"
            register={register}
            errors={errors}
            disabled={loading}
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium mb-1">Type</label>
            <select
              {...register('type')}
              className="px-3 py-2 rounded-lg border bg-background text-foreground"
              disabled={loading}
            >
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
            </select>
            {errors.type && <span className="text-destructive text-xs">{errors.type.message}</span>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium mb-1">Replace File</label>
            <input
              type="file"
              name="file"
              accept={watchType(register) === 'pdf' ? 'application/pdf' : 'image/*'}
              onChange={e => setValue('file', e.target.files[0])}
              disabled={loading}
              className="px-3 py-2 rounded-lg border bg-background text-foreground"
            />
          </div>
          <DialogFooter>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium shadow hover:bg-primary/90 transition text-sm"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Helper to watch type for file input accept
function watchType(register) {
  // This is a workaround for react-hook-form's watch in controlled components
  // You can use useFormContext if you want to refactor for context
  try {
    return register('type').value || 'pdf';
  } catch {
    return 'pdf';
  }
}


export default EditReportDialog;
