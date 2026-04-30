<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InterviewScheduled extends Notification
{
    use Queueable;

    public $interview;

    public function __construct($interview)
    {
        $this->interview = $interview;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Interview Scheduled')
            ->line('Your interview has been scheduled.')
            ->line('Date: ' . $this->interview->scheduled_at)
            ->action('Join Interview', route('interview.test', [
                'roomId' => $this->interview->meeting_link,
            ]));
    }
}
