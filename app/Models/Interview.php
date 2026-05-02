<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Interview extends Model
{
    /** @use HasFactory<\Database\Factories\InterviewFactory> */
    use HasFactory;

    protected $fillable = [
        'application_id',
        'job_seeker_id',
        'employer_id',
        'scheduled_at',
        'meeting_link',
        'status',
    ];
}
