import ScheduleForm from '@/components/Interview/ScheduleForm';

type ScheduleProps = {
    jobId: number;
    candidateId: number;
};

export default function Schedule({ jobId, candidateId }: ScheduleProps) {
    return (
        <div>
            <h1>Schedule Interview</h1>

            <ScheduleForm jobId={jobId} candidateId={candidateId} />
        </div>
    );
}
