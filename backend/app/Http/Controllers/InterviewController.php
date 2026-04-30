<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Interview;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use App\Notifications\InterviewScheduled;
use Inertia\Inertia;

class InterviewController extends Controller
{
    public function create()
    {
        $application = Application::first();

        return Inertia::render('Interview/Schedule', [
            'jobId' => $application?->id,
            'candidateId' => $application?->user_id,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_id' => 'nullable|integer',
            'job_seeker_id' => 'nullable|integer',
            'scheduled_at' => 'required|date'
        ]);

        $meetingLink = $this->generateMeetingLink();
        $application = Application::find($validated['job_id'] ?? null) ?? Application::first();
        $jobSeeker = User::find($validated['job_seeker_id'] ?? null)
            ?? ($application ? User::find($application->user_id) : null)
            ?? User::first();
        $employer = (auth()->check() ? auth()->user() : null) ?? User::first();

        if ($application && $jobSeeker && $employer) {
            $interview = Interview::create([
                'application_id' => $application->id,
                'job_seeker_id' => $jobSeeker->id,
                'employer_id' => $employer->id,
                'scheduled_at' => $validated['scheduled_at'],
                'meeting_link' => $meetingLink,
                'status' => 'scheduled'
            ]);

            // Dummy notification (replace with real users later)
            Notification::route('mail', 'test@example.com')
                ->notify(new InterviewScheduled($interview));
        }

        return redirect()->route('interview.test', ['roomId' => $meetingLink]);
    }

    private function generateMeetingLink()
    {
        return 'herd-interview-' . uniqid();
    }

    public function test(Request $request)
    {
        return Inertia::render('Interview/TestCall', [
            'roomId' => $request->query('roomId', 'herd-interview-test')
        ]);
    }
}
