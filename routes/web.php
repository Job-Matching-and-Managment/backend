<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\InterviewController;

Route::get('/interview/schedule', [InterviewController::class, 'create'])->name('interview.create');

Route::post('/interview', [InterviewController::class, 'store'])->name('interview.store');

Route::get('/interview/test', [InterviewController::class, 'test'])->name('interview.test');

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
