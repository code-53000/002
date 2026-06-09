<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AllocateInventoryRequest;
use App\Http\Requests\StockInRequest;
use App\Http\Requests\StoreInventoryRequest;
use App\Http\Requests\UpdateInventoryRequest;
use App\Models\CleaningItem;
use App\Models\Collection;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\ReservationItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Inventory::with(['style', 'size', 'stockedBy', 'collection']);

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        if ($request->has('available')) {
            $query->available();
        }

        if ($request->has('style_id')) {
            $query->byStyle($request->style_id);
        }

        if ($request->has('size_id')) {
            $query->bySize($request->size_id);
        }

        if ($request->has('gender')) {
            $query->byGender($request->gender);
        }

        if ($request->has('location')) {
            $query->where('location', $request->location);
        }

        if ($request->has('shelf')) {
            $query->where('shelf', $request->shelf);
        }

        $inventory = $query->orderBy('stocked_at', 'desc')->paginate($request->per_page ?? 15);

        return response()->json($inventory);
    }

    public function store(StoreInventoryRequest $request)
    {
        $sku = 'INV-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));

        $inventory = Inventory::create([
            ...$request->validated(),
            'sku' => $sku,
            'stocked_by' => auth()->id(),
            'status' => Inventory::STATUS_AVAILABLE,
        ]);

        $inventory->collection->update([
            'status' => Collection::STATUS_IN_STOCK,
        ]);

        InventoryLog::create([
            'inventory_id' => $inventory->id,
            'collection_id' => $inventory->collection_id,
            'action' => InventoryLog::ACTION_STOCK_IN,
            'old_status' => Collection::STATUS_CLEANED,
            'new_status' => Inventory::STATUS_AVAILABLE,
            'reason' => '入库',
            'performed_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Inventory created successfully',
            'inventory' => $inventory->load(['style', 'size', 'stockedBy']),
        ], 201);
    }

    public function show(Inventory $inventory)
    {
        return response()->json([
            'inventory' => $inventory->load([
                'style',
                'size',
                'stockedBy',
                'collection',
                'cleaningBatch',
                'reservationItems.reservation',
                'inventoryLogs.performedBy',
                'sizeChanges',
                'scrapRecords',
            ]),
        ]);
    }

    public function update(UpdateInventoryRequest $request, Inventory $inventory)
    {
        $inventory->update($request->validated());

        return response()->json([
            'message' => 'Inventory updated successfully',
            'inventory' => $inventory->load(['style', 'size', 'stockedBy']),
        ]);
    }

    public function destroy(Inventory $inventory)
    {
        $inventory->delete();

        return response()->json([
            'message' => 'Inventory deleted successfully',
        ]);
    }

    public function stockIn(StockInRequest $request)
    {
        $stockedAt = $request->stocked_at ?? now();
        $location = $request->location;
        $shelf = $request->shelf;
        $created = 0;

        foreach ($request->cleaning_item_ids as $cleaningItemId) {
            $cleaningItem = CleaningItem::with('collection')->find($cleaningItemId);

            if (! $cleaningItem || ! $cleaningItem->canStock()) {
                continue;
            }

            $existingInventory = Inventory::where('collection_id', $cleaningItem->collection_id)->exists();

            if ($existingInventory) {
                continue;
            }

            $sku = 'INV-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));

            $inventory = Inventory::create([
                'sku' => $sku,
                'collection_id' => $cleaningItem->collection_id,
                'cleaning_batch_id' => $cleaningItem->batch_id,
                'style_id' => $cleaningItem->collection->style_id,
                'size_id' => $cleaningItem->collection->size_id,
                'gender' => $cleaningItem->collection->gender,
                'location' => $location,
                'shelf' => $shelf,
                'status' => Inventory::STATUS_AVAILABLE,
                'stocked_by' => auth()->id(),
                'stocked_at' => $stockedAt,
            ]);

            $cleaningItem->collection->update([
                'status' => Collection::STATUS_IN_STOCK,
            ]);

            InventoryLog::create([
                'inventory_id' => $inventory->id,
                'collection_id' => $cleaningItem->collection_id,
                'action' => InventoryLog::ACTION_STOCK_IN,
                'old_status' => Collection::STATUS_CLEANED,
                'new_status' => Inventory::STATUS_AVAILABLE,
                'reason' => '批量入库',
                'performed_by' => auth()->id(),
            ]);

            $created++;
        }

        return response()->json([
            'message' => "Stocked in {$created} items successfully",
            'created_count' => $created,
        ]);
    }

    public function allocate(AllocateInventoryRequest $request)
    {
        $reservationItem = ReservationItem::find($request->reservation_item_id);
        $inventory = Inventory::find($request->inventory_id);

        if (! $reservationItem || ! $reservationItem->canAllocate()) {
            return response()->json([
                'message' => 'This reservation item cannot be allocated',
            ], 400);
        }

        if (! $inventory || ! $inventory->canAllocate()) {
            return response()->json([
                'message' => 'This inventory item cannot be allocated',
            ], 400);
        }

        $oldStatus = $inventory->status;

        $reservationItem->update([
            'inventory_id' => $inventory->id,
            'status' => ReservationItem::STATUS_ALLOCATED,
        ]);

        $inventory->update([
            'status' => Inventory::STATUS_RESERVED,
        ]);

        InventoryLog::create([
            'inventory_id' => $inventory->id,
            'action' => InventoryLog::ACTION_ALLOCATE,
            'old_status' => $oldStatus,
            'new_status' => Inventory::STATUS_RESERVED,
            'reason' => '分配预约',
            'performed_by' => auth()->id(),
            'notes' => "预约单号: {$reservationItem->reservation->reservation_no}",
        ]);

        return response()->json([
            'message' => 'Inventory allocated successfully',
            'reservation_item' => $reservationItem->load(['inventory', 'style', 'size']),
            'inventory' => $inventory->fresh(),
        ]);
    }

    public function summary(Request $request)
    {
        $summary = Inventory::query()
            ->selectRaw('style_id, size_id, status, COUNT(*) as count')
            ->groupBy('style_id', 'size_id', 'status')
            ->with('style', 'size')
            ->get();

        return response()->json([
            'summary' => $summary,
            'total_available' => Inventory::available()->count(),
            'total_reserved' => Inventory::byStatus(Inventory::STATUS_RESERVED)->count(),
            'total_distributed' => Inventory::byStatus(Inventory::STATUS_DISTRIBUTED)->count(),
            'total_scrapped' => Inventory::byStatus(Inventory::STATUS_SCRAPPED)->count(),
        ]);
    }
}
