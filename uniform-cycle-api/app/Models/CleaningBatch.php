<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CleaningBatch extends Model
{
    use HasFactory, SoftDeletes;

    const STATUS_PENDING = 'pending';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'batch_no',
        'laundry_partner',
        'laundry_contact',
        'received_at',
        'started_at',
        'completed_at',
        'total_count',
        'cleaned_count',
        'damaged_count',
        'status',
        'washing_method',
        'disinfection_method',
        'created_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'received_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(CleaningItem::class, 'batch_id');
    }

    public function inventory()
    {
        return $this->hasMany(Inventory::class, 'cleaning_batch_id');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', self::STATUS_IN_PROGRESS);
    }

    public function canAddItems()
    {
        return $this->status === self::STATUS_PENDING || $this->status === self::STATUS_IN_PROGRESS;
    }

    public function canStart()
    {
        return $this->status === self::STATUS_PENDING && $this->items()->count() > 0;
    }

    public function canComplete()
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    public function updateCounts()
    {
        $items = $this->items();
        $this->total_count = $items->count();
        $this->cleaned_count = $items->where('status', CleaningItem::STATUS_COMPLETED)->count();
        $this->damaged_count = $items->whereIn('status', [CleaningItem::STATUS_DAMAGED, CleaningItem::STATUS_SCRAPPED])->count();
        $this->save();
    }
}
