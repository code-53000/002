<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Collection extends Model
{
    use HasFactory, SoftDeletes;

    const GENDER_MALE = 'male';
    const GENDER_FEMALE = 'female';
    const GENDER_UNISEX = 'unisex';

    const CONDITION_NEW = 'new';
    const CONDITION_GOOD = 'good';
    const CONDITION_FAIR = 'fair';
    const CONDITION_POOR = 'poor';

    const STATUS_PENDING_CLEANING = 'pending_cleaning';
    const STATUS_IN_CLEANING = 'in_cleaning';
    const STATUS_CLEANED = 'cleaned';
    const STATUS_IN_STOCK = 'in_stock';
    const STATUS_DISTRIBUTED = 'distributed';
    const STATUS_SCRAPPED = 'scrapped';

    protected $fillable = [
        'collection_no',
        'style_id',
        'size_id',
        'gender',
        'condition',
        'defects',
        'source_grade',
        'source_class',
        'donor_name',
        'donor_contact',
        'collected_by',
        'collected_at',
        'status',
        'inspection_notes',
        'inspected_by',
        'inspected_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'collected_at' => 'datetime',
            'inspected_at' => 'datetime',
        ];
    }

    public function style()
    {
        return $this->belongsTo(UniformStyle::class, 'style_id');
    }

    public function size()
    {
        return $this->belongsTo(UniformSize::class, 'size_id');
    }

    public function collectedBy()
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    public function inspectedBy()
    {
        return $this->belongsTo(User::class, 'inspected_by');
    }

    public function cleaningItems()
    {
        return $this->hasMany(CleaningItem::class, 'collection_id');
    }

    public function inventory()
    {
        return $this->hasOne(Inventory::class, 'collection_id');
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class, 'collection_id');
    }

    public function sizeChanges()
    {
        return $this->hasMany(SizeChange::class, 'collection_id');
    }

    public function scrapRecords()
    {
        return $this->hasMany(ScrapRecord::class, 'collection_id');
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

    public function scopePendingInspection($query)
    {
        return $query->whereNull('inspected_by');
    }

    public function canInspect()
    {
        return $this->status === self::STATUS_PENDING_CLEANING && $this->inspected_by === null;
    }

    public function canAddToBatch()
    {
        return $this->status === self::STATUS_PENDING_CLEANING && $this->inspected_by !== null;
    }
}
