<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryLog extends Model
{
    use HasFactory;

    const ACTION_STOCK_IN = 'stock_in';
    const ACTION_STOCK_OUT = 'stock_out';
    const ACTION_STATUS_CHANGE = 'status_change';
    const ACTION_ALLOCATE = 'allocate';
    const ACTION_DISTRIBUTE = 'distribute';
    const ACTION_RETURN = 'return';
    const ACTION_SIZE_CHANGE = 'size_change';
    const ACTION_SCRAP = 'scrap';

    protected $fillable = [
        'inventory_id',
        'collection_id',
        'action',
        'old_status',
        'new_status',
        'reason',
        'performed_by',
        'notes',
    ];

    public function inventory()
    {
        return $this->belongsTo(Inventory::class, 'inventory_id');
    }

    public function collection()
    {
        return $this->belongsTo(Collection::class, 'collection_id');
    }

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeByInventory($query, $inventoryId)
    {
        return $query->where('inventory_id', $inventoryId);
    }

    public function scopeByCollection($query, $collectionId)
    {
        return $query->where('collection_id', $collectionId);
    }

    public function scopeRecent($query, $limit = 20)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }
}
