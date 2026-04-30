<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cv extends Model
{
    /** @use HasFactory<\Database\Factories\CvFactory> */
    use HasFactory;

    public function experiences()
    {
        return $this->hasMany(CvExperience::class);
    }

    public function educations()
    {
        return $this->hasMany(CvEducation::class);
    }

    public function skills()
    {
        return $this->hasMany(CvSkill::class);
    }

    public function projects()
    {
        return $this->hasMany(CvProject::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
