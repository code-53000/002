<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CleaningItem extends Model
{
    use HasFactory;

    const STATUS_PENDING = 'pending';
    const STATUS_WASHING = 'washing';
    const STATUS_DRYING = 'drying';
    const STATUS_IRONING = 'ironing';
    const STATUS_QUALITY_CHECK = 'quality_check';
    const STATUS_COMPLETED = 'completed';
    const STATUS_DAMAGED = 'damaged';
    const STATUS_SCRAPPED = 'scrapped';

    protected $fillable = [
        'batch_id',
        'collection_id',
        'status',
        'started_at',
        'completed_at',
        'quality_notes',
        'checked_by',
        'checked_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'checked_at' => 'datetime',
        ];
    }

    public function batch()
    {
        return $this->belongsTo(CleaningBatch::class, 'batch_id');
    }

    public function collection()
    {
        return $this->belongsTo(Collection::class, 'collection_id');
    }

    public function checkedBy()
    {
        return $this->belongsTo(User::class, 'checked_by');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByBatch($query, $batchId)
    {
        return $query->where('batch_id', $batchId);
    }

    public function isFinished()
    {
        return in_array($this->status, [self::STATUS_COMPLETED, self::STATUS_DAMAGED, self::STATUS_SCRAPPED]);
    }

    public function canStock()
    {
        return $this->status === self::STATUS_COMPLETED;
    }
}
