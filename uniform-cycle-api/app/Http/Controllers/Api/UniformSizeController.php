<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUniformSizeRequest;
use App\Http\Requests\UpdateUniformSizeRequest;
use App\Models\UniformSize;
use Illuminate\Http\Request;

class UniformSizeController extends Controller
{
    public function index(Request $request)
    {
        $query = UniformSize::with('createdBy');

        if ($request->has('active')) {
            $query->active();
        }

        if ($request->has('group')) {
            $query->byGroup($request->group);
        }

        $sizes = $query->sorted()->paginate($request->per_page ?? 15);

        return response()->json($sizes);
    }

    public function store(StoreUniformSizeRequest $request)
    {
        $size = UniformSize::create([
            ...$request->validated(),
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Size created successfully',
            'size' => $size->load('createdBy'),
        ], 201);
    }

    public function show(UniformSize $uniformSize)
    {
        return response()->json([
            'size' => $uniformSize->load('createdBy', 'collections', 'inventory'),
        ]);
    }

    public function update(UpdateUniformSizeRequest $request, UniformSize $uniformSize)
    {
        $uniformSize->update($request->validated());

        return response()->json([
            'message' => 'Size updated successfully',
            'size' => $uniformSize->load('createdBy'),
        ]);
    }

    public function destroy(UniformSize $uniformSize)
    {
        $uniformSize->delete();

        return response()->json([
            'message' => 'Size deleted successfully',
        ]);
    }
}
