<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreScrapRecordRequest;
use App\Models\Collection;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\ScrapRecord;
use Illuminate\Http\Request;

class ScrapRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = ScrapRecord::with(['collection', 'inventory', 'approvedBy', 'performedBy']);

        if ($request->has('disposal_method')) {
            $query->byDisposalMethod($request->disposal_method);
        }

        if ($request->has('collection_id')) {
            $query->byCollection($request->collection_id);
        }

        if ($request->has('inventory_id')) {
            $query->byInventory($request->inventory_id);
        }

        $scrapRecords = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json($scrapRecords);
    }

    public function store(StoreScrapRecordRequest $request)
    {
        $scrapRecord = ScrapRecord::create([
            ...$request->validated(),
            'approved_by' => auth()->id(),
            'performed_by' => auth()->id(),
        ]);

        if ($request->inventory_id) {
            $inventory = Inventory::find($request->inventory_id);
            if ($inventory && $inventory->canScrap()) {
                $oldStatus = $inventory->status;

                $inventory->update([
                    'status' => Inventory::STATUS_SCRAPPED,
                ]);

                if ($inventory->collection) {
                    $inventory->collection->update([
                        'status' => Collection::STATUS_SCRAPPED,
                    ]);
                }

                InventoryLog::create([
                    'inventory_id' => $inventory->id,
                    'collection_id' => $inventory->collection_id,
                    'action' => InventoryLog::ACTION_SCRAP,
                    'old_status' => $oldStatus,
                    'new_status' => Inventory::STATUS_SCRAPPED,
                    'reason' => $request->reason,
                    'performed_by' => auth()->id(),
                    'notes' => "处理方式: {$request->disposal_method}, {$request->notes}",
                ]);
            }
        } elseif ($request->collection_id) {
            $collection = Collection::find($request->collection_id);
            if ($collection && $collection->status !== Collection::STATUS_SCRAPPED) {
                $oldStatus = $collection->status;

                $collection->update([
                    'status' => Collection::STATUS_SCRAPPED,
                ]);

                InventoryLog::create([
                    'collection_id' => $collection->id,
                    'action' => InventoryLog::ACTION_SCRAP,
                    'old_status' => $oldStatus,
                    'new_status' => Collection::STATUS_SCRAPPED,
                    'reason' => $request->reason,
                    'performed_by' => auth()->id(),
                    'notes' => "处理方式: {$request->disposal_method}, {$request->notes}",
                ]);
            }
        }

        return response()->json([
            'message' => 'Scrap record created successfully',
            'scrap_record' => $scrapRecord->load(['collection', 'inventory', 'approvedBy', 'performedBy']),
        ], 201);
    }

    public function show(ScrapRecord $scrapRecord)
    {
        return response()->json([
            'scrap_record' => $scrapRecord->load(['collection', 'inventory', 'approvedBy', 'performedBy']),
        ]);
    }

    public function destroy(ScrapRecord $scrapRecord)
    {
        $scrapRecord->delete();

        return response()->json([
            'message' => 'Scrap record deleted successfully',
        ]);
    }
}
