'use client';

import { use, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import useFetch from '@/hooks/useFetch';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import FormField from './ui/FormField';
import { useRouter } from 'next/navigation';
import FormSelect from './ui/FormSelect';
import * as faceapi from 'face-api.js';
import Loader from './ui/Loader';

export function AuthForm({ className, pathname = 'login', ...props }) {
  const isSignup = pathname === 'signup';
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);

  const [image, setImage] = useState(null);
  const { setUser } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  // Zod schemas
  const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    age: z.coerce.number().int().min(1, 'Age is required'),
    role: z.enum(['patient', 'doctor', 'pharmacist', 'diagnostic'], {
      required_error: 'Role is required',
    }),
    avatar: z.any().refine((files) => files.length === 0 || files.length === 1, {
      message: 'You must upload exactly one image.',
    })
      .refine((files) => {
        return files.length === 0 || files[0].type.startsWith('image/');
      }, {
        message: 'Please upload a valid image file.',
      })
      .refine((files) => files.length > 0, {
        message: 'Photo is required',
      }),
  });

  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
  });

  const formSchema = isSignup ? signupSchema : loginSchema;
  const router = useRouter();



  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const { refetch, isLoading } = useFetch({
    url: `/api/${isSignup ? 'signup' : 'login'}`,
    method: 'POST',
    auto: false,
    withAuth: true,
    onSuccess: (res) => {
      console.log('✅ Logged in:', res);
      setUser(res.user);
      router.push('/dashboard');
    },
    onError: (err) => {
      toast.error(err.message || 'An error occurred');
    },
  });


  const handleFileChange = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadModels = async () => {
      if (modelsLoaded) return;
      try {
        const modelUrl = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights";
        await faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl);
        await faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl);
        await faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl);
        console.log('model loaded')
        setIsModelLoading(false)
        setModelsLoaded(true);
      } catch (err) {
        console.error("Error loading face-api.js models:", err.message);
      }
    };

    loadModels();
  }, []);



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
        const faceDescriptor = detections.descriptor;
        const faceDescriptorArray = Array.from(faceDescriptor);
        toast.success('Face Detection successful!');
        setFaceDescriptor(faceDescriptorArray);
      } else {
        toast.error('No face detected in the image');
        setImage(null);
      }
    } catch (error) {
      console.error('Error during detection:', error);
      toast.error('Error during face recognition');
      setImage(null);
    } finally {
      setIsProcessing(false);
    }
  };


  const onSubmit = async (data) => {
    if ((!faceDescriptor || faceDescriptor.length === 0) && isSignup) {
      toast.error('Please detect your face before submitting');
      return;
    }

    const formData = new FormData();
    const body = {};
    if (isSignup) {
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('name', data.name);
      formData.append('age', data.age);
      formData.append('role', data.role);
      formData.append('faceDescriptor', JSON.stringify(faceDescriptor));

      if (data.avatar && data.avatar.length > 0) {
        formData.append('avatar', data.avatar[0]);
      }
    } else {
      body.email = data.email;
      body.password = data.password;
    }
    refetch({
      payload: isSignup ? formData : body,
    });
  };









  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">
                  {isSignup ? 'Create an account' : 'Welcome back'}
                </h1>
                <p className="text-muted-foreground text-balance">
                  {isSignup
                    ? 'Sign up for an Acme Inc account'
                    : 'Login to your Acme Inc account'}
                </p>
              </div>

              {/* Email */}
              <FormField
                id="email"
                label="Email"
                placeholder="you@example.com"
                register={register}
                errors={errors}
                type="email"
              />

              {/* Password */}
              <FormField
                id="password"
                label="Password"
                placeholder="Your password"
                register={register}
                errors={errors}
                isSecret={true}
              />


              {/* Additional signup fields */}
              {isSignup && (
                <>
                  <div className='flex gap-2'>

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
                  </div>

                  <div className="flex gap-2 items-center">
                    <FormField
                      id="avatar"
                      label="Profile Image"
                      placeholder="Upload your profile image"
                      register={register}
                      errors={errors}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <Button type="button" className='w-[100px]' disabled={isProcessing} onClick={getFaceDescriptor}>
                      {isProcessing ? <Loader /> : "  Detect Image"}
                    </Button>
                  </div>


                  <FormSelect
                    name="role"
                    label="Role"
                    placeholder="Select your role"
                    control={control}
                    options={[
                      { label: 'Patient', value: 'patient' },
                      { label: 'Doctor', value: 'doctor' },
                      { label: 'Pharmacist', value: 'pharmacist' },
                      { label: 'Diagnostic', value: 'diagnostic' },
                    ]}
                    errors={errors}
                    required={true}
                    parentClass="mb-4"
                  />


                </>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isProcessing || isModelLoading}
              >
                {isModelLoading
                  ? 'Loading Models...'
                  : isProcessing
                    ? 'Detecting Face...'
                    : isSignup
                      ? 'Sign up'
                      : isLoading
                        ? 'Logging in...'
                        : 'Login'}
              </Button>


              <div className="text-center text-sm">
                {isSignup ? (
                  <>
                    Already have an account?{' '}
                    <Link href="/login" className="underline underline-offset-4">
                      Login
                    </Link>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="underline underline-offset-4">
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </form>

          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and{' '}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}