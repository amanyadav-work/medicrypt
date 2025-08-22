'use client';

import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useFetch from '@/hooks/useFetch';
import FormField from '@/components/ui/FormField';
import FormSelect from '@/components/ui/FormSelect';
import Loader from '@/components/ui/Loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import * as faceapi from 'face-api.js';
import { format } from 'date-fns';

const profileSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.coerce.number().int().min(1, 'Age is required'),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .optional()
        .or(z.literal("")),
    avatar: z.any().refine((files) => files.length === 0 || files.length === 1, {
        message: 'You must upload exactly one image.',
    })
        .refine((files) => {
            return files.length === 0 || files[0].type.startsWith('image/');
        }, {
            message: 'Please upload a valid image file.',
        }),
});

export default function ProfilePage() {
    const { user, setUser } = useUser();
    const [image, setImage] = useState(null);
    const [faceDescriptor, setFaceDescriptor] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    React.useEffect(() => {
        const loadModels = async () => {
            if (modelsLoaded) return;
            try {
                const modelUrl = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights";
                await faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl);
                await faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl);
                await faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl);
                setIsModelLoading(false);
                setModelsLoaded(true);
            } catch (err) {
                toast.error('Error loading face-api.js models');
            }
        };
        loadModels();
    }, [modelsLoaded]);

    const handleFileChange = (e) => {
        setImage(URL.createObjectURL(e.target.files[0]));
    };

    const getFaceDescriptor = async () => {
        if (!image) {
            toast.error('Please choose an image');
            return;
        }
        if (!modelsLoaded) {
            toast.error('Face recognition models are not loaded yet');
            return;
        }
        setIsProcessing(true);
        try {
            const img = await faceapi.fetchImage(image);
            const detections = await faceapi
                .detectSingleFace(img)
                .withFaceLandmarks()
                .withFaceDescriptor();
            if (detections) {
                const faceDescriptorArr = Array.from(detections.descriptor);
                toast.success('Face Detection successful!');
                setFaceDescriptor(faceDescriptorArr);
            } else {
                toast.error('No face detected in the image');
                setImage(null);
            }
        } catch (error) {
            toast.error('Error during face recognition');
            setImage(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            age: user?.age || '',
            password: '',
        },
    });

    const { refetch, isLoading } = useFetch({
        url: '/api/user/patch',
        method: 'PATCH',
        auto: false,
        onSuccess: (res) => {
            setUser(res.user);
            toast.success('Profile updated!');
        },
        onError: (err) => {
            toast.error(err.message || 'An error occurred');
        },
    });

    const onSubmit = async (data) => {
        if (!faceDescriptor || faceDescriptor.length === 0) {
            toast.error('Please detect your face before submitting');
            return;
        }
        const formData = new FormData();
        formData.append('userId', user._id);
        formData.append('name', data.name);
        formData.append('age', data.age);
        if (data.password) formData.append('password', data.password);
        formData.append('faceDescriptor', JSON.stringify(faceDescriptor));
        if (data.avatar && data.avatar.length > 0) {
            formData.append('avatar', data.avatar[0]);
        }
        refetch({ payload: formData });
    };

    return (
        <div className="flex flex-col gap-6 items-center justify-center min-h-[60vh]">
            <Card className="overflow-hidden p-0 w-full max-w-lg">
                <CardContent className="p-8">
                    {!editMode ? (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-2xl font-bold">Profile</h1>
                                <Button variant="ghost" size="icon" onClick={() => setEditMode(true)} aria-label="Edit Profile">
                                    <Pencil size={20} />
                                </Button>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <img src={user?.avatar} alt="Avatar" className="w-16 h-16 rounded-full border object-cover" />
                                    <div>
                                        <div className="font-semibold text-lg">{user?.name}</div>
                                        <div className="text-muted-foreground text-sm">{user?.email}</div>
                                    </div>
                                </div>
                                <div className="flex gap-8 mt-2">
                                    <div className="text-sm"><span className="font-medium">Age:</span> {user?.age}</div>
                                    <div className="text-sm"><span className="font-medium">Role:</span> {user?.role}</div>
                                </div>
                                <div className="flex gap-8 mt-2">
                                    <div className="text-xs text-muted-foreground">
                                        <span className="font-medium">Created:</span> {user?.createdAt ? format(new Date(user.createdAt), 'PPpp') : '-'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        <span className="font-medium">Updated:</span> {user?.updatedAt ? format(new Date(user.updatedAt), 'PPpp') : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-2xl font-bold">Edit Profile</h1>
                                <Button variant="ghost" size="icon" onClick={() => setEditMode(false)} aria-label="Cancel Edit">
                                    Cancel
                                </Button>
                            </div>
                            <FormField
                                id="name"
                                label="Name"
                                placeholder="Your full name"
                                register={register}
                                errors={errors}
                            />
                            <FormField
                                id="age"
                                label="Age"
                                placeholder="Your age"
                                register={register}
                                errors={errors}
                                type="number"
                            />
                            <FormField
                                id="password"
                                label="New Password"
                                placeholder="Leave blank to keep current"
                                register={register}
                                errors={errors}
                                isSecret={true}
                            />
                            <div className="flex gap-2 items-end">
                                <FormField
                                    id="avatar"
                                    label="Profile Image"
                                    placeholder="Upload new profile image"
                                    register={register}
                                    errors={errors}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <Button type="button" className='w-[100px]' disabled={isProcessing} onClick={getFaceDescriptor}>
                                    {isProcessing ? <Loader /> : "Detect Image"}
                                </Button>
                            </div>
                            <div className="flex gap-8 mt-2">
                                <div className="text-xs text-muted-foreground">
                                    <span className="font-medium">Created:</span> {user?.createdAt ? format(new Date(user.createdAt), 'PPpp') : '-'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    <span className="font-medium">Updated:</span> {user?.updatedAt ? format(new Date(user.updatedAt), 'PPpp') : '-'}
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || isProcessing || isModelLoading}
                            >
                                {isModelLoading
                                    ? 'Loading Models...'
                                    : isProcessing
                                        ? 'Detecting Face...'
                                        : isLoading
                                            ? 'Saving...'
                                            : 'Save Changes'}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
