<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScrapRecord extends Model
{
    use HasFactory;

    const DISPOSAL_DESTROYED = 'destroyed';
    const DISPOSAL_RECYCLED = 'recycled';
    const DISPOSAL_DONATED = 'donated';
    const DISPOSAL_OTHER = 'other';

    protected $fillable = [
        'collection_id',
        'inventory_id',
        'reason',
        'disposal_method',
        'approved_by',
        'performed_by',
        'notes',
    ];

    public function collection()
    {
        return $this->belongsTo(Collection::class, 'collection_id');
    }

    public function inventory()
    {
        return $this->belongsTo(Inventory::class, 'inventory_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    public function scopeByDisposalMethod($query, $method)
    {
        return $query->where('disposal_method', $method);
    }

    public function scopeByCollection($query, $collectionId)
    {
        return $query->where('collection_id', $collectionId);
    }

    public function scopeByInventory($query, $inventoryId)
    {
        return $query->where('inventory_id', $inventoryId);
    }

    public function scopeRecent($query, $limit = 20)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }
}
