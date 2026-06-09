<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InspectCollectionRequest;
use App\Http\Requests\StoreCollectionRequest;
use App\Http\Requests\UpdateCollectionRequest;
use App\Models\Collection;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CollectionController extends Controller
{
    public function index(Request $request)
    {
        $query = Collection::with(['style', 'size', 'collectedBy', 'inspectedBy']);

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        if ($request->has('style_id')) {
            $query->byStyle($request->style_id);
        }

        if ($request->has('size_id')) {
            $query->bySize($request->size_id);
        }

        if ($request->has('pending_inspection')) {
            $query->pendingInspection();
        }

        $collections = $query->orderBy('collected_at', 'desc')->paginate($request->per_page ?? 15);

        return response()->json($collections);
    }

    public function store(StoreCollectionRequest $request)
    {
        $collectionNo = 'COL-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));

        $collection = Collection::create([
            ...$request->validated(),
            'collection_no' => $collectionNo,
            'collected_by' => auth()->id(),
            'status' => Collection::STATUS_PENDING_CLEANING,
        ]);

        return response()->json([
            'message' => 'Collection created successfully',
            'collection' => $collection->load(['style', 'size', 'collectedBy']),
        ], 201);
    }

    public function show(Collection $collection)
    {
        return response()->json([
            'collection' => $collection->load([
                'style',
                'size',
                'collectedBy',
                'inspectedBy',
                'cleaningItems.batch',
                'inventory',
                'inventoryLogs',
                'sizeChanges',
                'scrapRecords',
            ]),
        ]);
    }

    public function update(UpdateCollectionRequest $request, Collection $collection)
    {
        $collection->update($request->validated());

        return response()->json([
            'message' => 'Collection updated successfully',
            'collection' => $collection->load(['style', 'size', 'collectedBy']),
        ]);
    }

    public function destroy(Collection $collection)
    {
        $collection->delete();

        return response()->json([
            'message' => 'Collection deleted successfully',
        ]);
    }

    public function inspect(InspectCollectionRequest $request, Collection $collection)
    {
        if (! $collection->canInspect()) {
            return response()->json([
                'message' => 'This collection cannot be inspected',
            ], 400);
        }

        $oldStatus = $collection->status;

        if ($request->pass) {
            $newStatus = Collection::STATUS_PENDING_CLEANING;
        } else {
            $newStatus = Collection::STATUS_SCRAPPED;
        }

        $collection->update([
            'condition' => $request->condition,
            'defects' => $request->defects,
            'inspection_notes' => $request->inspection_notes,
            'inspected_by' => auth()->id(),
            'inspected_at' => now(),
            'status' => $newStatus,
        ]);

        InventoryLog::create([
            'collection_id' => $collection->id,
            'action' => InventoryLog::ACTION_STATUS_CHANGE,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'reason' => $request->pass ? '质检通过' : '质检不通过',
            'performed_by' => auth()->id(),
            'notes' => $request->inspection_notes,
        ]);

        return response()->json([
            'message' => 'Inspection completed successfully',
            'collection' => $collection->load(['style', 'size', 'inspectedBy']),
        ]);
    }
}
