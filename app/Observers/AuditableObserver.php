<?php

namespace App\Observers;

use App\Services\AuditLogger;
use Illuminate\Database\Eloquent\Model;

class AuditableObserver
{
    public function created(Model $model): void
    {
        AuditLogger::logModelEvent('created', $model);
    }

    public function updated(Model $model): void
    {
        AuditLogger::logModelEvent('updated', $model);
    }

    public function deleted(Model $model): void
    {
        AuditLogger::logModelEvent('deleted', $model);
    }
}

