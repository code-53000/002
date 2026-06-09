<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSizeChangeRequest;
use App\Models\Collection;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\SizeChange;
use Illuminate\Http\Request;

class SizeChangeController extends Controller
{
    public function index(Request $request)
    {
        $query = SizeChange::with(['collection', 'inventory', 'originalSize', 'newSize', 'performedBy']);

        if ($request->has('collection_id')) {
            $query->byCollection($request->collection_id);
        }

        if ($request->has('inventory_id')) {
            $query->byInventory($request->inventory_id);
        }

        $sizeChanges = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json($sizeChanges);
    }

    public function store(StoreSizeChangeRequest $request)
    {
        $sizeChange = SizeChange::create([
            ...$request->validated(),
            'performed_by' => auth()->id(),
        ]);

        if ($request->collection_id) {
            $collection = Collection::find($request->collection_id);
            if ($collection) {
                $oldSizeId = $collection->size_id;
                $collection->update(['size_id' => $request->new_size_id]);

                if ($collection->inventory) {
                    $collection->inventory->update(['size_id' => $request->new_size_id]);

                    InventoryLog::create([
                        'inventory_id' => $collection->inventory->id,
                        'collection_id' => $request->collection_id,
                        'action' => InventoryLog::ACTION_SIZE_CHANGE,
                        'reason' => $request->reason,
                        'performed_by' => auth()->id(),
                        'notes' => $request->notes,
                    ]);
                }
            }
        }

        return response()->json([
            'message' => 'Size change recorded successfully',
            'size_change' => $sizeChange->load(['collection', 'inventory', 'originalSize', 'newSize', 'performedBy']),
        ], 201);
    }

    public function show(SizeChange $sizeChange)
    {
        return response()->json([
            'size_change' => $sizeChange->load(['collection', 'inventory', 'originalSize', 'newSize', 'performedBy']),
        ]);
    }

    public function destroy(SizeChange $sizeChange)
    {
        $sizeChange->delete();

        return response()->json([
            'message' => 'Size change record deleted successfully',
        ]);
    }
}
