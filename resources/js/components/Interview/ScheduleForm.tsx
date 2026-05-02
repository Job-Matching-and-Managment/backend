import { Form } from '@inertiajs/react';

type ScheduleFormProps = {
    jobId: number;
    candidateId: number;
};

export default function ScheduleForm({ jobId, candidateId }: ScheduleFormProps) {
    return (
        <Form action="/interview" method="post">
            <input type="hidden" name="job_id" value={jobId} />
            <input type="hidden" name="job_seeker_id" value={candidateId} />

            <div>
                <label>Date & Time</label>
                <input type="datetime-local" name="scheduled_at" />
            </div>

            <button type="submit">Schedule Interview</button>
        </Form>
    );
}
