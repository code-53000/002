<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inventory extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'inventory';

    const GENDER_MALE = 'male';
    const GENDER_FEMALE = 'female';
    const GENDER_UNISEX = 'unisex';

    const STATUS_AVAILABLE = 'available';
    const STATUS_RESERVED = 'reserved';
    const STATUS_DISTRIBUTED = 'distributed';
    const STATUS_RETURNED = 'returned';
    const STATUS_SCRAPPED = 'scrapped';

    protected $fillable = [
        'sku',
        'collection_id',
        'cleaning_batch_id',
        'style_id',
        'size_id',
        'gender',
        'location',
        'shelf',
        'status',
        'qr_code',
        'stocked_by',
        'stocked_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'stocked_at' => 'datetime',
        ];
    }

    public function collection()
    {
        return $this->belongsTo(Collection::class, 'collection_id');
    }

    public function cleaningBatch()
    {
        return $this->belongsTo(CleaningBatch::class, 'cleaning_batch_id');
    }

    public function style()
    {
        return $this->belongsTo(UniformStyle::class, 'style_id');
    }

    public function size()
    {
        return $this->belongsTo(UniformSize::class, 'size_id');
    }

    public function stockedBy()
    {
        return $this->belongsTo(User::class, 'stocked_by');
    }

    public function reservationItems()
    {
        return $this->hasMany(ReservationItem::class, 'inventory_id');
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class, 'inventory_id');
    }

    public function sizeChanges()
    {
        return $this->hasMany(SizeChange::class, 'inventory_id');
    }

    public function scrapRecords()
    {
        return $this->hasMany(ScrapRecord::class, 'inventory_id');
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', self::STATUS_AVAILABLE);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByStyle($query, $styleId)
    {
        return $query->where('style_id', $styleId);
    }

    public function scopeBySize($query, $sizeId)
    {
        return $query->where('size_id', $sizeId);
    }

    public function scopeByGender($query, $gender)
    {
        return $query->where('gender', $gender);
    }

    public function canAllocate()
    {
        return $this->status === self::STATUS_AVAILABLE;
    }

    public function canDistribute()
    {
        return $this->status === self::STATUS_RESERVED;
    }

    public function canScrap()
    {
        return in_array($this->status, [self::STATUS_AVAILABLE, self::STATUS_RETURNED]);
    }
}
