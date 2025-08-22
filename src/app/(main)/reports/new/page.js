'use client'


import React, { useState } from 'react';
import useFetch from '@/hooks/useFetch';
import FormField from '@/components/ui/FormField';
import FormSelect from '@/components/ui/FormSelect';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

const schema = z.object({
    name: z.string().min(2, 'Name is required'),
    desc: z.string().min(2, 'Description is required'),
    type: z.enum(['pdf', 'image'], { required_error: 'File type is required' }),
    file: z.any().refine((file) => file instanceof File, {
        message: 'Please select a file',
    }),
});

const UploadReport = () => {
    const { data, error, isLoading, refetch } = useFetch({
        url: '/api/reports/upload',
        method: 'POST',
        auto: false,
        payload: null,
        onSuccess: () => { },
        onError: (err) => { },
    });

    const router = useRouter()

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            desc: '',
            type: 'pdf',
            file: undefined,
        },
    });

    const fileType = watch('type');

    const onSubmit = async (values) => {
        const formData = new FormData();
        formData.append('file', values.file);
        formData.append('type', values.type);
        formData.append('name', values.name);
        formData.append('desc', values.desc);
        await refetch({
            payload: formData,
            onSuccess: (data) => {
                console.log('File uploaded successfully:', data);
                router.replace(`/reports/${data.id}`);
            },
            onError: (error) => {
                console.error('File upload failed:', error);
            }
        });
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh] pt-10">
            <Card className="w-full max-w-md p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-8 text-center 
               bg-gradient-to-r 
               from-green-500 via-emerald-500 to-teal-500 
               dark:from-lime-400 dark:via-green-400 dark:to-emerald-300 
               bg-clip-text text-transparent drop-shadow-sm">
                    Upload Reports
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <FormField
                                {...field}
                                id="name"
                                label="Report Name"
                                type="text"
                                errors={errors}
                                parentClass="mb-2"
                                required
                            />
                        )}
                    />
                    <Controller
                        name="desc"
                        control={control}
                        render={({ field }) => (
                            <FormField
                                {...field}
                                id="desc"
                                label="Description"
                                type="text"
                                errors={errors}
                                parentClass="mb-2"
                                required
                            />
                        )}
                    />
                    <FormSelect
                        name="type"
                        label="File Type"
                        options={[
                            { value: 'pdf', label: 'PDF' },
                            { value: 'image', label: 'Image' }
                        ]}
                        control={control}
                        errors={errors}
                        parentClass="mb-2"
                        required
                        placeholder="Select file type"
                    />
                    <Controller
                        name="file"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <FormField
                                id="file"
                                label="Choose File"
                                type="file"
                                accept={fileType === 'pdf' ? 'application/pdf' : 'image/*'}
                                errors={errors}
                                parentClass="mb-2"
                                onChange={e => {
                                    setValue('file', e.target.files[0]);
                                }}
                            />
                        )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 dark:from-green-300 dark:via-emerald-300 dark:to-teal-300 text-white hover:opacity-90 shadow-md shadow-emerald-400/20">
                        {isLoading ? 'Uploading...' : 'Upload'}
                    </Button>

                </form>
                {error && <div className="mt-4 text-center text-destructive text-sm">{error}</div>}
                {data && <div className="mt-4 text-center text-success text-sm">File uploaded: {data.url || 'Success'}</div>}
            </Card>
        </div>
    );
};

export default UploadReport;