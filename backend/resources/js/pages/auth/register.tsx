import { useState } from 'react';
import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<'job_seeker' | 'employer' | ''>('');

    return (
        <AuthLayout
            title=""
            description=""
        >
            <Head title="Register" />

            {/* STEP 1: ROLE */}
            {step === 1 && (
                <div className="flex flex-col gap-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                            Choose your role
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Select how you'd like to use our platform
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Job Seeker Button */}
                        <button
                            onClick={() => setRole('job_seeker')}
                            className={`group relative flex flex-col items-center gap-4 p-6 rounded-2xl transition-all duration-300 cursor-pointer ${
                                role === 'job_seeker'
                                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-500 shadow-lg shadow-blue-500/20'
                                    : 'bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 hover:border-blue-300 hover:shadow-md'
                            }`}
                        >
                            <div className={`transition-transform duration-300 ${role === 'job_seeker' ? 'scale-110' : 'group-hover:scale-105'}`}>
                                <img 
                                    src="/images/job-seeker.svg" 
                                    alt="Job Seeker" 
                                    className="w-16 h-16 object-contain"
                                />
                            </div>
                            <div className="text-center">
                                <h3 className={`font-semibold text-lg transition-colors ${
                                    role === 'job_seeker' ? 'text-blue-700' : 'text-slate-900 group-hover:text-blue-600'
                                }`}>
                                    Job Seeker
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Find your next opportunity
                                </p>
                            </div>
                            {role === 'job_seeker' && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </button>

                        {/* Employer Button */}
                        <button
                            onClick={() => setRole('employer')}
                            className={`group relative flex flex-col items-center gap-4 p-6 rounded-2xl transition-all duration-300 cursor-pointer ${
                                role === 'employer'
                                    ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-500 shadow-lg shadow-purple-500/20'
                                    : 'bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 hover:border-purple-300 hover:shadow-md'
                            }`}
                        >
                            <div className={`transition-transform duration-300 ${role === 'employer' ? 'scale-110' : 'group-hover:scale-105'}`}>
                                <img 
                                    src="/images/employer.svg" 
                                    alt="Employer" 
                                    className="w-16 h-16 object-contain"
                                />
                            </div>
                            <div className="text-center">
                                <h3 className={`font-semibold text-lg transition-colors ${
                                    role === 'employer' ? 'text-purple-700' : 'text-slate-900 group-hover:text-purple-600'
                                }`}>
                                    Employer
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Hire top talent
                                </p>
                            </div>
                            {role === 'employer' && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    </div>

                    <Button
                        disabled={!role}
                        onClick={() => setStep(2)}
                        className="w-full h-11 rounded-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md hover:shadow-lg"
                    >
                        Continue
                    </Button>
                </div>
            )}

            {/* STEP 2: FORM */}
            {step === 2 && (
                <Form
                    {...store.form()}
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="role" value={role} />

                            <div className="space-y-6">
                                {/* COMMON FIELDS - TWO COLUMNS */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">Name</Label>
                                        <Input 
                                            name="name" 
                                            placeholder="Full name" 
                                            className="h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">Email</Label>
                                        <Input 
                                            name="email" 
                                            type="email"
                                            placeholder="your@email.com"
                                            className="h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                </div>

                                {/* ROLE BASED FIELDS */}

                                {role === 'job_seeker' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">Headline</Label>
                                            <Input 
                                                name="headline" 
                                                placeholder="e.g. Frontend Developer" 
                                                className="h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            />
                                            <InputError message={errors.headline} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">Experience (years)</Label>
                                            <Input 
                                                name="experience_years" 
                                                placeholder="e.g. 2" 
                                                className="h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            />
                                            <InputError message={errors.experience_years} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">Bio</Label>
                                            <Input 
                                                name="bio" 
                                                placeholder="Short bio" 
                                                className="h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            />
                                            <InputError message={errors.bio} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">Location</Label>
                                            <Input 
                                                name="location" 
                                                placeholder="City, Country" 
                                                className="h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            />
                                            <InputError message={errors.location} />
                                        </div>
                                    </div>
                                )}

                                {role === 'employer' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">Company Name</Label>
                                            <Input 
                                                name="company_name" 
                                                placeholder="Your company" 
                                                className="h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            />
                                            <InputError message={errors.company_name} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">Company Website</Label>
                                            <Input 
                                                name="company_website" 
                                                placeholder="https://..." 
                                                className="h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            />
                                            <InputError message={errors.company_website} />
                                        </div>

                                        <div className="col-span-1 md:col-span-2 space-y-1.5">
                                            <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">Company Description</Label>
                                            <Input 
                                                name="company_description" 
                                                placeholder="What does your company do?" 
                                                className="h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            />
                                            <InputError message={errors.company_description} />
                                        </div>
                                    </div>
                                )}

                                {/* PASSWORD FIELDS - TWO COLUMNS */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">Password</Label>
                                        <PasswordInput 
                                            name="password" 
                                            className="h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">Confirm Password</Label>
                                        <PasswordInput 
                                            name="password_confirmation" 
                                            className="h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        />
                                        <InputError message={errors.password_confirmation} />
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="flex gap-3 pt-2">
                                    <Button 
                                        type="submit" 
                                        className="flex-1 h-9 rounded-md font-medium transition-all hover:shadow-md"
                                    >
                                        {processing && <Spinner />}
                                        Create account
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-9 px-6 rounded-md font-medium transition-all hover:bg-muted flex items-center gap-2"
                                        onClick={() => setStep(1)}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Back
                                    </Button>
                                </div>
                            </div>

                            <div className="text-center text-sm text-muted-foreground pt-4">
                                Already have an account?{' '}
                                <TextLink href={login()}>
                                    Log in
                                </TextLink>
                            </div>
                        </>
                    )}
                </Form>
            )}
        </AuthLayout>
    );
}
